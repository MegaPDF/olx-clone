import { env, emailConfig } from '../lib/env';
import type { LocalizedContent, Locale } from '../lib/types';

interface EmailConfiguration {
  provider: 'smtp' | 'sendgrid' | 'ses';
  configured: boolean;
  settings: {
    from: {
      email: string;
      name: string;
    };
    replyTo?: string;
    defaultLocale: Locale;
    supportedLocales: Locale[];
  };
  smtp?: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  sendgrid?: {
    apiKey: string;
    templates: Record<string, string>;
  };
  ses?: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
  templates: {
    welcome: EmailTemplate;
    emailVerification: EmailTemplate;
    passwordReset: EmailTemplate;
    listingApproved: EmailTemplate;
    listingExpired: EmailTemplate;
    messageReceived: EmailTemplate;
    subscriptionExpiring: EmailTemplate;
    paymentSuccessful: EmailTemplate;
  };
}

interface EmailTemplate {
  subject: LocalizedContent;
  preheader?: LocalizedContent;
  content: {
    html: LocalizedContent;
    text: LocalizedContent;
  };
  variables: string[];
}

export const emailConfiguration: EmailConfiguration = {
  provider: env.EMAIL_PROVIDER,
  configured: emailConfig.configured,
  settings: {
    from: {
      email: env.EMAIL_FROM,
      name: env.EMAIL_FROM_NAME
    },
    replyTo: env.EMAIL_FROM,
    defaultLocale: 'en',
    supportedLocales: ['en', 'id']
  },
  smtp: env.EMAIL_PROVIDER === 'smtp' ? {
    host: env.SMTP_HOST!,
    port: env.SMTP_PORT!,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER!,
      pass: env.SMTP_PASSWORD!
    }
  } : undefined,
  sendgrid: env.EMAIL_PROVIDER === 'sendgrid' ? {
    apiKey: env.SENDGRID_API_KEY!,
    templates: {
      welcome: 'd-xxx',
      verification: 'd-yyy',
      passwordReset: 'd-zzz'
    }
  } : undefined,
  ses: env.EMAIL_PROVIDER === 'ses' ? {
    region: env.AWS_REGION,
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY
  } : undefined,
  templates: {
    welcome: {
      subject: {
        en: 'Welcome to OLX Marketplace!',
        id: 'Selamat datang di OLX Marketplace!'
      },
      preheader: {
        en: 'Start buying and selling in your local community',
        id: 'Mulai jual beli di komunitas lokal Anda'
      },
      content: {
        html: {
          en: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1>Welcome to OLX Marketplace, {{name}}!</h1>
              <p>We're excited to have you join our community of buyers and sellers.</p>
              <p>You can now:</p>
              <ul>
                <li>Browse thousands of local listings</li>
                <li>Create your own listings to sell items</li>
                <li>Connect with buyers and sellers in your area</li>
              </ul>
              <a href="{{appUrl}}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                Start Exploring
              </a>
            </div>
          `,
          id: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1>Selamat datang di OLX Marketplace, {{name}}!</h1>
              <p>Kami senang Anda bergabung dengan komunitas pembeli dan penjual kami.</p>
              <p>Sekarang Anda bisa:</p>
              <ul>
                <li>Menjelajahi ribuan listing lokal</li>
                <li>Membuat listing sendiri untuk menjual barang</li>
                <li>Terhubung dengan pembeli dan penjual di area Anda</li>
              </ul>
              <a href="{{appUrl}}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                Mulai Jelajahi
              </a>
            </div>
          `
        },
        text: {
          en: 'Welcome to OLX Marketplace, {{name}}! Start exploring at {{appUrl}}',
          id: 'Selamat datang di OLX Marketplace, {{name}}! Mulai jelajahi di {{appUrl}}'
        }
      },
      variables: ['name', 'appUrl']
    },
    emailVerification: {
      subject: {
        en: 'Verify your email address',
        id: 'Verifikasi alamat email Anda'
      },
      content: {
        html: {
          en: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1>Verify Your Email</h1>
              <p>Hi {{name}},</p>
              <p>Please click the button below to verify your email address:</p>
              <a href="{{verificationUrl}}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                Verify Email
              </a>
              <p>This link will expire in {{expiryHours}} hours.</p>
            </div>
          `,
          id: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1>Verifikasi Email Anda</h1>
              <p>Halo {{name}},</p>
              <p>Silakan klik tombol di bawah untuk memverifikasi alamat email Anda:</p>
              <a href="{{verificationUrl}}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                Verifikasi Email
              </a>
              <p>Tautan ini akan kedaluwarsa dalam {{expiryHours}} jam.</p>
            </div>
          `
        },
        text: {
          en: 'Verify your email: {{verificationUrl}}',
          id: 'Verifikasi email Anda: {{verificationUrl}}'
        }
      },
      variables: ['name', 'verificationUrl', 'expiryHours']
    },
    passwordReset: {
      subject: {
        en: 'Reset your password',
        id: 'Reset kata sandi Anda'
      },
      content: {
        html: {
          en: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1>Password Reset</h1>
              <p>Hi {{name}},</p>
              <p>Click the button below to reset your password:</p>
              <a href="{{resetUrl}}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                Reset Password
              </a>
              <p>If you didn't request this, please ignore this email.</p>
            </div>
          `,
          id: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1>Reset Kata Sandi</h1>
              <p>Halo {{name}},</p>
              <p>Klik tombol di bawah untuk mereset kata sandi Anda:</p>
              <a href="{{resetUrl}}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                Reset Kata Sandi
              </a>
              <p>Jika Anda tidak meminta ini, silakan abaikan email ini.</p>
            </div>
          `
        },
        text: {
          en: 'Reset your password: {{resetUrl}}',
          id: 'Reset kata sandi Anda: {{resetUrl}}'
        }
      },
      variables: ['name', 'resetUrl']
    },
    listingApproved: {
      subject: {
        en: 'Your listing has been approved!',
        id: 'Listing Anda telah disetujui!'
      },
      content: {
        html: {
          en: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1>Listing Approved!</h1>
              <p>Hi {{name}},</p>
              <p>Great news! Your listing "{{listingTitle}}" has been approved and is now live.</p>
              <a href="{{listingUrl}}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                View Listing
              </a>
            </div>
          `,
          id: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1>Listing Disetujui!</h1>
              <p>Halo {{name}},</p>
              <p>Kabar baik! Listing Anda "{{listingTitle}}" telah disetujui dan sekarang sudah aktif.</p>
              <a href="{{listingUrl}}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                Lihat Listing
              </a>
            </div>
          `
        },
        text: {
          en: 'Your listing "{{listingTitle}}" is now live: {{listingUrl}}',
          id: 'Listing Anda "{{listingTitle}}" sekarang sudah aktif: {{listingUrl}}'
        }
      },
      variables: ['name', 'listingTitle', 'listingUrl']
    },
    listingExpired: {
      subject: {
        en: 'Your listing has expired',
        id: 'Listing Anda telah kedaluwarsa'
      },
      content: {
        html: {
          en: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1>Listing Expired</h1>
              <p>Hi {{name}},</p>
              <p>Your listing "{{listingTitle}}" has expired and is no longer visible to buyers.</p>
              <p>You can renew it to make it active again.</p>
              <a href="{{renewUrl}}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                Renew Listing
              </a>
            </div>
          `,
          id: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1>Listing Kedaluwarsa</h1>
              <p>Halo {{name}},</p>
              <p>Listing Anda "{{listingTitle}}" telah kedaluwarsa dan tidak lagi terlihat oleh pembeli.</p>
              <p>Anda dapat memperpanjangnya untuk mengaktifkannya kembali.</p>
              <a href="{{renewUrl}}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                Perpanjang Listing
              </a>
            </div>
          `
        },
        text: {
          en: 'Your listing "{{listingTitle}}" has expired. Renew it: {{renewUrl}}',
          id: 'Listing Anda "{{listingTitle}}" telah kedaluwarsa. Perpanjang: {{renewUrl}}'
        }
      },
      variables: ['name', 'listingTitle', 'renewUrl']
    },
    messageReceived: {
      subject: {
        en: 'New message about your listing',
        id: 'Pesan baru tentang listing Anda'
      },
      content: {
        html: {
          en: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1>New Message</h1>
              <p>Hi {{name}},</p>
              <p>{{senderName}} sent you a message about your listing "{{listingTitle}}":</p>
              <blockquote style="border-left: 4px solid #007bff; padding-left: 16px; margin: 16px 0;">
                {{messagePreview}}
              </blockquote>
              <a href="{{messageUrl}}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                Reply to Message
              </a>
            </div>
          `,
          id: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1>Pesan Baru</h1>
              <p>Halo {{name}},</p>
              <p>{{senderName}} mengirim pesan tentang listing Anda "{{listingTitle}}":</p>
              <blockquote style="border-left: 4px solid #007bff; padding-left: 16px; margin: 16px 0;">
                {{messagePreview}}
              </blockquote>
              <a href="{{messageUrl}}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                Balas Pesan
              </a>
            </div>
          `
        },
        text: {
          en: 'New message from {{senderName}} about "{{listingTitle}}": {{messagePreview}}. Reply: {{messageUrl}}',
          id: 'Pesan baru dari {{senderName}} tentang "{{listingTitle}}": {{messagePreview}}. Balas: {{messageUrl}}'
        }
      },
      variables: ['name', 'senderName', 'listingTitle', 'messagePreview', 'messageUrl']
    },
    subscriptionExpiring: {
      subject: {
        en: 'Your subscription expires soon',
        id: 'Langganan Anda akan segera berakhir'
      },
      content: {
        html: {
          en: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1>Subscription Expiring</h1>
              <p>Hi {{name}},</p>
              <p>Your {{planName}} subscription will expire on {{expiryDate}}.</p>
              <p>Renew now to continue enjoying premium features.</p>
              <a href="{{renewUrl}}" style="background-color: #ffc107; color: black; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                Renew Subscription
              </a>
            </div>
          `,
          id: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1>Langganan Akan Berakhir</h1>
              <p>Halo {{name}},</p>
              <p>Langganan {{planName}} Anda akan berakhir pada {{expiryDate}}.</p>
              <p>Perpanjang sekarang untuk terus menikmati fitur premium.</p>
              <a href="{{renewUrl}}" style="background-color: #ffc107; color: black; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                Perpanjang Langganan
              </a>
            </div>
          `
        },
        text: {
          en: 'Your {{planName}} subscription expires on {{expiryDate}}. Renew: {{renewUrl}}',
          id: 'Langganan {{planName}} Anda berakhir pada {{expiryDate}}. Perpanjang: {{renewUrl}}'
        }
      },
      variables: ['name', 'planName', 'expiryDate', 'renewUrl']
    },
    paymentSuccessful: {
      subject: {
        en: 'Payment confirmation',
        id: 'Konfirmasi pembayaran'
      },
      content: {
        html: {
          en: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1>Payment Successful</h1>
              <p>Hi {{name}},</p>
              <p>Your payment of {{amount}} for {{description}} has been processed successfully.</p>
              <p><strong>Transaction ID:</strong> {{transactionId}}</p>
              <a href="{{receiptUrl}}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                Download Receipt
              </a>
            </div>
          `,
          id: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1>Pembayaran Berhasil</h1>
              <p>Halo {{name}},</p>
              <p>Pembayaran Anda sebesar {{amount}} untuk {{description}} telah berhasil diproses.</p>
              <p><strong>ID Transaksi:</strong> {{transactionId}}</p>
              <a href="{{receiptUrl}}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                Unduh Kwitansi
              </a>
            </div>
          `
        },
        text: {
          en: 'Payment successful: {{amount}} for {{description}}. Receipt: {{receiptUrl}}',
          id: 'Pembayaran berhasil: {{amount}} untuk {{description}}. Kwitansi: {{receiptUrl}}'
        }
      },
      variables: ['name', 'amount', 'description', 'transactionId', 'receiptUrl']
    }
  }
};
