from rest_framework import serializers

class SignupSerializer(serializers.Serializer):
    # Company details
    company_name = serializers.CharField(max_length=255)
    license_number = serializers.CharField(max_length=100)
    state = serializers.CharField(max_length=50)
    company_type = serializers.CharField(max_length=50)
    
    # Manager details
    manager_name = serializers.CharField(max_length=255)
    manager_email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    
    # Subscription
    subscription_plan = serializers.ChoiceField(choices=['starter', 'pro', 'enterprise'])