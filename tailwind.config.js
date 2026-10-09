/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        canvas: '#F8F5EF',
        ink: '#111111',
        slate: '#64748B',
        indigo: '#6366F1',
        periwinkle: '#5560CC',
        charcoal: '#1E1E1E',
        espresso: '#1F1A17',
        cocoa: '#312B28',
        sand: '#E8E2D9',
        // From yunto_mobile_app, for the screens shared with it.
        muted: '#787486',
        snow: '#FFFCFC',
      },
      // Android can't pick a weight from one family, so each weight is its own family.
      fontFamily: {
        'inter-light': ['Inter_300Light'],
        inter: ['Inter_400Regular'],
        'inter-regular': ['Inter_400Regular'],
        'inter-medium': ['Inter_500Medium'],
        'inter-semibold': ['Inter_600SemiBold'],
        'inter-bold': ['Inter_700Bold'],
        'inter-extrabold': ['Inter_800ExtraBold'],
        'geist-medium': ['Geist_500Medium'],
        'grotesk-medium': ['SpaceGrotesk_500Medium'],
        'grotesk-bold': ['SpaceGrotesk_700Bold'],
      },
    },
  },
  plugins: [],
};
