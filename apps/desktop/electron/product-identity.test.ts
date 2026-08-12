// The dev fallback in product-identity.ts re-derives what
// product-identity.cjs exports (a packaged build gets the .cjs object
// baked in as a define; dev/test bundles have no define and derive
// live). These tests hold the two derivations in lockstep for both
// variants — the contract that makes the fallback safe.
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

import { afterEach, beforeEach, test, vi } from 'vitest'

const require = createRequire(import.meta.url)

const VARIANTS: (string | undefined)[] = [undefined, 'light']

beforeEach(() => {
  vi.resetModules()
})

afterEach(() => {
  delete process.env.HERMES_DESKTOP_VARIANT
  vi.resetModules()
})

for (const variant of VARIANTS) {
  test(`dev derivation matches product-identity.cjs (variant=${variant ?? 'default'})`, async () => {
    if (variant === undefined) {
      delete process.env.HERMES_DESKTOP_VARIANT
    } else {
      process.env.HERMES_DESKTOP_VARIANT = variant
    }

    // Fresh evaluation of both modules under the same env.
    delete require.cache[require.resolve('../product-identity.cjs')]
    const cjs = require('../product-identity.cjs') as Record<string, unknown>
    const { PRODUCT_IDENTITY } = await import('./product-identity')

    assert.deepEqual({ ...PRODUCT_IDENTITY, name: { ...PRODUCT_IDENTITY.name } }, cjs)
  })
}

test('light identity is fully distinct from the full identity', async () => {
  delete process.env.HERMES_DESKTOP_VARIANT
  const full = (await import('./product-identity')).PRODUCT_IDENTITY

  vi.resetModules()
  process.env.HERMES_DESKTOP_VARIANT = 'light'
  const light = (await import('./product-identity')).PRODUCT_IDENTITY

  // Every OS-visible identity marker must differ, or side-by-side
  // installs collide (userData dir, handler registration, updater feed).
  assert.notEqual(light.name.pascal, full.name.pascal)
  assert.notEqual(light.appId, full.appId)
  assert.notEqual(light.protocolScheme, full.protocolScheme)
  assert.notEqual(light.channel, full.channel)
})
