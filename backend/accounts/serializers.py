from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'username', 'date_joined']


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'username', 'date_joined']


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150, required=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)
    first_name = serializers.CharField(max_length=30, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=30, required=False, allow_blank=True)

    def validate(self, attrs):
        # Check required fields
        required_fields = ['username', 'email', 'password', 'password2']
        for field in required_fields:
            if not attrs.get(field):
                raise serializers.ValidationError({'error': 'All fields are required'})

        # Check password match
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'error': 'Passwords do not match'})

        # Check username uniqueness
        if User.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError({'error': 'Username already exists'})

        # Check email uniqueness
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({'error': 'Email already exists'})

        # Validate password strength
        try:
            validate_password(attrs['password'])
        except ValidationError as e:
            raise serializers.ValidationError({'error': list(e.messages)})

        return attrs

    def create(self, validated_data):
        # Remove password2 from validated data as it's not needed for user creation
        validated_data.pop('password2')
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        
        return user

    def to_representation(self, instance):
        """Custom representation with tokens"""
        refresh = RefreshToken.for_user(instance)
        
        return {
            'message': 'User created successfully',
            'user': {
                'id': instance.id,
                'username': instance.username,
                'email': instance.email,
                'first_name': instance.first_name,
                'last_name': instance.last_name
            },
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token)
            }
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