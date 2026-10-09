import { ToastAndroid } from 'react-native';

// Push notification setup (expo-notifications) goes here.

export function showToast(message: string) {
  ToastAndroid.show(message, ToastAndroid.SHORT);
}
