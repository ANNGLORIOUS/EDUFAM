import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import type { UserType } from './NotificationsContext';

interface CurrentUser {
  type: UserType;
  email: string;
  name: string;
  id: number;
}

export const useCurrentUser = (): CurrentUser | null => {
  const { user } = useUser();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    // Debug: Log Clerk user info
    console.log('useCurrentUser - Clerk user:', user);
    
    // First try to get from Clerk
    if (user?.primaryEmailAddress?.emailAddress) {
      const userEmail = user.primaryEmailAddress.emailAddress;
      const userName = user.fullName || user.firstName || 'User';

      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem('edufam_users') || '[]');
      
      // Find user by email
      const foundUser = users.find((u: any) => 
        u.email && u.email.toLowerCase() === userEmail.toLowerCase()
      );

      if (foundUser) {
        setCurrentUser({
          type: foundUser.type as UserType,
          email: foundUser.email,
          name: foundUser.name || userName,
          id: foundUser.id
        });
        return;
      }
    }
    
    // Fallback: Determine user type from current URL path
    const currentPath = window.location.pathname;
    console.log('useCurrentUser - Current path:', currentPath);
    
    if (currentPath.includes('/teacher')) {
      setCurrentUser({
        type: 'teacher',
        email: 'teacher@example.com',
        name: 'Current Teacher',
        id: 999
      });
    } else if (currentPath.includes('/admin')) {
      setCurrentUser({
        type: 'admin',
        email: 'admin@example.com',
        name: 'Current Admin',
        id: 998
      });
    } else if (currentPath.includes('/parent')) {
      setCurrentUser({
        type: 'parent',
        email: 'parent@example.com',
        name: 'Current Parent',
        id: 997
      });
    } else {
      // Default to parent if no specific path
      setCurrentUser({
        type: 'parent',
        email: 'default@example.com',
        name: 'Default User',
        id: 996
      });
    }
  }, [user]);

  return currentUser;
};
