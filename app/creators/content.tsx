import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/common/BackButton';
import { Button } from '@/components/common/Button';
import { ContentEditor } from '@/components/content/ContentEditor';
import { useContentEditor } from '@/hooks/useContentEditor';
import { useCreator } from '@/hooks/useCreators';

// The content editor, opened from a day on a creator's calendar with the creator's `id`, the
// day's `date` ("YYYY-MM-DD") and, for a piece already on it, its `post` — as the web's
// /app/content/new?date=…&creatorId=… and /app/content/:id. View only for creators off the
// roster.

export default function CreatorContentScreen() {
  const insets = useSafeAreaInsets();
  const { id, date, post } = useLocalSearchParams<{ id: string; date: string; post?: string }>();
  const creator = useCreator(id);
  const editor = useContentEditor(id, date, post ?? null);

  if (editor.data) {
    return (
      <ContentEditor
        key={`${date}:${post ?? 'new'}`}
        creatorId={id}
        creatorName={creator.data?.name ?? ''}
        date={date}
        data={editor.data}
      />
    );
  }

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <View className="px-4 py-5">
        <BackButton tone="dark" fallbackHref={{ pathname: '/creators/calendar', params: { id } }} />
      </View>
      <View className="flex-1 items-center justify-center gap-4 px-8">
        {editor.isError ? (
          <>
            <Text className="text-center font-inter-medium text-[15px] leading-5 text-muted">
              We couldn’t load this piece.
            </Text>
            <View className="self-stretch">
              <Button
                label="Try again"
                variant="secondary"
                onPress={() => void editor.refetch()}
                loading={editor.isFetching}
              />
            </View>
          </>
        ) : (
          <ActivityIndicator color="#1F1A17" />
        )}
      </View>
    </View>
  );
}
