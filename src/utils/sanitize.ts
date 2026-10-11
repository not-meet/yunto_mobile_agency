// Input sanitizers for controlled TextInputs: they drop anything invalid as it's typed or
// pasted, so the field can never hold a malformed value.

import { z } from 'zod';

import { NOTE_MAX } from '@/services/leadActivityService';
import { EMAIL_MAX, NICHE_MAX } from '@/services/leadsService';
import { CHAT_MESSAGE_MAX } from '@/services/talentCampaignService';
import {
  FOOTAGE_FILE_NAME_MAX,
  FOOTAGE_NOTES_MAX,
  SHOOT_BRIEF_MAX,
  SHOOT_LOCATION_MAX,
} from '@/services/talentService';

const LINK_MAX = 500;
const linkSchema = z
  .string()
  .max(LINK_MAX)
  .regex(/^https:\/\/([a-z0-9-]+\.)+[a-z]{2,}(\/[A-Za-z0-9\-._~:/?#[\]@!$&'()*+,;=%]*)?$/);

// A chat message: free text, but no control characters, no leading whitespace and at most one
// blank line.
export function sanitizeChatMessage(raw: string): string {
  return raw
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s+/, '')
    .slice(0, CHAT_MESSAGE_MAX);
}

// A shoot address: one line, single-spaced, no leading whitespace.
export function sanitizeShootLocation(raw: string): string {
  return raw
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s+/, '')
    .slice(0, SHOOT_LOCATION_MAX);
}

// A shoot brief: free text like a chat message.
export function sanitizeShootBrief(raw: string): string {
  return raw
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s+/, '')
    .slice(0, SHOOT_BRIEF_MAX);
}

// Notes for an editor: free text like a shoot brief.
export function sanitizeEditorNotes(raw: string): string {
  return raw
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s+/, '')
    .slice(0, FOOTAGE_NOTES_MAX);
}

// A note on a lead: free text like a chat message.
export function sanitizeNote(raw: string): string {
  return raw
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s+/, '')
    .slice(0, NOTE_MAX);
}

// A one-line field on the Add Lead form (brand, contact person, deliverables): single-spaced,
// no leading whitespace.
export function sanitizeLeadText(raw: string, max: number): string {
  return raw
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s+/, '')
    .slice(0, max);
}

// Typing or pasting an email: whitespace and control characters can't be part of one.
export function sanitizeEmailInput(raw: string): string {
  return raw.replace(/[\s\u0000-\u001F\u007F]/g, '').slice(0, EMAIL_MAX);
}

// A whole number field (amounts, counts): digits only, no leading zeros.
export function sanitizeDigits(raw: string, maxDigits: number): string {
  return raw
    .replace(/\D/g, '')
    .replace(/^0+(?=\d)/, '')
    .slice(0, maxDigits);
}

// Typing a phone number: digits, with an optional leading "+" for the country code.
export function sanitizePhoneInput(raw: string): string {
  const plus = raw.trimStart().startsWith('+') ? '+' : '';
  return plus + raw.replace(/\D/g, '').slice(0, 15);
}

// A typed phone number as E.164, or null if it isn't one: ten digits are taken as Indian
// (+91), a leading 0 is a trunk prefix and dropped; with a "+" the country code is as typed.
export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  const e164 = raw.trimStart().startsWith('+')
    ? `+${digits}`
    : `+91${digits.replace(/^0(?=\d{10}$)/, '')}`;
  return /^\+91\d{10}$|^\+(?!91)[1-9]\d{7,14}$/.test(e164) ? e164 : null;
}

// Niches typed as a list, e.g. "Food, films": one per comma, single-spaced, without blanks or
// repeats (case-insensitive).
export function splitNiches(raw: string): string[] {
  const seen = new Set<string>();
  return raw
    .split(',')
    .map((part) => sanitizeLeadText(part, NICHE_MAX).trimEnd())
    .filter((niche) => {
      const key = niche.toLowerCase();
      if (!niche || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

// A picked file's name as shown and sent: no control characters or path separators.
export function sanitizeFileName(raw: string): string {
  return raw
    .replace(/[\u0000-\u001F\u007F/\\]/g, '')
    .trim()
    .slice(0, FOOTAGE_FILE_NAME_MAX);
}

// Typing or pasting a link: whitespace and control characters can't be part of one.
export function sanitizeLinkInput(raw: string): string {
  return raw.replace(/[\s\u0000-\u001F\u007F]/g, '').slice(0, LINK_MAX);
}

// Share-sheet tracking (Instagram's igsh, YouTube's si, utm_*) that makes the same post look
// like a different link.
const TRACKING_PARAM = /^(utm_[a-z]+|igsh|igshid|si|fbclid)$/i;

// A link ready to send, or null if it isn't one: a bare "instagram.com/reel/x"
// gets https://, http:// is upgraded, the host is lowercased and the hash and tracking params
// are dropped; text around a pasted link is ignored. Any other scheme (javascript:, file:,
// intent:…) is refused.
export function normalizeLink(raw: string): string | null {
  // Share sheets paste "Check out this reel! https://…": keep only the link.
  const shared = /https?:\/\/\S+/i.exec(raw)?.[0] ?? raw;
  const link = sanitizeLinkInput(shared).replace(/^http:\/\//i, 'https://');
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(link) ? link : `https://${link}`;
  const match = /^https:\/\/([^/?#]+)([^?#]*)(?:\?([^#]*))?/i.exec(withScheme);
  if (!match) return null;
  const [, host = '', path = '', query = ''] = match;
  const params = query
    .split('&')
    .filter((param) => param && !TRACKING_PARAM.test(param.split('=')[0] ?? ''));
  const url = `https://${host.toLowerCase()}${path.replace(/\/+$/, '')}${
    params.length > 0 ? `?${params.join('&')}` : ''
  }`;
  return linkSchema.safeParse(url).success ? url : null;
}

// A number that can have a fraction (a rate, a percentage): digits and one dot, at most
// `decimals` places after it.
export function sanitizeDecimal(raw: string, maxDigits: number, decimals = 2): string {
  const [whole = '', ...rest] = raw.replace(/[^\d.]/g, '').split('.');
  const intPart = whole.replace(/^0+(?=\d)/, '').slice(0, maxDigits);
  return rest.length > 0 ? `${intPart || '0'}.${rest.join('').slice(0, decimals)}` : intPart;
}

// Typing a social handle: always starts with "@", then letters, digits, dots or underscores.
export function sanitizeHandleInput(raw: string): string {
  const body = raw.replace(/[^A-Za-z0-9._]/g, '').slice(0, 30);
  return body ? `@${body}` : '';
}
