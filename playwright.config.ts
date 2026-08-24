import { defineConfig, devices } from '@playwright/test'

const isCI = !!process.env.CI
// Set by the CI e2e job alone, once build-verify's dist/ has been downloaded.
// Unset everywhere else, so a local run always builds its own output.
const isDistPrebuilt = !!process.env.DIST_PREBUILT

// Own band, clear of dev at 4321 and screenshot at 4173 across every worktree offset.
const port = 4250 + (Number(process.env.WORKTREE_PORT_OFFSET) || 0)
const baseURL = `http://localhost:${port}`

export default defineConfig({
  testDir: 'e2e',
  forbidOnly: isCI,
  // `fullyParallel` stays off, and it was measured rather than assumed. Tests
  // inside one file run serially without it, so `cast.spec.ts` sets the floor
  // for the suite at 2.0 minutes on one engine. Turning it on took the full
  // three-engine run from about 3:30 to 2:49 and failed two webkit tests, both
  // timing assertions: more contexts on one machine is less processor each, and
  // a reveal stagger measured against a wall clock starts reading zero. A fifth
  // off the wall clock does not pay for a suite that reports failures nobody
  // caused. Narrow the scope in the inner loop instead.
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
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: isDistPrebuilt
      ? `bun run preview -- --port ${port}`
      : `bun run build && bun run preview -- --port ${port}`,
    url: baseURL,
    reuseExistingServer: false,
  },
})
