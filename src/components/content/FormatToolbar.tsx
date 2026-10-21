import {
  Bold,
  Italic,
  List,
  ListOrdered,
  type LucideIcon,
  Strikethrough,
  Underline,
} from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import type { InlineStyle, ListStyle } from '@/components/content/richText';

// The caption's formatting buttons: bold, italic, underline, strikethrough and the two lists. A
// button is lit while what it does is on, for the selection or for what's typed next.

type Format = InlineStyle | ListStyle;

const BUTTONS: { format: Format; icon: LucideIcon; label: string }[] = [
  { format: 'bold', icon: Bold, label: 'Bold' },
  { format: 'italic', icon: Italic, label: 'Italic' },
  { format: 'underline', icon: Underline, label: 'Underline' },
  { format: 'strike', icon: Strikethrough, label: 'Strikethrough' },
  { format: 'bullet', icon: List, label: 'Bulleted list' },
  { format: 'numbered', icon: ListOrdered, label: 'Numbered list' },
];

interface FormatToolbarProps {
  active: ReadonlySet<Format>;
  onPress: (format: Format) => void;
}

export function FormatToolbar({ active, onPress }: FormatToolbarProps) {
  return (
    <View
      accessibilityRole="toolbar"
      accessibilityLabel="Text formatting"
      className="flex-row items-center gap-1 self-start rounded-2xl border border-white/90 bg-white/70 p-1"
      style={{ boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.03)' }}
    >
      {BUTTONS.map(({ format, icon: Icon, label }, i) => {
        const on = active.has(format);
        return (
          <View key={format} className="flex-row items-center">
            {/* A hairline between the text styles and the lists. */}
            {i === 4 ? <View className="mx-1 h-5 w-px bg-black/[0.06]" /> : null}
            <Pressable
              onPress={() => onPress(format)}
              hitSlop={4}
              accessibilityRole="button"
              accessibilityLabel={label}
              accessibilityState={{ selected: on }}
              className={`h-8 w-8 items-center justify-center rounded-xl active:opacity-70 ${
                on ? 'bg-[rgba(124,58,237,0.12)]' : ''
              }`}
            >
              <Icon size={16} color={on ? '#7C3AED' : '#5C5C60'} strokeWidth={on ? 2.25 : 1.75} />
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}
