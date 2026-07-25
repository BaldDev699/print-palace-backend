// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Detect which platform is actually running this build, instead of
// hardcoding one preset - Netlify sets NETLIFY=true, Vercel sets VERCEL=1
// during their own build steps. Falling back to "netlify" locally/default
// since that's this app's current primary deploy target, but this must
// stay dynamic: hardcoding a single preset broke Vercel entirely (it got
// served a Netlify Functions bundle it can't run, producing a 404).
const nitroPreset = process.env.VERCEL
  ? "vercel"
  : process.env.NETLIFY
    ? "netlify"
    : process.env.CF_PAGES
      ? "cloudflare"
      : "netlify";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // See nitroPreset comment above - this must reflect the platform actually
  // running the build, not be hardcoded to one target.
  nitro: {
    preset: nitroPreset,
  },
});
