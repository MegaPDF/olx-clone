// Admin server actions
'use server';

import { revalidatePath } from 'next/cache';
import { connectDB } from '../db';
import { 
  User, 
  Listing, 
  Category, 
  Payment, 
  Report, 
  AdminSettings 
} from '@/models';
import { 
  adminUpdateUserSchema,
  updateCategorySchema,
  createCategorySchema,
  reportResolutionSchema,
  adminSettingsSchema
} from '../validations';
import type { FormSubmissionResult } from '../types';

export async function updateUserStatusAction(
  formData: FormData,
  adminUserId: string
): Promise<FormSubmissionResult> {
  try {
    const rawData = {
      userId: formData.get('userId') as string,
      status: formData.get('status') as 'active' | 'suspended' | 'banned',
      reason: formData.get('reason') as string
    };

    await connectDB();

    // Verify admin permissions
    const admin = await User.findById(adminUserId);
    if (!admin || admin.role !== 'admin') {
      return {
        success: false,
        errors: [{ field: 'root', message: 'Access denied' }]
      };
    }

    const user = await User.findById(rawData.userId);
    if (!user) {
      return {
        success: false,
        errors: [{ field: 'userId', message: 'User not found' }]
      };
    }

    await User.findByIdAndUpdate(rawData.userId, {
      status: rawData.status
    });

    // TODO: Send notification to user
    // TODO: Log admin action

    revalidatePath('/admin/users');

    return {
      success: true,
      data: { message: 'User status updated successfully' }
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [{ field: 'root', message: 'Failed to update user status' }]
    };
  }
}

export async function createCategoryAction(
  formData: FormData,
  adminUserId: string
): Promise<FormSubmissionResult> {
  try {
    const rawData = {
      name: {
        en: formData.get('nameEn') as string,
        id: formData.get('nameId') as string
      },
      slug: formData.get('slug') as string,
      description: {
        en: formData.get('descriptionEn') as string,
        id: formData.get('descriptionId') as string
      },
      icon: formData.get('icon') as string,
      parent: formData.get('parent') as string || undefined,
      sortOrder: Number(formData.get('sortOrder')) || 0
    };

    const validatedData = createCategorySchema.parse(rawData);
    
    await connectDB();

    // Verify admin permissions
    const admin = await User.findById(adminUserId);
    if (!admin || admin.role !== 'admin') {
      return {
        success: false,
        errors: [{ field: 'root', message: 'Access denied' }]
      };
    }

    // Check if slug already exists
    const existingCategory = await Category.findOne({ slug: validatedData.slug });
    if (existingCategory) {
      return {
        success: false,
        errors: [{ field: 'slug', message: 'Slug already exists' }]
      };
    }

    // Calculate level based on parent
    let level = 0;
    if (validatedData.parent) {
      const parentCategory = await Category.findById(validatedData.parent);
      if (parentCategory) {
        level = parentCategory.level + 1;
      }
    }

    await Category.create({
      ...validatedData,
      level
    });

    revalidatePath('/admin/categories');

    return {
      success: true,
      data: { message: 'Category created successfully' }
    };
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return {
        success: false,
        errors: error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      };
    }

    return {
      success: false,
      errors: [{ field: 'root', message: 'Category creation failed' }]
    };
  }
}

export async function resolveReportAction(
  formData: FormData,
  adminUserId: string
): Promise<FormSubmissionResult> {
  try {
    const rawData = {
      reportId: formData.get('reportId') as string,
      action: formData.get('action') as string,
      note: formData.get('note') as string
    };

    const validatedData = reportResolutionSchema.parse(rawData);
    
    await connectDB();

    // Verify admin permissions
    const admin = await User.findById(adminUserId);
    if (!admin || !['admin', 'moderator'].includes(admin.role)) {
      return {
        success: false,
        errors: [{ field: 'root', message: 'Access denied' }]
      };
    }

    const report = await Report.findById(validatedData.reportId);
    if (!report) {
      return {
        success: false,
        errors: [{ field: 'reportId', message: 'Report not found' }]
      };
    }

    await Report.findByIdAndUpdate(validatedData.reportId, {
      status: 'resolved',
      moderator: adminUserId,
      resolution: {
        action: validatedData.action,
        note: validatedData.note,
        date: new Date()
      }
    });

    // Take action based on resolution
    if (validatedData.action === 'content_removed') {
      if (report.target.type === 'listing') {
        await Listing.findByIdAndUpdate(report.target.id, {
          status: 'suspended'
        });
      }
    } else if (validatedData.action === 'user_suspended') {
      // Find the user who owns the reported content
      let targetUserId;
      if (report.target.type === 'listing') {
        const listing = await Listing.findById(report.target.id);
        targetUserId = listing?.seller;
      } else if (report.target.type === 'user') {
        targetUserId = report.target.id;
      }

      if (targetUserId) {
        await User.findByIdAndUpdate(targetUserId, {
          status: 'suspended'
        });
      }
    }

    revalidatePath('/admin/reports');

    return {
      success: true,
      data: { message: 'Report resolved successfully' }
    };
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return {
        success: false,
        errors: error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      };
    }

    return {
      success: false,
      errors: [{ field: 'root', message: 'Report resolution failed' }]
    };
  }
}

export async function updateAdminSettingsAction(
  formData: FormData,
  adminUserId: string
): Promise<FormSubmissionResult> {
  try {
    // Extract form data (simplified - would need full implementation)
    const rawData = {
      general: {
        siteName: formData.get('siteName') as string,
        siteDescription: formData.get('siteDescription') as string,
        siteUrl: formData.get('siteUrl') as string,
        contactEmail: formData.get('contactEmail') as string,
        supportEmail: formData.get('supportEmail') as string,
        maintenanceMode: formData.get('maintenanceMode') === 'on',
        registrationEnabled: formData.get('registrationEnabled') === 'on'
      },
      // ... other settings would be extracted here
    };

    // Note: This is a simplified version - full implementation would include all settings
    
    await connectDB();

    // Verify admin permissions
    const admin = await User.findById(adminUserId);
    if (!admin || admin.role !== 'admin') {
      return {
        success: false,
        errors: [{ field: 'root', message: 'Access denied' }]
      };
    }

    // Update or create admin settings
    await AdminSettings.findOneAndUpdate(
      {},
      { $set: rawData },
      { upsert: true, new: true }
    );

    revalidatePath('/admin/settings');

    return {
      success: true,
      data: { message: 'Settings updated successfully' }
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [{ field: 'root', message: 'Settings update failed' }]
    };
  }
}