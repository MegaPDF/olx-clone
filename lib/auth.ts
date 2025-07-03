// NextAuth.js configuration
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import { connectDB } from './db';
import { User } from '@/models';
import { env } from './env';
import type { AuthSession } from './types';
const client = new MongoClient(env.MONGODB_URI);

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(client),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        await connectDB();
        
        const user = await User.findOne({ 
          email: credentials.email.toLowerCase() 
        }).select('+password');

        if (!user) {
          throw new Error('Invalid credentials');
        }

        if (user.status === 'banned' || user.status === 'suspended') {
          throw new Error('Account suspended');
        }

        if (!user.verification.email.verified) {
          throw new Error('Please verify your email address');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password, 
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Invalid credentials');
        }

        // Update last login
        await User.findByIdAndUpdate(user._id, {
          lastLoginAt: new Date()
        });

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.avatar,
          role: user.role,
          status: user.status,
          emailVerified: user.verification.email.verified,
          location: user.location,
          preferences: user.preferences
        };
      }
    }),
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID ?? (() => { throw new Error('GOOGLE_CLIENT_ID is not defined'); })(),
      clientSecret: env.GOOGLE_CLIENT_SECRET ?? (() => { throw new Error('GOOGLE_CLIENT_SECRET is not defined'); })(),
      allowDangerousEmailAccountLinking: true
    }),
    FacebookProvider({
      clientId: env.FACEBOOK_APP_ID ?? (() => { throw new Error('FACEBOOK_APP_ID is not defined'); })(),
      clientSecret: env.FACEBOOK_APP_SECRET ?? (() => { throw new Error('FACEBOOK_APP_SECRET is not defined'); })(),
      allowDangerousEmailAccountLinking: true
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' || account?.provider === 'facebook') {
        await connectDB();
        
        const existingUser = await User.findOne({ email: user.email });
        
        if (existingUser) {
          // Link OAuth account
          const oauthField = `oauth.${account.provider}`;
          await User.findByIdAndUpdate(existingUser._id, {
            [oauthField]: {
              id: account.providerAccountId,
              email: user.email
            },
            'verification.email.verified': true,
            lastLoginAt: new Date()
          });
        } else {
          // Create new user with OAuth
          await User.create({
            email: user.email,
            name: user.name || profile?.name,
            avatar: user.image,
            verification: {
              email: { verified: true }
            },
            oauth: {
              [account.provider]: {
                id: account.providerAccountId,
                email: user.email
              }
            },
            location: {
              address: 'Not specified',
              city: 'Unknown',
              state: 'Unknown',
              country: 'Indonesia',
              coordinates: { latitude: 0, longitude: 0 }
            },
            lastLoginAt: new Date()
          });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        // Type assertion to allow custom properties
        const customUser = user as typeof user & {
          role?: string;
          status?: string;
          emailVerified?: boolean;
          location?: any;
          preferences?: any;
        };
        token.role = customUser.role;
        token.status = customUser.status;
        token.emailVerified = customUser.emailVerified;
        token.location = customUser.location;
        token.preferences = customUser.preferences;
      }
      return token;
    },
    async session({ session, token }): Promise<AuthSession> {
      return {
        ...session,
        user: {
          id: token.sub!,
          name: token.name!,
          email: token.email!,
          avatar: token.picture ?? undefined,
          role: token.role as any,
          status: token.status as any,
          emailVerified: token.emailVerified as boolean,
          location: token.location as any,
          preferences: token.preferences as any
        },
        expires: session.expires
      };
    }
  },
  pages: {
    signIn: '/auth/signin',
    newUser: '/auth/signup',
    error: '/auth/error'
  },
  events: {
    async signIn({ user, isNewUser }) {
      if (isNewUser) {
        // Send welcome email, create default preferences, etc.
        console.log('New user signed in:', user.email);
      }
    }
  }
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
