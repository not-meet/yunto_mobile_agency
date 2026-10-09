import { Linking } from 'react-native';

import { showToast } from '@/utils/notifications';

// Quick-contact taps on the leads screens. A missing number or address says so instead of doing
// nothing; an app that can't be opened says that.

function open(url: string, what: string) {
  Linking.openURL(url).catch(() => showToast(`Couldn’t open ${what}`));
}

// Numbers are E.164 ("+919812345678"), checked by the service's schema.
export function callNumber(phone: string | null, name: string) {
  if (!phone) showToast(`No phone number for ${name}`);
  else open(`tel:${phone}`, 'the dialer');
}

export function textNumber(phone: string | null, name: string) {
  if (!phone) showToast(`No phone number for ${name}`);
  else open(`sms:${phone}`, 'messages');
}

export function openWhatsApp(phone: string | null, name: string) {
  if (!phone) showToast(`No WhatsApp number for ${name}`);
  else open(`https://wa.me/${phone.slice(1)}`, 'WhatsApp');
}

export function sendEmail(email: string | null, name: string) {
  if (!email) showToast(`No email for ${name}`);
  else open(`mailto:${email}`, 'your email app');
}

// `host` is a bare domain, e.g. "zostel.com".
export function openWebsite(host: string) {
  open(`https://${host}`, 'that link');
}

// A full https URL, checked by the service's schema.
export function openLink(url: string) {
  open(url, 'that link');
}
