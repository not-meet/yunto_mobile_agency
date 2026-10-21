import { z } from 'zod';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

import {
  brandDealSchema,
  BRAND_NAME_MAX,
  CONTENT_BODY_MAX,
  DISCLOSURE_MAX,
  SEGMENT_MAX,
  TOPIC_MAX,
  TOPICS_MAX,
} from '@/services/contentService';
import { contentTypeSchema, POST_TITLE_MAX } from '@/services/creatorCalendarService';
import { creatorPlatformSchema } from '@/services/creatorsService';
import { getStorage } from '@/utils/storage';

// The content editor's unsaved changes, kept on the phone per creator and day (and piece, once
// it has one), so leaving the editor or the app closing doesn't lose them. Opening the same
// day again picks them back up; a save to the server drops them.

const DRAFTS_KEPT = 30;

export const contentFormSchema = z.object({
  title: z.string().max(POST_TITLE_MAX),
  body: z.string().max(CONTENT_BODY_MAX),
  date: z.iso.date().or(z.literal('')),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  platform: creatorPlatformSchema.nullable(),
  contentType: contentTypeSchema.nullable(),
  segment: z.string().max(SEGMENT_MAX).nullable(),
  topics: z.array(z.string().max(TOPIC_MAX)).max(TOPICS_MAX),
  brandCollab: z.boolean(),
  brandName: z.string().max(BRAND_NAME_MAX),
  brandAmount: z.number().int().positive().nullable(),
  brandDeal: brandDealSchema,
  disclosure: z.string().max(DISCLOSURE_MAX),
  autopost: z.boolean(),
  versionNote: z.string().max(80),
});
export type ContentForm = z.infer<typeof contentFormSchema>;

const storedDraftSchema = z.object({ form: contentFormSchema, savedAt: z.number() });
export type StoredDraft = z.infer<typeof storedDraftSchema>;

// "creatorId:2026-10-22:new", or the piece's id in place of "new".
export const draftKey = (creatorId: string, date: string, postId: string | null) =>
  `${creatorId}:${date}:${postId ?? 'new'}`;

// Null storage (Expo Go): the drafts just aren't kept between launches.
const mmkvStorage: StateStorage = {
  getItem: (name) => getStorage()?.getString(name) ?? null,
  setItem: (name, value) => getStorage()?.set(name, value),
  removeItem: (name) => {
    getStorage()?.remove(name);
  },
};

interface ContentDraftState {
  drafts: Record<string, StoredDraft>;
  keep: (key: string, form: ContentForm) => void;
  drop: (key: string) => void;
}

export const useContentDraftStore = create<ContentDraftState>()(
  persist(
    (set) => ({
      drafts: {},
      keep: (key, form) =>
        set(({ drafts }) => {
          const next = { ...drafts, [key]: { form, savedAt: Date.now() } };
          // Only the most recent ones are kept.
          const newest = Object.entries(next)
            .sort(([, a], [, b]) => b.savedAt - a.savedAt)
            .slice(0, DRAFTS_KEPT);
          return { drafts: Object.fromEntries(newest) };
        }),
      drop: (key) =>
        set(({ drafts }) => {
          if (!(key in drafts)) return {};
          const { [key]: _dropped, ...rest } = drafts;
          return { drafts: rest };
        }),
    }),
    {
      name: 'content.drafts',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: ({ drafts }) => ({ drafts }),
      // Stored data is untrusted: a malformed draft is discarded rather than merged in.
      merge: (persisted, current) => {
        const stored = z.object({ drafts: z.record(z.string(), z.unknown()) }).safeParse(persisted);
        if (!stored.success) return current;
        const drafts: Record<string, StoredDraft> = {};
        for (const [key, value] of Object.entries(stored.data.drafts)) {
          const draft = storedDraftSchema.safeParse(value);
          if (draft.success) drafts[key] = draft.data;
        }
        return { ...current, drafts };
      },
    },
  ),
);
