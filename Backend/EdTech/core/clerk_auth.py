# core/clerk_auth.py
from rest_framework import authentication, exceptions
from django.contrib.auth import get_user_model
import logging

logger = logging.getLogger(__name__)

User = get_user_model()

class ClerkJWTAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        # Log the clerk_user content
        logger.info(f"clerk_user: {request.clerk_user}")
        
        # Check if Clerk middleware has set request.clerk_user
        if not hasattr(request, 'clerk_user') or not request.clerk_user:
            logger.warning("No clerk_user or empty clerk_user")
            return None  # Let DRF handle unauthenticated requests

        # Ensure clerk_user is a dict and has expected structure
        if not isinstance(request.clerk_user, dict):
            logger.error(f"Invalid clerk_user type: {type(request.clerk_user)}")
            raise exceptions.AuthenticationFailed("Invalid clerk_user type")

        # Get clerk_id from 'id' or 'decoded_token.sub'
        clerk_id = request.clerk_user.get('id') or request.clerk_user.get('decoded_token', {}).get('sub')
        if not clerk_id:
            logger.error(f"Missing clerk_id in clerk_user: {request.clerk_user}")
            raise exceptions.AuthenticationFailed("Missing user ID in clerk_user")

        # Get email from decoded_token
        email = request.clerk_user.get('decoded_token', {}).get('email', '')

        try:
            # Sync user to Django User model
            user, _ = User.objects.get_or_create(
                clerk_id=clerk_id,
                defaults={
                    'username': email or f'user_{clerk_id}',
                    'email': email,
                    'user_type': 'parent',
                },
            )
            return (user, None)  # Set request.user
        except Exception as e:
            logger.error(f"User sync failed: {str(e)}")
            raise exceptions.AuthenticationFailed(f"User sync failed: {str(e)}")