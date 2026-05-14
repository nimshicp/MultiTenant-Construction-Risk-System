from django.contrib import admin

# Register your models here.
from .models import (
    CurrentSubscription,
    SubscriptionAuditLog,
)
admin.site.register(CurrentSubscription)
admin.site.register(SubscriptionAuditLog)