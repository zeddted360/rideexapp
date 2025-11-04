"use client";
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/state/store';
import { 
  fetchUserNotifications, 
  fetchAdminNotifications, 
  markNotificationAsRead, 
  deleteNotification,
  markAllNotificationsAsRead 
} from '@/state/notificationSlice';
import { account } from '@/utils/appwrite';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Trash2, Bell } from 'lucide-react';
import { INotificationFetched } from '../../types/types';

interface NotificationListProps {
  userType?: 'admin' | 'user';
  maxNotifications?: number;
}

export default function NotificationList({ userType = 'user', maxNotifications = 10 }: NotificationListProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    adminNotifications, 
    userNotifications, 
    loading, 
    error 
  } = useSelector((state: RootState) => state.notifications);

  const notifications = userType === 'admin' ? adminNotifications : userNotifications;

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

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await dispatch(markNotificationAsRead(notificationId)).unwrap();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await dispatch(deleteNotification(notificationId)).unwrap();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await dispatch(markAllNotificationsAsRead(userType)).unwrap();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const formatNotificationMessage = (notification: INotificationFetched) => {
    switch (notification.type) {
      case 'admin_new_order':
        const adminMessage = `New order #${notification.orderId} from ${notification.customerPhone}`;
        const distanceInfo = notification.deliveryDistance && notification.deliveryDuration 
          ? ` (${notification.deliveryDistance}, ${notification.deliveryDuration})`
          : '';
        return adminMessage + distanceInfo;
      case 'user_order_confirmation':
        const userMessage = `Order confirmed! Delivery at ${notification.deliveryTime}`;
        const userDistanceInfo = notification.deliveryDistance && notification.deliveryDuration 
          ? ` (${notification.deliveryDistance}, ${notification.deliveryDuration})`
          : '';
        return userMessage + userDistanceInfo;
      case 'order_status_update':
        return `Order #${notification.orderId} status updated`;
      case 'delivery_update':
        return `Delivery update for order #${notification.orderId}`;
      default:
        return 'New notification';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-600 text-center py-4">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
          {notifications.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs"
            >
              <Check className="w-4 h-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No notifications
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.slice(0, maxNotifications).map((notification) => (
              <div
                key={notification.$id}
                className={`p-3 rounded-lg border ${
                  notification.status === 'unread' 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {formatNotificationMessage(notification)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(notification.createdAt)}
                    </p>
                    {/* Show additional details for order notifications */}
                    {(notification.type === 'admin_new_order' || notification.type === 'user_order_confirmation') && (
                      <div className="mt-2 space-y-1">
                        {notification.deliveryFee && (
                          <p className="text-xs text-green-600">
                            Delivery Fee: ₦{notification.deliveryFee.toLocaleString()}
                          </p>
                        )}
                        {notification.totalAmount && (
                          <p className="text-xs text-blue-600">
                            Total: ₦{notification.totalAmount.toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}
                    {notification.status === 'unread' && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        New
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    {notification.status === 'unread' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.$id)}
                        className="h-6 w-6 p-0"
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(notification.$id)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 