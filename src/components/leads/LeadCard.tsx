import { useFocusEffect } from 'expo-router';
import { ArrowRight, Phone, Trash2 } from 'lucide-react-native';
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
  ZoomIn,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { Avatar } from '@/components/common/Avatar';
import { CARD_SHADOW } from '@/components/home/shared';
import { callNumber, openWhatsApp } from '@/components/leads/contact';
import { CONTENT_STYLES, DEAL_LABELS, STATUS_STYLES } from '@/components/leads/labels';
import { WhatsAppIcon } from '@/components/leads/WhatsAppIcon';
import { usePressScale } from '@/hooks/usePressScale';
import type { Lead } from '@/services/leadsService';
import { dayMonth } from '@/utils/dates';
import { formatInr } from '@/utils/format';

// One lead in the list, tinted by its status: who it is, what they want, when it came in, and
// one-tap call / WhatsApp. A coral dot on the photo marks a lead nobody has replied to. Tap it,
// or swipe it right, to open the lead; swipe it left to delete it.

// How far a swipe has to travel (or how fast it has to be flung) to open or delete the lead.
const OPEN_DISTANCE = 96;
const OPEN_VELOCITY = 0.8;
const DELETE_RED = '#E74C3C';

function Tag({ label }: { label: string }) {
  return (
    <View className="shrink rounded-full border border-[rgba(232,229,223,0.1)] bg-white/75 px-2 py-0.5">
      <Text numberOfLines={1} className="font-inter text-[10px] leading-[15px] text-[#8C8A84]">
        {label}
      </Text>
    </View>
  );
}

interface LeadCardProps {
  lead: Lead;
  onOpen: () => void;
  // Asks before deleting; the card springs back meanwhile.
  onDelete: () => void;
}

export function LeadCard({ lead, onOpen, onDelete }: LeadCardProps) {
  const { width } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const translateX = useSharedValue(0);
  const press = usePressScale(0.98);
  const callPress = usePressScale(0.88);
  const chatPress = usePressScale(0.88);
  const status = STATUS_STYLES[lead.status];
  const received = dayMonth(new Date(lead.receivedAt));

  const tags = [
    DEAL_LABELS[lead.dealType],
    lead.budget === null ? null : `Budget ${formatInr(lead.budget)}`,
    lead.brand,
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
        // Captured (from the card's Pressable) only for a clearly sideways drag, so taps and
        // vertical scrolls still go through.
        onMoveShouldSetPanResponderCapture: (_, g) =>
          Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
        onPanResponderTerminationRequest: () => false,
        onPanResponderMove: (_, g) => {
          // Leftward it only goes far enough to show the delete hint.
          translateX.set(Math.max(-OPEN_DISTANCE * 1.5, g.dx));
        },
        onPanResponderRelease: (_, g) => {
          if (g.dx <= -OPEN_DISTANCE || g.vx <= -OPEN_VELOCITY) {
            translateX.set(withSpring(0, { damping: 18, stiffness: 220 }));
            onDelete();
          } else if (g.dx < OPEN_DISTANCE && g.vx < OPEN_VELOCITY) {
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
    [translateX, width, reduceMotion, onOpen, onDelete],
  );

  const swipeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));
  const hintStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, OPEN_DISTANCE], [0, 1], Extrapolation.CLAMP),
  }));
  const deleteHintStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-OPEN_DISTANCE, 0], [1, 0], Extrapolation.CLAMP),
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
      <Animated.View
        style={[deleteHintStyle, { backgroundColor: 'rgba(231, 76, 60, 0.12)' }]}
        className="absolute inset-0 flex-row items-center justify-end gap-2 rounded-3xl px-5"
      >
        <Trash2 size={16} color={DELETE_RED} strokeWidth={2} />
        <Text className="font-inter-bold text-sm leading-[17px]" style={{ color: DELETE_RED }}>
          Delete
        </Text>
      </Animated.View>

      <Animated.View style={swipeStyle} {...pan.panHandlers}>
        <Animated.View style={press.style}>
          <Pressable
            {...press.handlers}
            onPress={onOpen}
            accessibilityRole="button"
            accessibilityLabel={`${lead.needsResponse ? 'Needs response. ' : ''}${lead.name}, ${status.label}, ${tags.join(', ')}, received ${received}`}
            accessibilityHint="Opens the lead"
            accessibilityActions={[{ name: 'delete', label: 'Delete lead' }]}
            onAccessibilityAction={(e) => {
              if (e.nativeEvent.actionName === 'delete') onDelete();
            }}
            className="gap-4 rounded-3xl border p-4"
            style={{
              backgroundColor: status.tint,
              borderColor: status.border,
              boxShadow: CARD_SHADOW,
            }}
          >
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1 flex-row items-center gap-3">
                <View>
                  <View className="rounded-full border border-white">
                    <Avatar name={lead.name} url={lead.avatarUrl} size={44} />
                  </View>
                  {lead.needsResponse ? (
                    <Animated.View
                      entering={reduceMotion ? undefined : ZoomIn.delay(250).springify()}
                      className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-white bg-[#FF7043]"
                    />
                  ) : null}
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-1.5">
                    <Text
                      numberOfLines={1}
                      className="shrink font-inter-bold text-sm leading-5 tracking-[-0.35px] text-[#141311]"
                    >
                      {lead.name}
                    </Text>
                    <View className="flex-row gap-0.5">
                      {lead.contentTypes.map((type) => {
                        const Icon = CONTENT_STYLES[type].icon;
                        return (
                          <Icon
                            key={type}
                            size={12}
                            color="rgba(140, 138, 132, 0.8)"
                            strokeWidth={1.5}
                          />
                        );
                      })}
                    </View>
                  </View>
                  <Text className="font-inter text-xs leading-4 text-[#8C8A84]">{received}</Text>
                </View>
              </View>
              <Animated.View
                // Re-keyed so a status change (e.g. converted) pops the new label in.
                key={lead.status}
                entering={reduceMotion ? undefined : FadeIn.duration(250)}
                className="rounded-full border border-[rgba(232,229,223,0.4)] bg-white px-2 py-1"
              >
                <Text className="font-inter-bold text-[10px] uppercase leading-[15px] tracking-[0.25px] text-[#141311]">
                  {status.label}
                </Text>
              </Animated.View>
            </View>

            <View className="flex-row items-center justify-between gap-3">
              <View className="shrink flex-row gap-3">
                {tags.map((tag) => (
                  <Tag key={tag} label={tag} />
                ))}
              </View>
              <View className="flex-row items-center gap-[7px]">
                <Animated.View style={callPress.style}>
                  <Pressable
                    {...callPress.handlers}
                    onPress={() => callNumber(lead.phone, lead.name)}
                    hitSlop={4}
                    accessibilityRole="button"
                    accessibilityLabel={`Call ${lead.name}`}
                    className={`h-[30px] w-[30px] items-center justify-center rounded-full bg-white ${
                      lead.phone ? '' : 'opacity-50'
                    }`}
                  >
                    <Phone size={16} color="#000000" strokeWidth={1.5} />
                  </Pressable>
                </Animated.View>
                <Animated.View style={chatPress.style}>
                  <Pressable
                    {...chatPress.handlers}
                    onPress={() => openWhatsApp(lead.phone, lead.name)}
                    hitSlop={4}
                    accessibilityRole="button"
                    accessibilityLabel={`WhatsApp ${lead.name}`}
                    className={lead.phone ? undefined : 'opacity-50'}
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
