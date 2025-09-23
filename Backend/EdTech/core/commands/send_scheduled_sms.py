from django.core.management.base import BaseCommand
from django.utils import timezone
from core.models import SMSCampaign, Student, AuditLog
from core.services.sms_service import send_sms


class Command(BaseCommand):
    help = "Send all scheduled SMS campaigns that are due"

    def handle(self, *args, **kwargs):
        now = timezone.now()
        campaigns = SMSCampaign.objects.filter(status="scheduled", scheduled_at__lte=now)

        if not campaigns.exists():
            self.stdout.write(self.style.WARNING("⚠️ No campaigns to send right now."))
            return

        for campaign in campaigns:
            sent, failed = 0, 0
            students = Student.objects.all()

            for student in students:
                for parent in student.parents.all():
                    if hasattr(parent, "parent_profile") and parent.parent_profile.phone_number:
                        try:
                            send_sms(parent.parent_profile.phone_number, campaign.message)
                            sent += 1
                        except Exception:
                            failed += 1

            campaign.delivery_stats = {"sent": sent, "failed": failed}
            campaign.recipient_count = sent + failed
            campaign.status = "sent"
            campaign.save()

            # 🔹 Log system action (user=None since cron runs it)
            AuditLog.objects.create(
                user=None,
                action="Scheduled SMS Campaign Sent",
                details={
                    "campaign_id": campaign.id,
                    "message": campaign.message[:50],
                    "sent": sent,
                    "failed": failed,
                },
            )

            self.stdout.write(
                self.style.SUCCESS(
                    f"✅ Campaign {campaign.id} sent. Delivered: {sent}, Failed: {failed}."
                )
            )