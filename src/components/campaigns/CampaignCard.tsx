import { useFocusEffect } from 'expo-router';
import { ArrowRight, Phone } from 'lucide-react-native';
import { useCallback, useMemo } from 'react';
import { PanResponder, Pressable, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Extrapolation,
  FadeIn,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { ProgressRing } from '@/components/campaigns/ProgressRing';
import { STATUS_STYLES } from '@/components/campaigns/labels';
import { Avatar } from '@/components/common/Avatar';
import { CARD_SHADOW } from '@/components/home/shared';
import { callNumber, openWhatsApp } from '@/components/leads/contact';
import { DEAL_LABELS } from '@/components/leads/labels';
import { WhatsAppIcon } from '@/components/leads/WhatsAppIcon';
import { usePressScale } from '@/hooks/usePressScale';
import type { Campaign } from '@/services/campaignsService';
import { dayMonth } from '@/utils/dates';
import { formatInr } from '@/utils/format';

// One campaign in the list, tinted by its status, the same shape as a lead card: the brand and
// campaign, when it was converted, its deal, budget and creators, its progress, and one-tap call
// / WhatsApp to the brand's contact. Tap it, or swipe it right, to open the campaign.

// How far a swipe has to travel (or how fast it has to be flung) to open the campaign.
const OPEN_DISTANCE = 96;
const OPEN_VELOCITY = 0.8;

function Tag({ label }: { label: string }) {
  return (
    <View className="shrink rounded-full border border-[rgba(232,229,223,0.1)] bg-white/75 px-2 py-0.5">
      <Text numberOfLines={1} className="font-inter text-[10px] leading-[15px] text-[#8C8A84]">
        {label}
      </Text>
    </View>
  );
}

export function CampaignCard({ campaign, onOpen }: { campaign: Campaign; onOpen: () => void }) {
  const { width } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const translateX = useSharedValue(0);
  const press = usePressScale(0.98);
  const callPress = usePressScale(0.88);
  const chatPress = usePressScale(0.88);
  const status = STATUS_STYLES[campaign.status];
  const title = campaign.brand ?? campaign.name;
  const converted = dayMonth(new Date(campaign.createdAt));

  const tags = [
    DEAL_LABELS[campaign.dealType],
    campaign.budget === null ? null : `Budget ${formatInr(campaign.budget)}`,
    `${campaign.creatorCount} ${campaign.creatorCount === 1 ? 'creator' : 'creators'}`,
  ].filter((tag) => tag !== null);

  // The card leaves the screen on a swipe, so put it back when the list is shown again.
  useFocusEffect(
    useCallback(() => {
      translateX.set(0);
    }, [translateX]),
  );

  const pan = useMemo(
    () =>
      PanResponder.create({
        // Captured (from the card's Pressable) only for a clearly rightward drag, so taps and
        // vertical scrolls still go through.
        onMoveShouldSetPanResponderCapture: (_, g) =>
          g.dx > 8 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
        onPanResponderTerminationRequest: () => false,
        onPanResponderMove: (_, g) => {
          translateX.set(Math.max(0, g.dx));
        },
        onPanResponderRelease: (_, g) => {
          if (g.dx < OPEN_DISTANCE && g.vx < OPEN_VELOCITY) {
            translateX.set(withSpring(0, { damping: 18, stiffness: 220 }));
          } else if (reduceMotion) {
            translateX.set(0);
            onOpen();
          } else {
            translateX.set(
              withTiming(width, { duration: 180 }, (finished) => {
                if (finished) scheduleOnRN(onOpen);
              }),
            );
          }
        },
        onPanResponderTerminate: () => {
          translateX.set(withSpring(0, { damping: 18, stiffness: 220 }));
        },
      }),
    [translateX, width, reduceMotion, onOpen],
  );

  const swipeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));
  const hintStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, OPEN_DISTANCE], [0, 1], Extrapolation.CLAMP),
  }));

  return (
    <View>
      {/* Revealed behind the card as it's swiped. Hidden at rest, so it can't show through. */}
      <Animated.View
        style={[hintStyle, { backgroundColor: status.tint }]}
        className="absolute inset-0 flex-row items-center gap-2 rounded-3xl px-5"
      >
        <Text className="font-inter-bold text-sm leading-[17px] text-[#141311]">Open</Text>
        <ArrowRight size={16} color="#141311" strokeWidth={2} />
      </Animated.View>

      <Animated.View style={swipeStyle} {...pan.panHandlers}>
        <Animated.View style={press.style}>
          <Pressable
            {...press.handlers}
            onPress={onOpen}
            accessibilityRole="button"
            accessibilityLabel={`${title}, ${campaign.name}, ${status.label}, ${campaign.progress}% done, ${tags.join(', ')}, converted ${converted}`}
            accessibilityHint="Opens the campaign"
            className="gap-4 rounded-3xl border p-4"
            style={{
              backgroundColor: status.tint,
              borderColor: status.border,
              boxShadow: CARD_SHADOW,
            }}
          >
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1 flex-row items-center gap-3">
                <View className="rounded-full border border-white">
                  <Avatar name={title} url={null} size={44} />
                </View>
                <View className="flex-1">
                  <Text
                    numberOfLines={1}
                    className="font-inter-bold text-sm leading-5 tracking-[-0.35px] text-[#141311]"
                  >
                    {title}
                  </Text>
                  <Text numberOfLines={1} className="font-inter text-xs leading-4 text-[#8C8A84]">
                    {campaign.brand ? `${campaign.name} · ${converted}` : converted}
                  </Text>
                </View>
              </View>
              <Animated.View
                // Re-keyed so a status change (e.g. completed) pops the new label in.
                key={campaign.status}
                entering={reduceMotion ? undefined : FadeIn.duration(250)}
                className="rounded-full border border-[rgba(232,229,223,0.4)] bg-white px-2 py-1"
              >
                <Text className="font-inter-bold text-[10px] uppercase leading-[15px] tracking-[0.25px] text-[#141311]">
                  {status.label}
                </Text>
              </Animated.View>
            </View>

            <View className="flex-row flex-wrap gap-2">
              {tags.map((tag) => (
                <Tag key={tag} label={tag} />
              ))}
            </View>

            <View className="flex-row items-center justify-between gap-3">
              <View className="flex-row items-center gap-3">
                <ProgressRing percent={campaign.progress} />
                <View>
                  <Text className="font-inter-semibold text-[10px] leading-[15px] text-[#94A3B8]">
                    Progress
                  </Text>
                  <Text className="font-inter-semibold text-base leading-4 text-[#0F172A]">
                    {campaign.progress}%
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center gap-[7px]">
                <Animated.View style={callPress.style}>
                  <Pressable
                    {...callPress.handlers}
                    onPress={() => callNumber(campaign.phone, campaign.contactName)}
                    hitSlop={4}
                    accessibilityRole="button"
                    accessibilityLabel={`Call ${campaign.contactName}`}
                    className={`h-[30px] w-[30px] items-center justify-center rounded-full bg-white ${
                      campaign.phone ? '' : 'opacity-50'
                    }`}
                  >
                    <Phone size={16} color="#000000" strokeWidth={1.5} />
                  </Pressable>
                </Animated.View>
                <Animated.View style={chatPress.style}>
                  <Pressable
                    {...chatPress.handlers}
                    onPress={() => openWhatsApp(campaign.phone, campaign.contactName)}
                    hitSlop={4}
                    accessibilityRole="button"
                    accessibilityLabel={`WhatsApp ${campaign.contactName}`}
                    className={campaign.phone ? undefined : 'opacity-50'}
                  >
                    <WhatsAppIcon size={30} />
                  </Pressable>
                </Animated.View>
              </View>
            </View>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </View>
  );
}
