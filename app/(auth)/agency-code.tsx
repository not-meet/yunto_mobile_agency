import { useState } from 'react';
import { Text, View } from 'react-native';

import { AgencyHeader } from '@/components/auth/AgencyHeader';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { GlassPanel } from '@/components/auth/GlassPanel';
import { GradientButton } from '@/components/auth/GradientButton';
import { PillField } from '@/components/auth/PillField';
import { useConnectAgency } from '@/hooks/useAuth';
import { AGENCY_CODE_LENGTH } from '@/services/authService';

// "Enter Agency Code": join an existing agency workspace.
export default function AgencyCodeScreen() {
  const [code, setCode] = useState('');
  const connect = useConnectAgency();

  const submit = () => {
    if (code.length === AGENCY_CODE_LENGTH && !connect.isPending) connect.mutate({ code });
  };

  return (
    <AuthScreen className="gap-8 px-6">
      <AgencyHeader title="Enter Agency Code" subtitle="Enter your agency workspace code" />

      <GlassPanel>
        <View className="gap-2">
          <PillField
            label="Agency Code"
            value={code}
            onChangeText={(text) => {
              setCode(text.replace(/\D/g, '').slice(0, AGENCY_CODE_LENGTH));
              if (connect.isError) connect.reset();
            }}
            placeholder="55678"
            keyboardType="number-pad"
            maxLength={AGENCY_CODE_LENGTH}
            returnKeyType="done"
            onSubmitEditing={submit}
            editable={!connect.isPending}
            error={connect.isError}
          />
          {connect.error ? (
            <Text
              accessibilityLiveRegion="polite"
              className="px-1 font-inter-medium text-xs leading-4 text-rose-500"
            >
              {connect.error.message}
            </Text>
          ) : null}
        </View>
        <View className="pt-1">
          <GradientButton
            variant="indigo"
            label="Connect"
            onPress={submit}
            loading={connect.isPending}
            disabled={code.length !== AGENCY_CODE_LENGTH}
            disabledReason={`Enter your ${AGENCY_CODE_LENGTH}-digit agency code`}
          />
        </View>
      </GlassPanel>
    </AuthScreen>
  );
}
