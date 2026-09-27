import { defineConfig, devices } from '@playwright/test'

const isCI = !!process.env.CI
// Set by `test:e2e:all` alone. CI never needs it, since `isCI` already selects
// every engine, so a local run defaults to chromium and opts into the rest.
const isAllEngines = isCI || !!process.env.E2E_ALL_ENGINES
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
  // inside one file run serially without it, so the heaviest file sets a floor
  // no worker count breaks. Turning it on took the full three-engine run from
  // about 3:30 to 2:49 and failed two webkit tests, both timing assertions:
  // more contexts on one machine is less processor each, and a reveal stagger
  // measured against a wall clock starts reading zero.
  //
  // `workers` under CI was held at 1 after dispatch runs on 2026-09-05 failed
  // across every engine at 2 and 4. The load behind that starvation was the
  // live hero rendering in SwiftShader, measured on 2026-09-28, and with the
  // hero held still the count is the one two clean dispatch runs proved, per
  // canon/context/ci.md. Locally the cap is 4, since Playwright's default of
  // half the cores pinned a 32-core machine, and never higher anywhere.
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : 4,
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
    ...(isAllEngines
      ? [
          { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
          { name: 'webkit', use: { ...devices['Desktop Safari'] } },
        ]
      : []),
  ],
  webServer: {
    command: isDistPrebuilt
      ? `bun run preview -- --port ${port}`
      : `bun run build && bun run preview -- --port ${port}`,
    url: baseURL,
    reuseExistingServer: false,
  },
})
