import { Coordinates, Currency, Locale, Theme, UserRole, UserStatus } from "./global";

// Auth types
export interface SignInCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface SignUpCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates: Coordinates;
  };
  acceptTerms: boolean;
  newsletter?: boolean;
}

export interface ResetPasswordCredentials {
  email: string;
}

export interface NewPasswordCredentials {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordCredentials {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface OAuthProvider {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
}

export interface AuthSession {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: UserRole;
    status: UserStatus;
    emailVerified: boolean;
    location: Location;
    preferences: {
      language: Locale;
      currency: Currency;
      theme: Theme;
    };
  };
  expires: string;
}

export interface AuthError {
  type: 'CredentialsSignin' | 'OAuthSignin' | 'EmailSignin' | 'Callback' | 'OAuthCallback' | 'OAuthCreateAccount' | 'EmailCreateAccount' | 'Signin' | 'OAuthAccountNotLinked' | 'SessionRequired';
  message: string;
}

export interface EmailVerification {
  token: string;
  email: string;
  expiresAt: Date;
}

export interface PhoneVerification {
  token: string;
  phone: string;
  expiresAt: Date;
}