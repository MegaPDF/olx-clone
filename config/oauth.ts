import { env, oauthConfig } from '../lib/env';
import type { OAuthProvider } from '../lib/types';

interface OAuthConfiguration {
  providers: {
    google: {
      enabled: boolean;
      clientId?: string;
      clientSecret?: string;
      scope: string[];
      authorizationUrl: string;
      tokenUrl: string;
      userInfoUrl: string;
    };
    facebook: {
      enabled: boolean;
      appId?: string;
      appSecret?: string;
      scope: string[];
      authorizationUrl: string;
      tokenUrl: string;
      userInfoUrl: string;
    };
  };
  settings: {
    allowDangerousEmailAccountLinking: boolean;
    trustHost: boolean;
    session: {
      strategy: 'jwt' | 'database';
      maxAge: number; // seconds
      updateAge: number; // seconds
    };
    jwt: {
      maxAge: number; // seconds
    };
    pages: {
      signIn: string;
      signUp: string;
      error: string;
      verifyRequest: string;
    };
  };
}

export const oauthConfiguration: OAuthConfiguration = {
  providers: {
    google: {
      enabled: oauthConfig.google.enabled,
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      scope: [
        'openid',
        'email',
        'profile'
      ],
      authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo'
    },
    facebook: {
      enabled: oauthConfig.facebook.enabled,
      appId: env.FACEBOOK_APP_ID,
      appSecret: env.FACEBOOK_APP_SECRET,
      scope: [
        'email',
        'public_profile'
      ],
      authorizationUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
      tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
      userInfoUrl: 'https://graph.facebook.com/v18.0/me'
    }
  },
  settings: {
    allowDangerousEmailAccountLinking: true,
    trustHost: env.NODE_ENV === 'production',
    session: {
      strategy: 'jwt',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      updateAge: 24 * 60 * 60 // 24 hours
    },
    jwt: {
      maxAge: 30 * 24 * 60 * 60 // 30 days
    },
    pages: {
      signIn: '/auth/signin',
      signUp: '/auth/signup',
      error: '/auth/error',
      verifyRequest: '/auth/verify-request'
    }
  }
};

// OAuth provider configurations for UI
export const oauthProviders: OAuthProvider[] = [
  {
    id: 'google',
    name: 'Google',
    icon: 'google',
    enabled: oauthConfiguration.providers.google.enabled
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: 'facebook',
    enabled: oauthConfiguration.providers.facebook.enabled
  }
];

// OAuth scopes and permissions mapping
export const oauthScopes = {
  google: {
    basic: ['openid', 'email', 'profile'],
    extended: ['openid', 'email', 'profile', 'https://www.googleapis.com/auth/user.addresses.read']
  },
  facebook: {
    basic: ['email', 'public_profile'],
    extended: ['email', 'public_profile', 'user_location']
  }
};
