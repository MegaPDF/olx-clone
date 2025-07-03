import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User, Listing, Payment } from '@/models';
import { auth } from '@/lib/auth';
import { generateRandomString } from '@/lib/utils';
import type { ApiResponse, AdminDashboardStats } from '@/lib/types';

// GET /api/admin/dashboard - Get dashboard statistics
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

    await connectDB();

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // User statistics
    const [
      totalUsers,
      activeUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      newUsersLastMonth
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ createdAt: { $gte: today } }),
      User.countDocuments({ createdAt: { $gte: thisWeek } }),
      User.countDocuments({ createdAt: { $gte: thisMonth } }),
      User.countDocuments({ createdAt: { $gte: lastMonth, $lt: lastMonthEnd } })
    ]);

    // Listing statistics
    const [
      totalListings,
      activeListings,
      soldListings,
      expiredListings,
      newListingsToday,
      newListingsThisMonth,
      newListingsLastMonth
    ] = await Promise.all([
      Listing.countDocuments(),
      Listing.countDocuments({ status: 'active' }),
      Listing.countDocuments({ status: 'sold' }),
      Listing.countDocuments({ status: 'expired' }),
      Listing.countDocuments({ createdAt: { $gte: today } }),
      Listing.countDocuments({ createdAt: { $gte: thisMonth } }),
      Listing.countDocuments({ createdAt: { $gte: lastMonth, $lt: lastMonthEnd } })
    ]);

    // Revenue statistics
    const revenueThisMonth = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          completedAt: { $gte: thisMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const revenueLastMonth = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          completedAt: { $gte: lastMonth, $lt: lastMonthEnd }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const totalRevenue = await Payment.aggregate([
      {
        $match: { status: 'completed' }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Activity statistics
    const { Report, Message } = require('@/models');
    const [
      pendingReports,
      totalReports,
      recentMessages,
      activeChats
    ] = await Promise.all([
      Report.countDocuments({ status: 'pending' }),
      Report.countDocuments(),
      Message.countDocuments({ createdAt: { $gte: today } }),
      Message.distinct('conversation').then(conversations => conversations.length)
    ]);

    // Calculate growth percentages
    const userGrowth = newUsersLastMonth > 0 
      ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100 
      : 0;

    const listingGrowth = newListingsLastMonth > 0 
      ? ((newListingsThisMonth - newListingsLastMonth) / newListingsLastMonth) * 100 
      : 0;

    const revenueGrowth = revenueLastMonth[0]?.total > 0 
      ? ((revenueThisMonth[0]?.total || 0) - revenueLastMonth[0].total) / revenueLastMonth[0].total * 100 
      : 0;

    const stats: AdminDashboardStats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        newToday: newUsersToday,
        newThisWeek: newUsersThisWeek,
        newThisMonth: newUsersThisMonth,
        growth: userGrowth
      },
      listings: {
        total: totalListings,
        active: activeListings,
        sold: soldListings,
        expired: expiredListings,
        newToday: newListingsToday,
        growth: listingGrowth
      },
      revenue: {
        total: totalRevenue[0]?.total || 0,
        thisMonth: revenueThisMonth[0]?.total || 0,
        lastMonth: revenueLastMonth[0]?.total || 0,
        growth: revenueGrowth,
        avgOrderValue: totalRevenue[0]?.total ? totalRevenue[0].total / totalListings : 0
      },
      activity: {
        messages: recentMessages,
        reports: totalReports,
        pendingReports: pendingReports,
        activeChats: activeChats
      }
    };

    const response: ApiResponse<AdminDashboardStats> = {
      success: true,
      data: stats,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: generateRandomString(8),
        version: '1.0'
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('GET /api/admin/dashboard error:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch dashboard stats'
      }
    }, { status: 500 });
  }
}