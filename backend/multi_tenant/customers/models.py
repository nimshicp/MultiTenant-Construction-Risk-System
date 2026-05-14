import uuid

from django.db import models
from django_tenants.models import TenantMixin, DomainMixin


class Tenant(TenantMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    name = models.TextField()

    # schema_name is inherited from TenantMixin

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    auto_create_schema = True
    auto_drop_schema = False

    def __str__(self):
        return f"{self.name} ({self.schema_name})"


class Domain(DomainMixin):
    def __str__(self):
        return self.domain