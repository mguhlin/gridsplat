# Privacy and Tracker Audit

For current DrawSplat/SplatWorks deployment and privacy documentation, use the [DrawSplat Wiki](https://drawsplat.org/wiki/). This dated audit records the standalone source reviewed below; it does not establish an executed district DPA or the behavior of a later packaged release.

Last checked: 2026-06-07

GridSplat is built as a static Vite app. The production bundle contains no analytics packages, ad scripts, tracking pixels, or third-party network beacons.

Checked by:

- Reviewing `package.json` dependencies for analytics/ad/tracker packages.
- Running Playwright end-to-end tests against the app.
- Keeping all processing local except user-initiated file downloads/uploads and future user-initiated cloud save flows.

Known external navigation:

- Visible DrawSplat™ links point to `https://drawsplat.org`.
- Cloud provider buttons are scaffolds until app registration and OAuth client IDs are configured.
