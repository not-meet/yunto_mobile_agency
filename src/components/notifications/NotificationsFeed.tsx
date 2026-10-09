import { router } from 'expo-router';
import { BellOff } from 'lucide-react-native';
import { RefreshControl, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  LinearTransition,
  useReducedMotion,
} from 'react-native-reanimated';

import { AttentionCard } from '@/components/notifications/AttentionCard';
import {
  attentionMatches,
  groupByDay,
  type NotificationFilter,
  notificationMatches,
} from '@/components/notifications/labels';
import { NotificationCard } from '@/components/notifications/NotificationCard';
import { useDismissAttention, useMarkNotificationRead } from '@/hooks/useNotifications';
import type { AppNotification, AttentionItem, Notifications } from '@/services/notificationService';
import { showToast } from '@/utils/notifications';

// "Needs your attention" cards, then notifications under Today / Yesterday / Earlier, all
// narrowed to the selected filter. Cards below a dismissed one slide up into its place.
// TODO(notifications): render with a SectionList and load older days on scroll once the API
// paginates (see useNotifications).

const STAGGER_MS = 50;
const MAX_STAGGERED = 6;
const LAYOUT = LinearTransition.duration(240);

// Campaigns and payments don't have screens in this app yet, so their notifications say so.
// TODO(notifications): open the campaign and deliverables screens once they exist.
function openAttention(item: AttentionItem) {
  if (item.kind === 'review' || item.kind === 'deadline') showToast('Campaigns are coming soon');
  else if (item.kind === 'leads') {
    router.push({ pathname: '/leads', params: { filter: 'needs-response' } });
  } else if (item.kind === 'payment') showToast('Payments are coming soon');
}

function openNotification(notification: AppNotification) {
  if (notification.kind === 'lead') router.push('/leads');
  else if (notification.kind === 'payment') showToast('Payments are coming soon');
  else if (notification.kind !== 'UNKNOWN') showToast('Campaigns are coming soon');
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Text
      accessibilityRole="header"
      className="font-grotesk-medium text-lg leading-5 tracking-[-0.51px] text-espresso"
    >
      {children}
    </Text>
  );
}

interface NotificationsFeedProps {
  feed: Notifications;
  filter: NotificationFilter;
  refreshing: boolean;
  onRefresh: () => void;
  bottomInset: number;
}

export function NotificationsFeed({
  feed,
  filter,
  refreshing,
  onRefresh,
  bottomInset,
}: NotificationsFeedProps) {
  const reduceMotion = useReducedMotion();
  const dismiss = useDismissAttention();
  const markRead = useMarkNotificationRead();

  const attention = feed.attention.filter((item) => attentionMatches(item.kind, filter));
  const sections = groupByDay(
    feed.notifications.filter((n) => notificationMatches(n.kind, filter)),
  );

  // Each card eases in a beat after the one above it, capped so long lists don't lag.
  let order = 0;
  const enter = () =>
    reduceMotion
      ? undefined
      : FadeInDown.delay(Math.min(order++, MAX_STAGGERED) * STAGGER_MS).duration(280);

  return (
    <Animated.ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: bottomInset + 24, gap: 28 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {attention.length > 0 ? (
        <Animated.View layout={LAYOUT} exiting={FadeOut.duration(160)} className="gap-3">
          <SectionTitle>Needs your attention</SectionTitle>
          {attention.map((item) => (
            <Animated.View
              key={item.id}
              entering={enter()}
              exiting={FadeOut.duration(160)}
              layout={LAYOUT}
            >
              <AttentionCard
                item={item}
                onOpen={() => openAttention(item)}
                onDismiss={() => dismiss.mutate(item.id)}
              />
            </Animated.View>
          ))}
        </Animated.View>
      ) : null}

      {sections.map((section) => (
        <Animated.View key={section.title} layout={LAYOUT} className="gap-3">
          <SectionTitle>{section.title}</SectionTitle>
          {section.data.map((notification) => (
            <Animated.View key={notification.id} entering={enter()} layout={LAYOUT}>
              <NotificationCard
                notification={notification}
                onPress={() => {
                  if (!notification.read) markRead.mutate(notification.id);
                  openNotification(notification);
                }}
              />
            </Animated.View>
          ))}
        </Animated.View>
      ))}

      {attention.length === 0 && sections.length === 0 ? (
        <Animated.View entering={FadeIn.duration(250)} className="items-center gap-3 py-16">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-white/70">
            <BellOff size={24} color="#9A8EA3" strokeWidth={1.67} />
          </View>
          <Text className="text-center font-inter-medium text-[15px] leading-5 text-muted">
            You’re all caught up.
          </Text>
        </Animated.View>
      ) : null}
    </Animated.ScrollView>
  );
}
