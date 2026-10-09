import { Eye, EyeOff, type LucideIcon } from 'lucide-react-native';
import { useState, type Ref } from 'react';
import { Pressable, Text, TextInput, View, type TextInputProps } from 'react-native';

// One labelled input on the sign in card. Each field has its own pastel tint (`tint`);
// `secure` adds the show/hide password toggle.

export const FIELD_TINTS = {
  lilac: { backgroundColor: 'rgba(245, 243, 255, 0.7)', borderColor: 'rgba(200, 190, 240, 0.35)' },
  sky: { backgroundColor: 'rgba(243, 248, 255, 0.7)', borderColor: 'rgba(180, 200, 240, 0.35)' },
  rose: { backgroundColor: 'rgba(255, 244, 250, 0.7)', borderColor: 'rgba(230, 175, 205, 0.3)' },
} as const;

interface SignInFieldProps extends TextInputProps {
  label: string;
  icon: LucideIcon;
  tint: keyof typeof FIELD_TINTS;
  secure?: boolean;
  ref?: Ref<TextInput>;
}

export function SignInField({
  label,
  icon: Icon,
  tint,
  secure = false,
  ref,
  ...props
}: SignInFieldProps) {
  const [hidden, setHidden] = useState(true);

  return (
    <View className="gap-1.5">
      <Text className="font-inter-bold text-[11px] uppercase leading-4 tracking-[1.1px] text-black/40">
        {label}
      </Text>
      <View
        className="h-[51px] flex-row items-center gap-3 rounded-[18px] border px-4"
        style={[FIELD_TINTS[tint], { boxShadow: 'inset 0px 1px 3px 1px rgba(0, 0, 0, 0.03)' }]}
      >
        <Icon size={16} color="#AAAAAA" strokeWidth={2} />
        <TextInput
          ref={ref}
          placeholderTextColor="rgba(0, 0, 0, 0.28)"
          accessibilityLabel={label}
          autoCorrect={false}
          secureTextEntry={secure && hidden}
          className="flex-1 py-0 font-inter-medium text-sm text-ink"
          {...props}
        />
        {secure ? (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
          >
            {hidden ? (
              <Eye size={15} color="#CCCCCC" strokeWidth={2} />
            ) : (
              <EyeOff size={15} color="#CCCCCC" strokeWidth={2} />
            )}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
