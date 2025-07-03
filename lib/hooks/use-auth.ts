// Authentication hook
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { AuthSession } from '../types';

export function useAuth() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const user = session?.user;
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const isUnauthenticated = status === 'unauthenticated';

  // Helper function to check user permissions
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    const rolePermissions = {
      user: ['read', 'create_listing', 'message', 'favorite'],
      moderator: ['read', 'create_listing', 'message', 'favorite', 'moderate'],
      admin: ['read', 'create_listing', 'message', 'favorite', 'moderate', 'admin']
    };

    return rolePermissions[user.role]?.includes(permission) || false;
  };

  // Check if user is admin or moderator
  const isAdmin = user?.role === 'admin';
  const isModerator = user?.role === 'moderator' || isAdmin;

  // Check if user can create listings
  const canCreateListing = hasPermission('create_listing') && user?.status === 'active';

  // Check if user email is verified
  const isEmailVerified = user?.emailVerified || false;

  // Redirect to login if authentication is required
  const requireAuth = (redirectTo?: string) => {
    useEffect(() => {
      if (isUnauthenticated) {
        const callbackUrl = redirectTo || window.location.pathname;
        router.push(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      }
    }, [isUnauthenticated, redirectTo]);
  };

  // Redirect to home if user is already authenticated
  const requireGuest = () => {
    useEffect(() => {
      if (isAuthenticated) {
        router.push('/');
      }
    }, [isAuthenticated]);
  };

  // Check subscription status
  const hasActiveSubscription = user?.subscription?.status === 'active';
  const subscriptionPlan = user?.subscription?.plan || 'free';

  return {
    // Session data
    session: session as AuthSession | null,
    user,
    
    // Status flags
    isLoading,
    isAuthenticated,
    isUnauthenticated,
    isEmailVerified,
    
    // Role checks
    isAdmin,
    isModerator,
    hasPermission,
    canCreateListing,
    
    // Subscription
    hasActiveSubscription,
    subscriptionPlan,
    
    // Helper functions
    requireAuth,
    requireGuest,
    updateSession: update
  };
}