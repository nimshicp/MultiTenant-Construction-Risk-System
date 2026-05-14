# employee/serializers.py

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

from rest_framework import serializers

from .models import Invitation, Role

User = get_user_model()


# ==========================================================
# INVITE EMPLOYEE SERIALIZER
# Used by Company Admin to send invitations
# ==========================================================
class InviteEmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invitation
        fields = [
            'full_name',
            'email',
            'role',
            'department',
            'job_title',
        ]

    def validate_email(self, value):
        """
        Normalize email to lowercase.
        """
        email = value.strip().lower()

        # Optional: prevent inviting an already registered user
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError(
                "A user with this email already exists."
            )

        return email

    def validate_role(self, value):
        """
        Prevent non-superadmins from inviting SUPERADMIN users.
        """
        request = self.context.get('request')

        if (
            value == Role.SUPERADMIN and
            request and
            hasattr(request.user, 'employee_profile') and
            request.user.employee_profile.role != Role.SUPERADMIN
        ):
            raise serializers.ValidationError(
                "You do not have permission to invite a Super Admin."
            )

        return value

    def validate(self, attrs):
        """
        Prevent duplicate pending invitations for the same tenant and email.
        """
        request = self.context.get('request')

        if request and hasattr(request, 'tenant'):
            email = attrs.get('email').strip().lower()

            existing_invitation = Invitation.objects.filter(
                tenant=request.tenant,
                email=email,
                is_accepted=False
            ).exists()

            if existing_invitation:
                raise serializers.ValidationError(
                    "A pending invitation already exists for this email."
                )

        return attrs


# ==========================================================
# ACCEPT INVITATION SERIALIZER
# Used by invited employee to set password
# ==========================================================
class AcceptInvitationSerializer(serializers.Serializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    confirm_password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    def validate(self, attrs):
        """
        Ensure passwords match and satisfy Django password validators.
        """
        password = attrs.get('password')
        confirm_password = attrs.get('confirm_password')

        if password != confirm_password:
            raise serializers.ValidationError(
                "Passwords do not match."
            )

        # Use Django's built-in password validators
        validate_password(password)

        return attrs


# ==========================================================
# INVITATION DETAIL SERIALIZER
# Used to display invitation information before acceptance
# ==========================================================
class InvitationDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invitation
        fields = [
            'full_name',
            'email',
            'role',
            'department',
            'job_title',
            'expires_at',
            'is_accepted',
        ]
        read_only_fields = fields