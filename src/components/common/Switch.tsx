import { Switch as NativeSwitch } from 'react-native';

// The app's on/off switch: the platform switch in neutral greys. It sits inside a row that is
// itself the accessible switch, so screen readers skip it rather than announce it twice.

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export function Switch({ value, onValueChange, disabled = false }: SwitchProps) {
  return (
    <NativeSwitch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ false: '#D4D4D4', true: '#525252' }}
      thumbColor="#FAFAFA"
      ios_backgroundColor="#D4D4D4"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}
