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
  // inside one file run serially without it, so the heaviest file sets a floor
  // no worker count breaks. Turning it on took the full three-engine run from
  // about 3:30 to 2:49 and failed two webkit tests, both timing assertions:
  // more contexts on one machine is less processor each, and a reveal stagger
  // measured against a wall clock starts reading zero.
  //
  // `workers` stays at 1 for the same reason at a larger scale. Raised to 2 on
  // pull request 100, a full-suite dispatch run failed 11 chromium tests and 1
  // firefox test across five unrelated files, all across every retry, and the
  // chromium leg ran 19.6m against a 14m01s single-worker baseline. Raised to 4,
  // every engine failed: 24 chromium, 1 firefox, 2 webkit, across nine files,
  // with chromium at 20.0m. This runner's 4 vCPU tier cannot hold two full
  // browser contexts without starving the timing-sensitive assertions the
  // codebase carries throughout, which is a wider defect class than the two
  // webkit cases above and is not fixed by loosening a tolerance.
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
