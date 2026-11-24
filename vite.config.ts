import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

// Browser tests run in a real Chromium. Playwright finds its own download by
// default (CI installs it); set CHROMIUM_EXECUTABLE_PATH to use another build,
// e.g. a preinstalled one.
const chromiumPath = process.env.CHROMIUM_EXECUTABLE_PATH

export default defineConfig({
  plugins: [react()],
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'jsdom',
          environment: 'jsdom',
          include: ['src/**/*.test.{ts,tsx}'],
          exclude: ['src/**/*.browser.test.{ts,tsx}'],
        },
      },
      {
        extends: true,
        test: {
          name: 'browser',
          include: ['src/**/*.browser.test.{ts,tsx}'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({
              launchOptions: chromiumPath ? { executablePath: chromiumPath } : {},
            }),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
})
