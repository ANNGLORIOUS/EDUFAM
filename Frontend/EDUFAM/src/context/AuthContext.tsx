import { createContext, type ReactNode, useMemo } from 'react';
import { useUser } from '@clerk/clerk-react';

// Define user roles
export type UserRole = 'ADMIN' | 'TEACHER' | 'PARENT' | 'GUEST';

// Define the user object structure that our app will use
export interface AppUser {
  name: string;
  role: UserRole;
  clerkId?: string;
  email?: string;
}

// Define the shape of the context value
interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
}

// Create the context with a default value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the props for the AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

// This logic should eventually be moved to Clerk user metadata
const teacherEmail = "sandranyambura72@gmail.com";
const adminEmail = "admin@example.com"; // Placeholder for admin user

// Create the provider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { user: clerkUser, isSignedIn } = useUser();

  // useMemo will prevent re-calculating the user object on every render
  const appUser: AppUser | null = useMemo(() => {
    if (!isSignedIn || !clerkUser) {
      return null;
    }

    let role: UserRole = 'ADMIN'; // Default role for any signed-in user
    const userEmail = clerkUser.primaryEmailAddress?.emailAddress;

    if (userEmail === teacherEmail) {
      role = 'TEACHER';
    } else if (userEmail === adminEmail) {
      role = 'ADMIN';
    }

    return {
      name: clerkUser.fullName || 'User',
      role: role,
      clerkId: clerkUser.id,
      email: userEmail,
    };
  }, [clerkUser, isSignedIn]);


  const value = {
    user: appUser,
    isAuthenticated: !!isSignedIn,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
