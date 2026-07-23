# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## Desktop app

`desktop/` contains a Windows Electron wrapper that loads tf.evtlee.com directly, so it always behaves exactly like the website. It ships with in-app auto-updates via `electron-updater` against this repo's GitHub Releases.

Every push to `main` triggers `.github/workflows/release-desktop.yml`, which bumps the patch version in `package.json` and `desktop/package.json`, then builds and publishes a new Windows installer (`TypeFinder-Setup.exe`) as a GitHub Release. The site's "Download App" button always points at `releases/latest/download/TypeFinder-Setup.exe`, so it always serves the current version. Running installs check for and offer that same release through an in-app "Update now" banner.
