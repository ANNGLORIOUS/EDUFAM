from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils import timezone
import requests
import logging
from .models import User

from .models import Payment, Message


logger = logging.getLogger(__name__)

# Send SMS notification for fee payment
@shared_task(bind=True, max_retries=3)
def send_payment_sms(self, payment_id, phone_number):
   
    try:
        payment = Payment.objects.get(id=payment_id)
        
        message_text = (
            f"Payment Confirmed!\n"
            f"Student: {payment.student.get_full_name()}\n"
            f"Amount: KES {payment.amount}\n"
            f"Method: {payment.get_payment_method_display()}\n"
            f"Ref: {payment.payment_id[:8]}\n"
            f"Balance: KES {payment.student.fee_account.balance}\n"
            f"Date: {payment.payment_date.strftime('%d/%m/%Y %H:%M')}"
        )
        
        success = send_sms_notification(phone_number, message_text)
        
        if success:
            logger.info(f"Payment SMS sent successfully for payment {payment_id}")
        else:
            logger.error(f"Failed to send payment SMS for payment {payment_id}")
            raise Exception("SMS sending failed")
            
    except Payment.DoesNotExist:
        logger.error(f"Payment {payment_id} not found")
    except Exception as exc:
        logger.error(f"Error sending payment SMS: {exc}")
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))

# Send notification for new message
@shared_task(bind=True, max_retries=3)
def send_message_notification(self, message_id, recipient_id):
   
    try:
        message = Message.objects.select_related(
            'sender', 'thread', 'thread__student'
        ).get(id=message_id)
        
        recipient = User.objects.get(id=recipient_id)
        
        sender_name = message.sender.get_full_name() or message.sender.username
        student_info = f" about {message.thread.student.get_full_name()}" if message.thread.student else ""
        
        if recipient.email and recipient.is_email_verified:
            email_sent = send_message_email(message, recipient)
            if email_sent:
                logger.info(f"Message email sent to {recipient.email}")
        
        if recipient.phone_number and recipient.is_phone_verified:
            sms_text = (
                f"New message from {sender_name}{student_info}:\n"
                f"'{message.content[:100]}{'...' if len(message.content) > 100 else ''}'\n"
                f"Reply via the school app."
            )
            
            sms_sent = send_sms_notification(str(recipient.phone_number), sms_text)
            if sms_sent:
                logger.info(f"Message SMS sent to {recipient.phone_number}")
        
    except (Message.DoesNotExist, User.DoesNotExist) as e:
        logger.error(f"Message or recipient not found: {e}")
    except Exception as exc:
        logger.error(f"Error sending message notification: {exc}")
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))

# Send email notification for new message
@shared_task
def send_message_email(message, recipient):
   
    try:
        sender_name = message.sender.get_full_name() or message.sender.username
        student_info = f" regarding {message.thread.student.get_full_name()}" if message.thread.student else ""
        
        subject = f"New Message from {sender_name}{student_info}"
        
        html_message = render_to_string('emails/message_notification.html', {
            'recipient_name': recipient.get_full_name() or recipient.username,
            'sender_name': sender_name,
            'student_name': message.thread.student.get_full_name() if message.thread.student else None,
            'message_content': message.content,
            'thread_subject': message.thread.subject,
            'created_at': message.created_at,
            'login_url': f"{settings.FRONTEND_URL}/login"
        })
        
        plain_message = render_to_string('emails/message_notification.txt', {
            'recipient_name': recipient.get_full_name() or recipient.username,
            'sender_name': sender_name,
            'student_name': message.thread.student.get_full_name() if message.thread.student else None,
            'message_content': message.content,
            'thread_subject': message.thread.subject,
            'created_at': message.created_at,
            'login_url': f"{settings.FRONTEND_URL}/login"
        })
        
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient.email],
            html_message=html_message,
            fail_silently=False
        )
        
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email to {recipient.email}: {e}")
        return False

# Send SMS notification using SMS provider (e.g., Twilio, Africa's Talking)
@shared_task
def send_sms_notification(phone_number, message_text):
   
    if settings.DEBUG:
        print(f"[DEV] SMS to {phone_number}: {message_text}")
        return True
    try:
        api_key = getattr(settings, 'AFRICAS_TALKING_API_KEY', None)
        username = getattr(settings, 'AFRICAS_TALKING_USERNAME', None)
        
        if not api_key or not username:
            logger.warning("SMS credentials not configured")
            return False
        
        url = "https://api.sandbox.africastalking.com/version1/messaging"
        headers = {
            'apiKey': api_key,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        }
        
        data = {
            'username': username,
            'to': phone_number,
            'message': message_text,
            'from': getattr(settings, 'SMS_SENDER_ID', 'SchoolApp')
        }
        
        response = requests.post(url, headers=headers, data=data, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            if result['SMSMessageData']['Recipients'][0]['status'] == 'Success':
                logger.info(f"SMS sent successfully to {phone_number}")
                return True
            else:
                logger.error(f"SMS failed: {result['SMSMessageData']['Recipients'][0]['status']}")
                return False
        else:
            logger.error(f"SMS API error: {response.status_code} - {response.text}")
            return False
            
    except requests.RequestException as e:
        logger.error(f"Network error sending SMS: {e}")
        return False
    except Exception as e:
        logger.error(f"Error sending SMS to {phone_number}: {e}")
        return False

# Send bulk notifications to multiple recipients
@shared_task
def send_bulk_notification(recipient_ids, message_text, notification_type='sms'):
        
    recipients = User.objects.filter(id__in=recipient_ids)
    success_count = 0
    failed_count = 0
    
    for recipient in recipients:
        try:
            if notification_type == 'sms' and recipient.phone_number:
                success = send_sms_notification(str(recipient.phone_number), message_text)
                if success:
                    success_count += 1
                else:
                    failed_count += 1
            
            elif notification_type == 'email' and recipient.email:
                send_mail(
                    subject="School Notification",
                    message=message_text,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[recipient.email],
                    fail_silently=True
                )
                success_count += 1
                
        except Exception as e:
            logger.error(f"Failed to send notification to {recipient}: {e}")
            failed_count += 1
    
    logger.info(f"Bulk notification completed: {success_count} successful, {failed_count} failed")
    return {'success_count': success_count, 'failed_count': failed_count}


#Send fee payment reminders to parents
@shared_task
def send_fee_reminder(student_ids, days_overdue=7):
  
    from core.models import Student, FeeAccount
    
    students = Student.objects.filter(
        id__in=student_ids,
        is_active=True
    ).select_related('fee_account').prefetch_related('parents__user')
    
    sent_count = 0
    
    for student in students:
        try:
            fee_account = student.fee_account
            if fee_account.balance <= 0:
                continue  
            
            # Send reminder to all parents
            for parent_relation in student.studentparentrelation_set.filter(is_fee_responsible=True):
                parent = parent_relation.parent
                
                if parent.user.phone_number:
                    message_text = (
                        f"Fee Reminder\n"
                        f"Student: {student.get_full_name()}\n"
                        f"Outstanding Balance: KES {fee_account.balance}\n"
                        f"Please make payment to avoid inconvenience.\n"
                        f"For assistance, contact the school."
                    )
                    
                    if send_sms_notification(str(parent.user.phone_number), message_text):
                        sent_count += 1
                
        except Exception as e:
            logger.error(f"Error sending fee reminder for student {student.id}: {e}")
    
    logger.info(f"Fee reminders sent: {sent_count} messages")
    return {'reminders_sent': sent_count}

# Generate attendance report for a class
@shared_task
def generate_attendance_report(class_id, start_date, end_date):
    
    try:
        from core.models import ClassRoom, AttendanceRecord
        from django.db.models import Count, Q
        from datetime import datetime
        
        classroom = ClassRoom.objects.get(id=class_id)
        
        # Convert string dates to date objects
        start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        
        students = classroom.students.filter(is_active=True)
        
        report_data = []
        
        for student in students:
            attendance_records = student.attendance.filter(
                date__range=[start_date, end_date]
            )
            
            total_days = attendance_records.count()
            present_days = attendance_records.filter(status='present').count()
            absent_days = attendance_records.filter(status='absent').count()
            late_days = attendance_records.filter(status='late').count()
            excused_days = attendance_records.filter(status='excused').count()
            
            attendance_percentage = (present_days + late_days + excused_days) / total_days * 100 if total_days > 0 else 0
            
            report_data.append({
                'student_id': student.id,
                'student_name': student.get_full_name(),
                'admission_number': student.admission_number,
                'total_days': total_days,
                'present_days': present_days,
                'absent_days': absent_days,
                'late_days': late_days,
                'excused_days': excused_days,
                'attendance_percentage': round(attendance_percentage, 2)
            })
        
        logger.info(f"Attendance report generated for class {classroom.name}")
        return report_data
        
    except Exception as e:
        logger.error(f"Error generating attendance report: {e}")
        return None


# Notify parents of new grades posted
@shared_task
def send_grade_notification(grade_id):
  
    try:
        from core.models import GradeRecord
        
        grade = GradeRecord.objects.select_related(
            'student', 'subject', 'teacher'
        ).get(id=grade_id)
        
        student = grade.student
        
        for parent_relation in student.studentparentrelation_set.all():
            parent = parent_relation.parent
            
            if parent.user.phone_number:
                message_text = (
                    f"New Grade Posted\n"
                    f"Student: {student.get_full_name()}\n"
                    f"Subject: {grade.subject.name}\n"
                    f"Assessment: {grade.assessment_name}\n"
                    f"Score: {grade.obtained_marks}/{grade.total_marks} ({grade.percentage}%)\n"
                    f"Date: {grade.assessment_date.strftime('%d/%m/%Y')}\n"
                    f"Check the app for details."
                )
                
                send_sms_notification(str(parent.user.phone_number), message_text)
        
        logger.info(f"Grade notifications sent for grade {grade_id}")
        
    except GradeRecord.DoesNotExist:
        logger.error(f"Grade {grade_id} not found")
    except Exception as e:
        logger.error(f"Error sending grade notification: {e}")

# Process M-Pesa payment callback
@shared_task
def process_mpesa_callback(callback_data):
   
    try:
        
        transaction_id = callback_data.get('TransID')
        amount = float(callback_data.get('TransAmount', 0))
        phone_number = callback_data.get('MSISDN')
        mpesa_receipt = callback_data.get('BillRefNumber')
        
        payment = Payment.objects.filter(
            mpesa_receipt=mpesa_receipt,
            status='pending'
        ).first()
        
        if payment:
            payment.status = 'completed'
            payment.transaction_reference = transaction_id
            payment.save()
            
            fee_account = payment.student.fee_account
            fee_account.total_paid += payment.amount
            fee_account.update_balance()
            
            send_payment_sms.delay(payment.id, phone_number)
            
            logger.info(f"M-Pesa payment processed: {transaction_id}")
        else:
            logger.warning(f"Payment not found for M-Pesa receipt: {mpesa_receipt}")
            
    except Exception as e:
        logger.error(f"Error processing M-Pesa callback: {e}")


# Send daily fee reminders for overdue payments
@shared_task
def daily_fee_reminders():
   
    from core.models import FeeAccount
    
    overdue_accounts = FeeAccount.objects.filter(
        balance__gt=0,
        student__is_active=True
    ).select_related('student')
    
    student_ids = [account.student.id for account in overdue_accounts]
    
    if student_ids:
        send_fee_reminder.delay(student_ids)
    
    return f"Fee reminders queued for {len(student_ids)} students"

