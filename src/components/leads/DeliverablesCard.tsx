import { Link2, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOut,
  LinearTransition,
  useReducedMotion,
} from 'react-native-reanimated';

import { openLink } from '@/components/leads/contact';
import { CONTENT_STYLES } from '@/components/leads/labels';
import { useAddDeliverableLink } from '@/hooks/useLeads';
import type { Deliverable, DeliverableLink } from '@/services/leadsService';
import { PLACEHOLDER_COLOR } from '@/utils/constants';
import { showToast } from '@/utils/notifications';
import { normalizeLink, sanitizeLinkInput } from '@/utils/sanitize';

// What the brand wants made, then a field to attach links to the finished pieces (a posted reel,
// a Drive folder). Added links slide in under the field, newest first, and open on tap.

function DeliverableRow({ deliverable, last }: { deliverable: Deliverable; last: boolean }) {
  const { icon: Icon, color, background } = CONTENT_STYLES[deliverable.type];

  return (
    <View
      accessible
      accessibilityLabel={`${deliverable.title}${deliverable.note ? `, ${deliverable.note}` : ''}`}
      className={`flex-row items-center ${last ? 'pt-3' : 'border-b border-[#F2F2F7] py-3'}`}
    >
      <View
        className="mr-3 h-10 w-10 items-center justify-center rounded-xl"
        style={{ backgroundColor: background }}
      >
        <Icon size={20} color={color} strokeWidth={1.67} />
      </View>
      <View className="flex-1 gap-0.5">
        <Text
          numberOfLines={1}
          className="font-inter-semibold text-[15px] leading-[18px] text-[#1D1D1F]"
        >
          {deliverable.title}
        </Text>
        {deliverable.note ? (
          <Text numberOfLines={1} className="font-inter text-[13px] leading-4 text-[#8A8A8E]">
            {deliverable.note}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function LinkItem({ link }: { link: DeliverableLink }) {
  const reduceMotion = useReducedMotion();
  const label = link.url.replace(/^https:\/\//, '');

  return (
    <Animated.View
      entering={reduceMotion ? undefined : FadeInDown.duration(260)}
      exiting={reduceMotion ? undefined : FadeOut.duration(150)}
      layout={reduceMotion ? undefined : LinearTransition.duration(220)}
    >
      <Pressable
        onPress={() => openLink(link.url)}
        accessibilityRole="link"
        accessibilityLabel={`Open ${label}`}
        className="flex-row items-center gap-2 rounded-xl bg-[#F9F9F9] px-3 py-2.5 active:opacity-70"
      >
        <Link2 size={14} color="#8A8A8E" strokeWidth={1.67} />
        <Text
          numberOfLines={1}
          className="flex-1 font-inter-medium text-[13px] leading-4 text-[#1D1D1F]"
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

interface DeliverablesCardProps {
  leadId: string;
  deliverables: Deliverable[];
  links: DeliverableLink[];
}

export function DeliverablesCard({ leadId, deliverables, links }: DeliverablesCardProps) {
  const reduceMotion = useReducedMotion();
  const addLink = useAddDeliverableLink(leadId);
  const [text, setText] = useState('');
  const [invalid, setInvalid] = useState(false);

  const submit = () => {
    if (!text || addLink.isPending) return;
    const url = normalizeLink(text);
    if (!url) {
      setInvalid(true);
      return;
    }
    addLink.mutate(url, {
      onSuccess: () => {
        setText('');
        showToast('Link added');
      },
    });
  };

  const error = invalid
    ? 'That doesn’t look like a link. Paste the full address.'
    : addLink.isError
      ? 'We couldn’t add that link. Please try again.'
      : null;

  return (
    <Animated.View
      layout={reduceMotion ? undefined : LinearTransition.duration(250)}
      className="gap-4 rounded-[20px] border border-[rgba(232,226,217,0.5)] bg-white px-5 pb-5 pt-6"
    >
      <View className="flex-row items-center justify-between">
        <Text className="font-inter-semibold text-base leading-5 text-[#1D1D1F]">Deliverables</Text>
        <Pressable
          // TODO(leads): open the add-deliverable sheet once it's designed.
          onPress={() => showToast('Adding deliverables is coming soon')}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel="Add deliverable"
          className="h-8 w-8 items-center justify-center rounded-full bg-[#F4F4F6] active:opacity-70"
        >
          <Plus size={14} color="#1D1D1F" strokeWidth={1.67} />
        </Pressable>
      </View>

      {deliverables.length > 0 ? (
        <View>
          {deliverables.map((deliverable, i) => (
            <DeliverableRow
              key={deliverable.id}
              deliverable={deliverable}
              last={i === deliverables.length - 1}
            />
          ))}
        </View>
      ) : (
        <Text className="font-inter text-sm leading-[21px] text-[#6E6E73]">
          No deliverables agreed yet.
        </Text>
      )}

      <View className="h-[52px] flex-row items-center rounded-2xl bg-[#F9F9F9] pl-4 pr-2.5">
        <TextInput
          value={text}
          onChangeText={(next) => {
            setText(sanitizeLinkInput(next));
            setInvalid(false);
            if (addLink.isError) addLink.reset();
          }}
          onSubmitEditing={submit}
          placeholder="Add deliverable link..."
          placeholderTextColor={PLACEHOLDER_COLOR}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          returnKeyType="send"
          submitBehavior="blurAndSubmit"
          accessibilityLabel="Deliverable link"
          className="flex-1 py-0 font-inter text-sm leading-[17px] text-[#1D1D1F]"
        />
        <Pressable
          onPress={submit}
          disabled={!text || addLink.isPending}
          accessibilityRole="button"
          accessibilityLabel="Submit link"
          accessibilityState={{ disabled: !text, busy: addLink.isPending }}
          className={`ml-3 h-9 min-w-[84px] items-center justify-center rounded-3xl bg-cocoa px-5 active:opacity-80 ${
            text ? '' : 'opacity-60'
          }`}
        >
          {addLink.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text className="text-center font-inter-semibold text-[13px] leading-4 text-white">
              Submit
            </Text>
          )}
        </Pressable>
      </View>

      {error ? (
        <Text
          accessibilityLiveRegion="polite"
          className="-mt-2 pl-1 font-inter-medium text-[13px] leading-4 text-rose-500"
        >
          {error}
        </Text>
      ) : null}

      {links.length > 0 ? (
        <View className="-mt-1 gap-2">
          {links.map((link) => (
            <LinkItem key={link.id} link={link} />
          ))}
        </View>
      ) : null}
    </Animated.View>
  );
}
