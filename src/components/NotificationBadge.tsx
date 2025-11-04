"use client";
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/state/store';
import { fetchUserNotifications, fetchAdminNotifications } from '@/state/notificationSlice';
import { Bell } from 'lucide-react';
import { account } from '@/utils/appwrite';

interface NotificationBadgeProps {
  userType?: 'admin' | 'user';
  className?: string;
}

export default function NotificationBadge({ userType = 'user', className = '' }: NotificationBadgeProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { unreadCount, loading } = useSelector((state: RootState) => state.notifications);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (userType === 'admin') {
          await dispatch(fetchAdminNotifications()).unwrap();
        } else {
          const userData = await account.get();
          await dispatch(fetchUserNotifications(userData.$id)).unwrap();
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
  }, [dispatch, userType]);

  return (
    <div className={`relative inline-block ${className}`}>
      <Bell className="w-6 h-6 text-gray-600 hover:text-gray-800 transition-colors" />
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
      {loading && (
        <div className="absolute -top-2 -right-2 w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      )}
    </div>
  );
} 