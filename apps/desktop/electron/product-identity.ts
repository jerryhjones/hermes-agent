// product-identity.ts — the typed build-time product identity.
//
// product-identity.cjs is the single derivation of every name-shaped
// value a variant owns (product name, appId, deep-link scheme, channel).
// bundle-electron-main.mjs bakes that object into the production bundle
// by defining the __HERMES_PRODUCT_IDENTITY__ global — the same
// mechanism as the install stamp — so runtime code and the packaged
// artifact can never disagree about who they are.
//
// Dev bundles and test runs define nothing; the typeof guard falls back
// to deriving from HERMES_DESKTOP_VARIANT the same way the .cjs does, so
// `electron .` and vitest behave like the matching variant without a
// build step.

/** Mirrors the object product-identity.cjs exports. */
export interface ProductIdentity {
  /** True when this artifact is Hermes Light (remote-only client). */
  light: boolean
  name: {
    /** "Hermes Light" — product name, menus, installers. */
    display: string
    /** "hermes-light" — appId suffix, package name, deep-link scheme. */
    kebab: string
    /** "Hermes-Light" — release artifact file names. */
    train: string
    /** "HermesLight" — app.setName / userData dir key, MSIX applicationId. */
    pascal: string
  }
  /** "com.nousresearch.hermes-light" — OS-level app identity. */
  appId: string
  /** electron-updater feed channel: "light" | "latest". */
  channel: string
  /** Deep-link scheme this artifact owns: "hermes-light" | "hermes". */
  protocolScheme: string
}

declare const __HERMES_PRODUCT_IDENTITY__: ProductIdentity

function deriveDevIdentity(): ProductIdentity {
  // Keep in lockstep with product-identity.cjs — this branch only runs in
  // dev/test bundles where the define is absent.
  const light = process.env.HERMES_DESKTOP_VARIANT === 'light'
  const variant = light ? ['Hermes', 'Light'] : ['Hermes']

  const name = {
    display: variant.join(' '),
    kebab: variant.join('-').toLowerCase(),
    train: variant.join('-'),
    pascal: variant.join('')
  }

  return {
    light,
    name,
    appId: `com.nousresearch.${name.kebab}`,
    channel: light ? 'light' : 'latest',
    protocolScheme: name.kebab
  }
}

/** The baked identity of this artifact (dev bundles derive it live). */
export const PRODUCT_IDENTITY: Readonly<ProductIdentity> =
  typeof __HERMES_PRODUCT_IDENTITY__ === 'undefined'
    ? Object.freeze(deriveDevIdentity())
    : Object.freeze(__HERMES_PRODUCT_IDENTITY__)
