import nodemailer from 'nodemailer';
import { env, emailConfig } from '../env';
import type { 
  EmailVerification, 
  LocalizedContent, 
  UserProfile 
} from '../types';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

interface EmailTemplate {
  subject: LocalizedContent;
  html: LocalizedContent;
  text?: LocalizedContent;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = this.createTransporter();
  }

  /**
   * Create email transporter based on configuration
   */
  private createTransporter(): nodemailer.Transporter {
    switch (env.EMAIL_PROVIDER) {
      case 'smtp':
        return nodemailer.createTransporter({
          host: env.SMTP_HOST,
          port: env.SMTP_PORT,
          secure: env.SMTP_PORT === 465,
          auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASSWORD
          }
        });

      case 'sendgrid':
        return nodemailer.createTransporter({
          service: 'SendGrid',
          auth: {
            user: 'apikey',
            pass: env.SENDGRID_API_KEY
          }
        });

      case 'ses':
        return nodemailer.createTransporter({
          SES: {
            aws: {
              accessKeyId: env.AWS_ACCESS_KEY_ID,
              secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
              region: env.AWS_REGION
            }
          }
        });

      default:
        throw new Error('Invalid email provider configuration');
    }
  }

  /**
   * Send email
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    if (!emailConfig.configured) {
      console.warn('Email service not configured, skipping email send');
      return;
    }

    try {
      await this.transporter.sendMail({
        from: `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments
      });
    } catch (error) {
      throw new Error(`Email send failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Send localized email
   */
  async sendLocalizedEmail(
    to: string,
    template: EmailTemplate,
    locale: 'en' | 'id' = 'en',
    variables: Record<string, string> = {}
  ): Promise<void> {
    const subject = this.interpolateTemplate(template.subject[locale], variables);
    const html = this.interpolateTemplate(template.html[locale], variables);
    const text = template.text ? this.interpolateTemplate(template.text[locale], variables) : undefined;

    await this.sendEmail({
      to,
      subject,
      html,
      text
    });
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(
    email: string,
    name: string,
    token: string,
    locale: 'en' | 'id' = 'en'
  ): Promise<void> {
    const verificationUrl = `${env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`;

    const template: EmailTemplate = {
      subject: {
        en: 'Verify your email address',
        id: 'Verifikasi alamat email Anda'
      },
      html: {
        en: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>Welcome to OLX Marketplace, {{name}}!</h1>
            <p>Please verify your email address by clicking the button below:</p>
            <a href="{{verificationUrl}}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Verify Email
            </a>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p>{{verificationUrl}}</p>
            <p>This link will expire in 24 hours.</p>
          </div>
        `,
        id: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>Selamat datang di OLX Marketplace, {{name}}!</h1>
            <p>Silakan verifikasi alamat email Anda dengan mengklik tombol di bawah:</p>
            <a href="{{verificationUrl}}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Verifikasi Email
            </a>
            <p>Jika tombol tidak berfungsi, salin dan tempel tautan ini ke browser Anda:</p>
            <p>{{verificationUrl}}</p>
            <p>Tautan ini akan kedaluwarsa dalam 24 jam.</p>
          </div>
        `
      }
    };

    await this.sendLocalizedEmail(email, template, locale, {
      name,
      verificationUrl
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(
    email: string,
    name: string,
    token: string,
    locale: 'en' | 'id' = 'en'
  ): Promise<void> {
    const resetUrl = `${env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;

    const template: EmailTemplate = {
      subject: {
        en: 'Reset your password',
        id: 'Reset kata sandi Anda'
      },
      html: {
        en: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>Password Reset Request</h1>
            <p>Hi {{name}},</p>
            <p>You requested to reset your password. Click the button below to create a new password:</p>
            <a href="{{resetUrl}}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset Password
            </a>
            <p>If you didn't request this, please ignore this email.</p>
            <p>This link will expire in 1 hour.</p>
          </div>
        `,
        id: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>Permintaan Reset Kata Sandi</h1>
            <p>Halo {{name}},</p>
            <p>Anda meminta untuk mereset kata sandi. Klik tombol di bawah untuk membuat kata sandi baru:</p>
            <a href="{{resetUrl}}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset Kata Sandi
            </a>
            <p>Jika Anda tidak meminta ini, silakan abaikan email ini.</p>
            <p>Tautan ini akan kedaluwarsa dalam 1 jam.</p>
          </div>
        `
      }
    };

    await this.sendLocalizedEmail(email, template, locale, {
      name,
      resetUrl
    });
  }

  /**
   * Send listing notification
   */
  async sendListingNotification(
    email: string,
    name: string,
    listingTitle: string,
    type: 'approved' | 'sold' | 'expired',
    locale: 'en' | 'id' = 'en'
  ): Promise<void> {
    const templates = {
      approved: {
        subject: {
          en: 'Your listing has been approved',
          id: 'Listing Anda telah disetujui'
        },
        html: {
          en: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1>Listing Approved!</h1>
              <p>Hi {{name}},</p>
              <p>Your listing "{{listingTitle}}" has been approved and is now live on our marketplace.</p>
              <p>Start promoting your listing to get more visibility!</p>
            </div>
          `,
          id: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1>Listing Disetujui!</h1>
              <p>Halo {{name}},</p>
              <p>Listing Anda "{{listingTitle}}" telah disetujui dan sekarang sudah aktif di marketplace kami.</p>
              <p>Mulai promosikan listing Anda untuk mendapatkan lebih banyak visibilitas!</p>
            </div>
          `
        }
      }
      // Add other types as needed
    };

    await this.sendLocalizedEmail(email, templates[type], locale, {
      name,
      listingTitle
    });
  }

  /**
   * Interpolate template variables
   */
  private interpolateTemplate(template: string, variables: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || match;
    });
  }

  /**
   * Test email configuration
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch {
      return false;
    }
  }
}

export const emailService = new EmailService();
