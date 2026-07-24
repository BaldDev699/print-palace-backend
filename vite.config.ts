// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Pinned explicitly: this app is deployed on Netlify, but nitro's default
  // preset auto-detection (Vercel/Netlify/Cloudflare Pages) can be forced to
  // "cloudflare" when the build runs through Lovable's own pipeline. Without
  // pinning this, `npm run build` can silently produce a Cloudflare Workers
  // bundle (`.output/`) instead of Netlify Functions, which is why server
  // functions (email notifications, Stripe checkout, the webhook route) were
  // never actually running on the live Netlify deploy - there was no server
  // runtime for them.
  nitro: {
    preset: "netlify",
  },
});
