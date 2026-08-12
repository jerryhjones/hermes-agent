// The desktop product identity — THE single source for every name-shaped
// value a variant owns. HERMES_DESKTOP_VARIANT=light builds "Hermes
// Light", the remote-only client; everything else is full "Hermes".
//
// Consumed at build time by electron-builder.config.cjs (packaging
// identity) and bundle-electron-main.mjs (which bakes this object into
// the main bundle as the __HERMES_PRODUCT_IDENTITY__ define, the same
// mechanism as the install stamp) — so the packaged artifact and the
// runtime code can never disagree about who they are.
//
// electron/product-identity.ts is the typed runtime accessor; its
// ProductIdentity interface mirrors the object shape here.
// @ts-check
"use strict"

const light = process.env.HERMES_DESKTOP_VARIANT === "light"

// master product id, used for all sorts of markers
const variant = light ? ["Hermes", "Light"] : ["Hermes"]

// The identity, one derivation per naming convention:
//   display  "Hermes Light"  product name, menus, installers
//   kebab    "hermes-light"  appId suffix, package name, deep-link scheme
//   train    "Hermes-Light"  release artifact file names
//   pascal   "HermesLight"   app.setName (keys Electron's userData dir —
//                            side-by-side installs must not share state),
//                            MSIX applicationId
const name = {
  display: variant.join(" "),
  kebab: variant.join("-").toLowerCase(),
  train: variant.join("-"),
  pascal: variant.join(""),
}

module.exports = {
  light,
  name,
  // distinct for the OS (settings, installs, etc)
  appId: `com.nousresearch.${name.kebab}`,
  // distinct for release channels
  channel: light ? "light" : "latest",
  // distinct for deep link schemes: side-by-side installs must not fight
  // over one OS handler registration, and the Copilot key's activation
  // URI must launch the right app
  protocolScheme: name.kebab,
}
