from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from .serializers import (
    RegisterSerializer, 
    UserProfileSerializer, 
    UserProfileUpdateSerializer
)


class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Register a new user"""
        serializer = RegisterSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                serializer.to_representation(user),
                status=status.HTTP_201_CREATED
            )
        
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get user profile"""
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)
    
    def put(self, request):
        """Update user profile"""
        serializer = UserProfileUpdateSerializer(
            request.user, 
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            
            # Return full user data after update
            user_serializer = UserProfileSerializer(request.user)
            return Response({
                'message': 'Profile updated successfully',
                'user': user_serializer.data
            })
        
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )