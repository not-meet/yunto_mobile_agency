import {
  Bell,
  CircleAlert,
  Clock,
  FileCheck,
  IndianRupee,
  type LucideIcon,
  MessageSquareText,
  Tag,
  UserPlus,
  Wallet,
} from 'lucide-react-native';

import type {
  AppNotification,
  AttentionKind,
  NotificationKind,
} from '@/services/notificationService';
import { dayMonth, daysFromToday, timeLabel } from '@/utils/dates';

// Filters, hues and day grouping for the notifications screen.

export type NotificationFilter = 'all' | 'leads' | 'campaigns' | 'payments';

export const FILTERS: { key: NotificationFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'leads', label: 'Leads' },
  { key: 'campaigns', label: 'Campaigns' },
  { key: 'payments', label: 'Payments' },
];

// Unknown kinds only show under "All".
const ATTENTION_FILTER: Record<AttentionKind, NotificationFilter> = {
  leads: 'leads',
  deadline: 'campaigns',
  payment: 'payments',
  review: 'campaigns',
  UNKNOWN: 'all',
};

const NOTIFICATION_FILTER: Record<NotificationKind, NotificationFilter> = {
  lead: 'leads',
  offer: 'campaigns',
  campaign: 'campaigns',
  payment: 'payments',
  review: 'campaigns',
  UNKNOWN: 'all',
};

export function attentionMatches(kind: AttentionKind, filter: NotificationFilter): boolean {
  return filter === 'all' || ATTENTION_FILTER[kind] === filter;
}

export function notificationMatches(kind: NotificationKind, filter: NotificationFilter): boolean {
  return filter === 'all' || NOTIFICATION_FILTER[kind] === filter;
}

interface AttentionStyle {
  icon: LucideIcon;
  // Icon, chevron and swipe hint.
  color: string;
  background: string;
  shadow: string;
  iconShadow: string;
  subtitleColor: string;
}

export const ATTENTION_STYLES: Record<AttentionKind, AttentionStyle> = {
  leads: {
    icon: CircleAlert,
    color: '#FF7043',
    background:
      'linear-gradient(102.86deg, rgba(255, 235, 238, 0.95) 0%, rgba(255, 243, 224, 0.95) 100%)',
    shadow: '0px 8px 24px rgba(255, 112, 67, 0.08)',
    iconShadow: '0px 4px 12px rgba(255, 112, 67, 0.12)',
    subtitleColor: 'rgba(0, 0, 0, 0.5)',
  },
  deadline: {
    icon: Clock,
    color: '#E53935',
    background:
      'linear-gradient(105.12deg, rgba(255, 235, 238, 0.95) 0%, rgba(253, 237, 236, 0.95) 100%)',
    shadow: '0px 8px 24px rgba(229, 57, 53, 0.06)',
    iconShadow: '0px 4px 12px rgba(229, 57, 53, 0.1)',
    subtitleColor: 'rgba(229, 57, 53, 0.7)',
  },
  payment: {
    icon: IndianRupee,
    color: '#F57C00',
    background:
      'linear-gradient(102.86deg, rgba(255, 243, 224, 0.95) 0%, rgba(255, 236, 179, 0.95) 100%)',
    shadow: '0px 8px 24px rgba(245, 124, 0, 0.06)',
    iconShadow: '0px 4px 12px rgba(245, 124, 0, 0.1)',
    subtitleColor: 'rgba(0, 0, 0, 0.5)',
  },
  review: {
    icon: MessageSquareText,
    color: '#E05D26',
    background:
      'linear-gradient(102.86deg, rgba(253, 231, 219, 0.95) 0%, rgba(255, 243, 236, 0.95) 100%)',
    shadow: '0px 8px 24px rgba(224, 93, 38, 0.08)',
    iconShadow: '0px 4px 12px rgba(224, 93, 38, 0.12)',
    subtitleColor: 'rgba(0, 0, 0, 0.5)',
  },
  UNKNOWN: {
    icon: Bell,
    color: '#6E6E73',
    background:
      'linear-gradient(102.86deg, rgba(245, 245, 247, 0.95) 0%, rgba(250, 250, 252, 0.95) 100%)',
    shadow: '0px 8px 24px rgba(0, 0, 0, 0.04)',
    iconShadow: '0px 4px 12px rgba(0, 0, 0, 0.06)',
    subtitleColor: 'rgba(0, 0, 0, 0.5)',
  },
};

// Icon, its tile tint and the unread dot.
export const NOTIFICATION_STYLES: Record<
  NotificationKind,
  { icon: LucideIcon; color: string; tint: string }
> = {
  offer: { icon: Tag, color: '#9C27B0', tint: 'rgba(156, 39, 176, 0.1)' },
  lead: { icon: UserPlus, color: '#FF7043', tint: 'rgba(255, 112, 67, 0.1)' },
  campaign: { icon: FileCheck, color: '#1E88E5', tint: 'rgba(30, 136, 229, 0.1)' },
  payment: { icon: Wallet, color: '#43A047', tint: 'rgba(67, 160, 71, 0.1)' },
  review: { icon: MessageSquareText, color: '#E05D26', tint: 'rgba(224, 93, 38, 0.1)' },
  UNKNOWN: { icon: Bell, color: '#6E6E73', tint: 'rgba(110, 110, 115, 0.1)' },
};

export interface NotificationSection {
  title: string;
  data: AppNotification[];
}

// Today, Yesterday, then everything older under Earlier; empty days are left out.
export function groupByDay(notifications: AppNotification[]): NotificationSection[] {
  const today: AppNotification[] = [];
  const yesterday: AppNotification[] = [];
  const earlier: AppNotification[] = [];
  for (const n of notifications) {
    const days = daysFromToday(new Date(n.createdAt));
    (days >= 0 ? today : days === -1 ? yesterday : earlier).push(n);
  }
  return [
    { title: 'Today', data: today },
    { title: 'Yesterday', data: yesterday },
    { title: 'Earlier', data: earlier },
  ].filter((section) => section.data.length > 0);
}

// "Now" / "12m ago" / "3h ago" today, the time yesterday, else the date ("20 Sep").
export function notificationTime(createdAt: string): string {
  const date = new Date(createdAt);
  const days = daysFromToday(date);
  if (days >= 0) {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60_000);
    if (minutes < 1) return 'Now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  }
  if (days === -1) return timeLabel(date);
  return dayMonth(date);
}
