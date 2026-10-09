import { Redirect } from 'expo-router';

// No saved session while the app runs on dummy data, so every launch starts at sign in.
export default function Index() {
  return <Redirect href="/sign-in" />;
}
