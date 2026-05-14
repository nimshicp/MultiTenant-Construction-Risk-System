# employees/models.py

import uuid

from django.db import models
from django.conf import settings
from django.utils import timezone

from customers.models import Tenant


# ==========================================================
# ROLE CHOICES
# ==========================================================
class Role(models.TextChoices):
    SUPERADMIN = 'SUPERADMIN', 'Super Admin'
    ADMIN = 'ADMIN', 'Admin'
    PROJECT_MANAGER = 'PROJECT_MANAGER', 'Project Manager'
    EMPLOYEE = 'EMPLOYEE', 'Employee'
    VIEWER = 'VIEWER', 'Viewer'


# ==========================================================
# EMPLOYEE MODEL
# ==========================================================
class Employee(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    # Authentication user (stored in public schema)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='employee_profile'
    )

    # Company/Tenant to which this employee belongs
    tenant = models.ForeignKey(
        Tenant,
        on_delete=models.CASCADE,
        related_name='employees'
    )

    # Role within the company
    role = models.CharField(
        max_length=30,
        choices=Role.choices,
        default=Role.EMPLOYEE
    )

    

    department = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    job_title = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    # Reporting manager (self-referencing relationship)
    manager = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='team_members'
    )

    date_joined = models.DateField(
        null=True,
        blank=True
    )

    # Invitation that created this employee (optional)
    invitation = models.OneToOneField(
        'Invitation',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='resulting_employee'
    )

    # Admin who invited this employee
    invited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='invited_employees'
    )

    is_active_employee = models.BooleanField(
        default=True
    )

    is_blocked = models.BooleanField(
        default=False
    )

    block_reason = models.TextField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['tenant', 'user'],
                name='unique_employee_per_tenant'
            )
        ]

    def __str__(self):
        if hasattr(self.user, 'profile'):
            return f"{self.user.profile.full_name} ({self.role})"
        return f"{self.user.email} ({self.role})"


# ==========================================================
# INVITATION MODEL
# ==========================================================
class Invitation(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    # Company issuing the invitation
    tenant = models.ForeignKey(
        Tenant,
        on_delete=models.CASCADE,
        related_name='invitations'
    )

    email = models.EmailField()

    full_name = models.CharField(
        max_length=255
    )

    role = models.CharField(
        max_length=30,
        choices=Role.choices,
        default=Role.EMPLOYEE
    )

    department = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    job_title = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    # Secure invitation token used in email link
    token = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False
    )

    # Admin who sent the invitation
    invited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sent_invitations'
    )

    # Invitation status
    is_accepted = models.BooleanField(
        default=False
    )

    # Link to the created employee (optional)
    accepted_employee = models.OneToOneField(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='source_invitation'
    )

    # Expiration date (usually timezone.now() + 7 days)
    expires_at = models.DateTimeField()

    # Audit field
    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['tenant', 'email'],
                name='unique_invitation_per_tenant'
            )
        ]

    @property
    def is_valid(self):
        return (
            not self.is_accepted and
            self.expires_at > timezone.now()
        )

    def __str__(self):
        return f"{self.email} - {self.role}"