import { defineConfig, devices } from '@playwright/test'

const isCI = !!process.env.CI

// Own band, clear of dev at 4321 and screenshot at 4173 across every worktree offset.
const port = 4250 + (Number(process.env.WORKTREE_PORT_OFFSET) || 0)
const baseURL = `http://localhost:${port}`

export default defineConfig({
  testDir: 'e2e',
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  // The html report is what the failure artifact uploads. Under `list` alone
  // that directory is never written and the upload takes nothing, which leaves
  // a red engine with no trace to read.
  reporter: isCI ? [['list'], ['html', { open: 'never' }]] : 'html',
  use: {
    trace: 'on-first-retry',
    baseURL,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        // A CI runner has no GPU, so Firefox blocklists WebGL and the shader
        // surface draws its fallback. Forcing it on keeps the spec asserting
        // what a visitor sees rather than what the runner can do.
        launchOptions: {
          firefoxUserPrefs: {
            'webgl.force-enabled': true,
            'webgl.disabled': false,
          },
        },
      },
    },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: `bun run build && bun run preview -- --port ${port}`,
    url: baseURL,
    reuseExistingServer: false,
  },
})
