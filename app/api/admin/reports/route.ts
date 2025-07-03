import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Report } from '@/models';
import { auth } from '@/lib/auth';
import { generateRandomString } from '@/lib/utils';
import type { ApiPaginatedResponse, ReportDetail } from '@/lib/types';

// GET /api/admin/reports - Get reported content
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Admin access required'
        }
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const status = searchParams.get('status') || '';
    const category = searchParams.get('category') || '';
    const targetType = searchParams.get('targetType') || '';

    await connectDB();

    let query: any = {};

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    if (targetType) {
      query['target.type'] = targetType;
    }

    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      Report.find(query)
        .populate('reporter', 'name email')
        .populate('moderator', 'name email')
        .populate('target.id') // This would need to be dynamic based on target type
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Report.countDocuments(query)
    ]);

    const response: ApiPaginatedResponse<ReportDetail> = {
      success: true,
      data: reports.map(formatReport),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: generateRandomString(8),
        version: '1.0'
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('GET /api/admin/reports error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch reports'
      }
    }, { status: 500 });
  }
}

function formatReport(report: any): ReportDetail {
  return {
    id: report._id.toString(),
    reporter: {
      id: report.reporter._id.toString(),
      name: report.reporter.name,
      email: report.reporter.email
    },
    target: {
      type: report.target.type,
      id: report.target.id.toString(),
      title: report.target.title,
      url: report.target.url
    },
    category: report.category,
    reason: report.reason,
    status: report.status,
    priority: report.priority, // Added priority property
    moderator: report.moderator ? {
      id: report.moderator._id.toString(),
      name: report.moderator.name
    } : undefined,
    resolution: report.resolution,
    createdAt: report.createdAt,
    updatedAt: report.updatedAt
  };
}