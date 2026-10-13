import { Switch as NativeSwitch } from 'react-native';

// The app's on/off switch: the platform switch in neutral greys. Inside a row that is itself the
// accessible switch, leave out `label` so screen readers skip it rather than announce it twice.
// On its own, pass `label` and it is the accessible switch.

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  label?: string;
}

export function Switch({ value, onValueChange, disabled = false, label }: SwitchProps) {
  return (
    <NativeSwitch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ false: '#D4D4D4', true: '#525252' }}
      thumbColor="#FAFAFA"
      ios_backgroundColor="#D4D4D4"
      {...(label === undefined
        ? { accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' }
        : { accessibilityLabel: label })}
    />
  );
}
