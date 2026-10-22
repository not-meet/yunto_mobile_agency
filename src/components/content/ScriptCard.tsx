import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { ContentCanvas } from '@/components/content/ContentCanvas';
import { EditorCard } from '@/components/content/EditorParts';

// The script, written on the canvas with the formatting bar. `children` (the AI assistant) sits
// at the bottom of the card, as on the web.

interface ScriptCardProps {
  kind: string;
  title: string;
  body: string;
  editable: boolean;
  onChange: (patch: { title?: string; body?: string }) => void;
  children?: ReactNode;
}

export function ScriptCard({ kind, title, body, editable, onChange, children }: ScriptCardProps) {
  return (
    <EditorCard>
      <View className="shrink self-start rounded-full bg-[#C2185B] px-3 py-1">
        <Text numberOfLines={1} className="font-inter-semibold text-xs leading-4 text-white">
          {kind}
        </Text>
      </View>

      <ContentCanvas
        title={title}
        body={body}
        onChange={onChange}
        minHeight={320}
        editable={editable}
      />

      {children}
    </EditorCard>
  );
}
