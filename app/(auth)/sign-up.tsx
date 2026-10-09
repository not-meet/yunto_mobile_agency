import { router } from 'expo-router';
import { Briefcase, Link, MapPin, ShieldCheck, Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AgencyHeader } from '@/components/auth/AgencyHeader';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { GlassPanel } from '@/components/auth/GlassPanel';
import { GradientButton } from '@/components/auth/GradientButton';
import { PillField } from '@/components/auth/PillField';
import { AgencyTypeSelect } from '@/components/sign-up/AgencyTypeSelect';
import { AGENCY_TYPES } from '@/dummy/auth';
import { useGenerateAgencyCode } from '@/hooks/useAuth';
import type { AgencyType } from '@/services/authService';

// "Generate Agency Code": a new agency sets up its workspace, or jumps to entering a code.
export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState<AgencyType>(AGENCY_TYPES[0]);
  const generate = useGenerateAgencyCode();
  const busy = generate.isPending;

  return (
    <AuthScreen className="gap-8 px-6">
      <AgencyHeader
        title="Generate Agency Code"
        subtitle="Set up your agency workspace in seconds"
      />

      <GlassPanel>
        <PillField
          label="Agency Name"
          icon={Briefcase}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Stellar Creator Agency"
          autoCapitalize="words"
          editable={!busy}
        />
        <PillField
          label="Location"
          icon={MapPin}
          value={location}
          onChangeText={setLocation}
          placeholder="City, Country"
          autoCapitalize="words"
          editable={!busy}
        />
        <AgencyTypeSelect value={type} options={AGENCY_TYPES} onChange={setType} disabled={busy} />
        <View className="pt-1">
          <GradientButton
            variant="indigo"
            label="Generate Code"
            leadingIcon={Sparkles}
            onPress={() => generate.mutate({ name, location, type })}
            loading={busy}
            disabled={!name.trim() || !location.trim()}
            disabledReason={!name.trim() ? 'Enter your agency name' : 'Enter your location'}
          />
        </View>
      </GlassPanel>

      <View className="flex-row items-center gap-4">
        <View
          className="h-px flex-1"
          style={{
            experimental_backgroundImage:
              'linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.1) 100%)',
          }}
        />
        <Text className="px-1 font-inter-medium text-xs leading-4 text-slate">OR</Text>
        <View
          className="h-px flex-1"
          style={{
            experimental_backgroundImage:
              'linear-gradient(90deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0) 100%)',
          }}
        />
      </View>

      <View className="gap-3">
        <Pressable
          onPress={() => router.push('/agency-code')}
          disabled={busy}
          accessibilityRole="button"
          className="h-[54px] flex-row items-center justify-center gap-2 rounded-full border border-indigo/25 bg-white/55 active:opacity-80"
          style={{
            boxShadow:
              '0px 2px 12px rgba(130, 100, 255, 0.08), inset 0px 1px 0px 1px rgba(255, 255, 255, 0.8)',
          }}
        >
          <Link size={15} color="#6366F1" strokeWidth={2} />
          <Text className="font-inter-semibold text-sm leading-5 text-indigo">
            Already Have Agency Code
          </Text>
        </Pressable>
        <View className="flex-row items-center justify-center gap-2 opacity-70">
          <ShieldCheck size={13} color="#64748B" strokeWidth={2} />
          <Text className="font-inter text-xs leading-4 text-slate">
            Your code is private & encrypted
          </Text>
        </View>
      </View>
    </AuthScreen>
  );
}
