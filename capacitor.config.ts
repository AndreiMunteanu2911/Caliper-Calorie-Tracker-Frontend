import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.andreimunteanu.caliper',
  appName: 'Caliper',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
