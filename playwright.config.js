import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './dist/tests',
  fullyParallel: false, // Tests nacheinander ausführen
  forbidOnly: !!process.env.CI,
  retries: 1,
  timeout: 60 * 1000, // 90 Sekunden Timeout pro Test
  workers: process.env.CI ? 1 : 1,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    extraHTTPHeaders: {
      'Pragma': 'no-cache',
      'Cache-Control': 'no-cache'
    },
    viewport: null, // Volle Bildschirmgröße verwenden
    
    // Cookie-Einstellungen
    acceptDownloads: true,
    // Kein storageState - erlaubt neue Cookies pro Test
    // Keine ignoreHTTPSErrors - Standard-Sicherheit
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'],
  
       }
    }
  ]
});
