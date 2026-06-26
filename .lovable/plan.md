# Roge Print Studio — Rebuild + Backend

## Context

The GitHub repo `roge-print-studio-black` is a mature Vite + React Router + shadcn app (designer canvas, 3D previews, manufacturer portal, Roge-coin wallet, orders + chat). This project is a fresh **TanStack Start** template — a different framework. "Rebuild here from scratch" means porting the frontend and standing up the backend natively in this stack.

This is a large effort, so it's phased. Each phase is shippable on its own.

## Phase 0 — Enable backend
- Enable Lovable Cloud (Postgres, Auth, Storage, server functions).

## Phase 1 — Database schema (port of the original migrations)
Recreate, with proper GRANTs + RLS for the Lovable Cloud Data API:
- `profiles` (+ auto-create trigger on signup) and `user_roles` (`app_role`: customer, manufacturer, admin) with a `has_role()` security-definer function. *(New — the original lacked a safe roles table; needed for manufacturer/admin gating.)*
- `manufacturers`, `manufacturer_portfolio`
- `orders` (full pricing/payment/shipping columns) + `order_messages` (realtime chat)
- Wallet: enums (`transaction_type`, `withdrawal_status`, `blockchain_network`), `roge_transactions`, `user_wallets`, `withdrawal_requests`
- Functions: `update_updated_at_column`, `get_user_roge_balance`, `get_pending_withdrawals`
- Storage buckets: `manufacturer-portfolio` (public), `designs` / `order-assets` (private) with RLS.

## Phase 2 — Auth
- Email/password + Google sign-in (Lovable defaults), `/auth` page, session listener in `__root.tsx`, `_authenticated` route layout for protected pages (designer, profile, manufacturer portal).

## Phase 3 — Frontend port (Vite/React-Router → TanStack routes)
Port pages into `src/routes/`: home (`/`), collections, designer (`/designer`), auth, profile, manufacturers, and the manufacturer portal (dashboard, orders, wallet, portfolio). Bring over components (home, designer canvas, layout, orders, wallet), hooks, libs (`pricing`, `rogeCoins`, `quantityRules`), and image assets. Rebuild the design system (black/white/grey theme) in `src/styles.css` with tokens. Convert React-Router `<Link>`/`useNavigate` and `react-router` usage to TanStack equivalents; convert Supabase reads/writes to the browser client + server functions where appropriate.

## Phase 4 — Wallet + Roge coins
- Server function replacing the `award-roge-coins` edge function (service-role insert, returns new balance), wallet UI, withdrawal requests, transaction history.

## Phase 5 — Payments (checkout)
- Enable Lovable built-in payments (Stripe), product/price setup, checkout server route + webhook to mark orders paid (`payment_status`, `paid_at`).

## Technical notes
- Backend logic uses `createServerFn` / server routes (not Supabase edge functions), per this stack.
- Realtime chat via the browser Supabase client on `order_messages`.
- 3D previews (`ProductModel3D`, three.js) ported as client-only components.
- The original seeded a "Roge Production" manufacturer with a placeholder UUID — re-done as a proper seed after an admin user exists.

## Scope check
This is many hours of work. I'll execute phase by phase, verifying each builds before moving on. If you'd rather I trim scope (e.g. skip 3D previews or crypto withdrawals for a first version), tell me and I'll adjust.
