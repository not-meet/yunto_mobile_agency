import { Text } from 'react-native';

// Small grey caps label over an Add Lead field or section, e.g. "CAMPAIGN TYPE".
export function FieldLabel({ children }: { children: string }) {
  return (
    <Text className="font-inter-semibold text-[11px] uppercase leading-4 tracking-[1.1px] text-[#888888]">
      {children}
    </Text>
  );
}
