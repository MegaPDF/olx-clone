'use client';

import { useTranslation } from 'next-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Package, 
  MessageSquare, 
  DollarSign, 
  AlertTriangle,
  Shield,
  Eye,
  Star,
  TrendingUp,
  MoreVertical,
  ExternalLink,
  Clock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { enUS, id as idLocale } from 'date-fns/locale';

interface ActivityItem {
  id: string;
  type: 'user_registration' | 'listing_created' | 'payment_received' | 'report_submitted' | 'message_sent' | 'listing_promoted' | 'user_verified' | 'subscription_started';
  user: {
    id: string;
    name: string;
    avatar?: string;
    email: string;
  };
  target?: {
    type: 'listing' | 'user' | 'payment';
    id: string;
    title?: string;
    url?: string;
  };
  metadata?: {
    amount?: number;
    currency?: string;
    category?: string;
    location?: string;
    plan?: string;
  };
  priority: 'low' | 'normal' | 'high' | 'urgent';
  timestamp: Date;
}

interface RecentActivityProps {
  activities: ActivityItem[];
  isLoading?: boolean;
  className?: string;
  maxItems?: number;
  onViewAll?: () => void;
  onItemClick?: (activity: ActivityItem) => void;
}

export function RecentActivity({ 
  activities, 
  isLoading = false, 
  className,
  maxItems = 10,
  onViewAll,
  onItemClick
}: RecentActivityProps) {
  const { t, i18n } = useTranslation(['admin', 'common']);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'user_registration':
        return <User className="h-4 w-4 text-blue-600" />;
      case 'listing_created':
        return <Package className="h-4 w-4 text-green-600" />;
      case 'payment_received':
        return <DollarSign className="h-4 w-4 text-yellow-600" />;
      case 'report_submitted':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'message_sent':
        return <MessageSquare className="h-4 w-4 text-purple-600" />;
      case 'listing_promoted':
        return <TrendingUp className="h-4 w-4 text-orange-600" />;
      case 'user_verified':
        return <Shield className="h-4 w-4 text-emerald-600" />;
      case 'subscription_started':
        return <Star className="h-4 w-4 text-indigo-600" />;
      default:
        return <Eye className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'user_registration':
        return 'bg-blue-50 border-blue-200';
      case 'listing_created':
        return 'bg-green-50 border-green-200';
      case 'payment_received':
        return 'bg-yellow-50 border-yellow-200';
      case 'report_submitted':
        return 'bg-red-50 border-red-200';
      case 'message_sent':
        return 'bg-purple-50 border-purple-200';
      case 'listing_promoted':
        return 'bg-orange-50 border-orange-200';
      case 'user_verified':
        return 'bg-emerald-50 border-emerald-200';
      case 'subscription_started':
        return 'bg-indigo-50 border-indigo-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getPriorityBadge = (priority: ActivityItem['priority']) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive" className="text-xs">{t('common.urgent')}</Badge>;
      case 'high':
        return <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">{t('common.high')}</Badge>;
      case 'normal':
        return <Badge variant="secondary" className="text-xs">{t('common.normal')}</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-xs">{t('common.low')}</Badge>;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getActivityTitle = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'user_registration':
        return t('activity.user_registered');
      case 'listing_created':
        return t('activity.listing_created');
      case 'payment_received':
        return t('activity.payment_received');
      case 'report_submitted':
        return t('activity.report_submitted');
      case 'message_sent':
        return t('activity.message_sent');
      case 'listing_promoted':
        return t('activity.listing_promoted');
      case 'user_verified':
        return t('activity.user_verified');
      case 'subscription_started':
        return t('activity.subscription_started');
      default:
        return t('activity.unknown');
    }
  };

  const getActivityDescription = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'user_registration':
        return t('activity.descriptions.user_registered', { location: activity.metadata?.location });
      case 'listing_created':
        return t('activity.descriptions.listing_created', { 
          title: activity.target?.title,
          category: activity.metadata?.category 
        });
      case 'payment_received':
        return t('activity.descriptions.payment_received', { 
          amount: activity.metadata?.amount ? formatCurrency(activity.metadata.amount, activity.metadata.currency) : ''
        });
      case 'report_submitted':
        return t('activity.descriptions.report_submitted', { target: activity.target?.title });
      case 'message_sent':
        return t('activity.descriptions.message_sent');
      case 'listing_promoted':
        return t('activity.descriptions.listing_promoted', { title: activity.target?.title });
      case 'user_verified':
        return t('activity.descriptions.user_verified');
      case 'subscription_started':
        return t('activity.descriptions.subscription_started', { plan: activity.metadata?.plan });
      default:
        return t('activity.descriptions.unknown');
    }
  };

  const formatTimeAgo = (date: Date) => {
    const locale = i18n.language === 'id' ? idLocale : enUS;
    return formatDistanceToNow(date, { addSuffix: true, locale });
  };

  if (isLoading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="h-6 w-32 bg-muted rounded animate-pulse" />
            <div className="h-8 w-20 bg-muted rounded animate-pulse" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start space-x-3 animate-pulse">
                <div className="h-10 w-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-1/2 bg-muted rounded" />
                </div>
                <div className="h-6 w-12 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayedActivities = activities.slice(0, maxItems);

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <span>{t('activity.recent_activity')}</span>
          </CardTitle>
          {onViewAll && (
            <Button variant="outline" size="sm" onClick={onViewAll}>
              {t('common.view_all')}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {displayedActivities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('activity.no_recent_activity')}</p>
              </div>
            ) : (
              displayedActivities.map((activity) => (
                <div
                  key={activity.id}
                  className={cn(
                    'flex items-start space-x-3 p-3 rounded-lg border transition-colors hover:bg-muted/50 cursor-pointer',
                    getActivityColor(activity.type)
                  )}
                  onClick={() => onItemClick?.(activity)}
                >
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                        <AvatarFallback className="text-sm">
                          {activity.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 p-1 bg-background rounded-full border">
                        {getActivityIcon(activity.type)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {getActivityTitle(activity)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          <span className="font-medium">{activity.user.name}</span> {getActivityDescription(activity)}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(activity.timestamp)}
                          </span>
                          {activity.priority !== 'normal' && getPriorityBadge(activity.priority)}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        {activity.target?.url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(activity.target?.url, '_blank');
                            }}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onItemClick?.(activity)}>
                              {t('common.view_details')}
                            </DropdownMenuItem>
                            {activity.target?.url && (
                              <DropdownMenuItem onClick={() => window.open(activity.target?.url, '_blank')}>
                                {t('common.open_in_new_tab')}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        
        {activities.length > maxItems && (
          <div className="border-t pt-3 mt-3">
            <div className="text-center">
              <Button variant="outline" onClick={onViewAll}>
                {t('activity.view_all_activities', { count: activities.length - maxItems })}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}