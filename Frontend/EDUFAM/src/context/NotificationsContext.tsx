import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

export interface NotificationItem {
  id: number;
  message: string;
  date: string;
  event: string;
  description: string;
  extra: string;
  start: string;
  end: string;
}

export type UserType = 'teacher' | 'parent' | 'admin' | 'student';

interface NotificationsContextType {
  getDismissedNotifications: (userType: UserType, userEmail?: string) => number[];
  dismissNotification: (id: number, userType: UserType, userEmail?: string) => void;
  clearExpiredDismissals: (notifications: NotificationItem[], userType: UserType, userEmail?: string) => void;
  getUserSpecificNotifications: (notifications: NotificationItem[], userType: UserType, userEmail?: string) => NotificationItem[];
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

interface NotificationsProviderProps {
  children: ReactNode;
}

// Helper function to get storage key for specific user type and email
const getStorageKey = (userType: UserType, userEmail?: string) => {
  if (userEmail) {
    return `edufam_dismissed_notifications_${userType}_${userEmail}`;
  }
  return `edufam_dismissed_notifications_${userType}`;
};

export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({ children }) => {

  // Get dismissed notifications for a specific user type and email
  const getDismissedNotifications = (userType: UserType, userEmail?: string): number[] => {
    const storageKey = getStorageKey(userType, userEmail);
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : [];
  };

  // Dismiss a notification for a specific user type and email
  const dismissNotification = (id: number, userType: UserType, userEmail?: string) => {
    const storageKey = getStorageKey(userType, userEmail);
    const currentDismissed = getDismissedNotifications(userType, userEmail);
    
    console.log('NotificationsContext - Dismissing notification:', { id, userType, userEmail, storageKey });
    console.log('NotificationsContext - Current dismissed:', currentDismissed);
    
    if (!currentDismissed.includes(id)) {
      const updated = [...currentDismissed, id];
      localStorage.setItem(storageKey, JSON.stringify(updated));
      console.log('NotificationsContext - Updated dismissed:', updated);
    }
  };

  // Clear expired dismissals (for events that are now in the past)
  const clearExpiredDismissals = (notifications: NotificationItem[], userType: UserType, userEmail?: string) => {
    const storageKey = getStorageKey(userType, userEmail);
    const currentDismissed = getDismissedNotifications(userType, userEmail);
    
    const now = new Date();
    const futureIds = notifications
      .filter(n => new Date(n.date) > now)
      .map(n => n.id);
    
    const filtered = currentDismissed.filter((id: number) => futureIds.includes(id));
    
    if (filtered.length !== currentDismissed.length) {
      localStorage.setItem(storageKey, JSON.stringify(filtered));
    }
  };

  // Get notifications specific to a user type (filter notifications based on user type)
  const getUserSpecificNotifications = (notifications: NotificationItem[], userType: UserType, userEmail?: string): NotificationItem[] => {
    const dismissed = getDismissedNotifications(userType, userEmail);
    const storageKey = getStorageKey(userType, userEmail);
    
    console.log('NotificationsContext - Getting user specific notifications:', { 
      userType, 
      userEmail, 
      storageKey, 
      dismissed,
      totalNotifications: notifications.length 
    });
    
    // Filter out dismissed notifications for this specific user
    const filtered = notifications.filter(notification => !dismissed.includes(notification.id));
    console.log('NotificationsContext - Filtered notifications:', filtered.length);
    
    return filtered;
  };

  const contextValue: NotificationsContextType = {
    getDismissedNotifications,
    dismissNotification,
    clearExpiredDismissals,
    getUserSpecificNotifications,
  };

  return (
    <NotificationsContext.Provider value={contextValue}>
      {children}
    </NotificationsContext.Provider>
  );
};
