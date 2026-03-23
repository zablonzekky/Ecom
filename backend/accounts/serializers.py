from rest_framework import serializers
from django.contrib.auth import get_user_model
User = get_user_model()
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken

from .models import ContactMessage, NewsletterSubscription


class NewsletterSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscription
        fields = ["id", "email", "is_active", "created_at"]
        read_only_fields = ["id", "is_active", "created_at"]


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ["id", "name", "email", "message", "created_at"]
        read_only_fields = ["id", "created_at"]


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)
    first_name = serializers.CharField(max_length=30, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=30, required=False, allow_blank=True)

    def validate(self, attrs):
        required_fields = ['email', 'password', 'password2']
        for field in required_fields:
            if not attrs.get(field):
                raise serializers.ValidationError({'error': f'{field} is required'})

        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password2': 'Passwords do not match'})

        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({'email': 'An account with this email already exists'})

        try:
            validate_password(attrs['password'])
        except ValidationError as e:
            raise serializers.ValidationError({'password': list(e.messages)})

        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        return User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )

    def to_representation(self, instance):
        refresh = RefreshToken.for_user(instance)
        return {
            'message': 'User created successfully',
            'user': {
                'id': instance.id,
                'email': instance.email,
                'first_name': instance.first_name,
                'last_name': instance.last_name,
            },
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
        }


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name']

    def validate_email(self, value):
        user = self.context['request'].user
        if User.objects.filter(email=value).exclude(id=user.id).exists():
            raise serializers.ValidationError('Email already in use')
        return value