// Compatibility shim: exposes a React-Router-like API backed by TanStack Router.
// Lets ported pages/components keep using <Link to>, useNavigate, useLocation,
// NavLink, Navigate and Outlet with their original call signatures.
import React from "react";
import {
  Outlet as TSOutlet,
  useRouter,
  useLocation as useTSLocation,
} from "@tanstack/react-router";

export const Outlet = TSOutlet;

type NavOptions = { replace?: boolean; state?: unknown };

function parse(to: string) {
  const url = new URL(to, "http://_");
  const search = Object.fromEntries(url.searchParams.entries());
  const hash = url.hash ? url.hash.replace(/^#/, "") : undefined;
  return { pathname: url.pathname, search, hash };
}

export function useNavigate() {
  const router = useRouter();
  return React.useCallback(
    (to: string | number, opts?: NavOptions) => {
      if (typeof to === "number") {
        if (typeof window !== "undefined") window.history.go(to);
        return;
      }
      const { pathname, search, hash } = parse(to);
      router.navigate({
        to: pathname as string,
        search: search as Record<string, unknown>,
        hash,
        replace: opts?.replace,
        state: opts?.state as never,
      } as never);
    },
    [router],
  );
}

export function useLocation() {
  const loc = useTSLocation();
  return {
    pathname: loc.pathname,
    search: loc.searchStr ?? "",
    hash: loc.hash ?? "",
    state: (loc.state ?? {}) as unknown as Record<string, unknown> & {
      scrollTo?: string;
    },
  };
}

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  to: string;
  replace?: boolean;
  state?: unknown;
};

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ to, replace, state, onClick, children, ...rest }, ref) => {
    const navigate = useNavigate();
    return (
      <a
        ref={ref}
        href={to}
        onClick={(e) => {
          onClick?.(e);
          if (
            e.defaultPrevented ||
            e.metaKey ||
            e.ctrlKey ||
            e.shiftKey ||
            e.altKey ||
            e.button !== 0
          )
            return;
          e.preventDefault();
          navigate(to, { replace, state });
        }}
        {...rest}
      >
        {children}
      </a>
    );
  },
);
Link.displayName = "Link";

type NavLinkChild = React.ReactNode | ((state: { isActive: boolean }) => React.ReactNode);

type NavLinkProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "className" | "children"
> & {
  to: string;
  end?: boolean;
  className?: string | ((state: { isActive: boolean }) => string);
  children?: NavLinkChild;
};

export function NavLink({ to, end, className, children, onClick, ...rest }: NavLinkProps) {
  const navigate = useNavigate();
  const loc = useLocation();
  const isActive = end ? loc.pathname === to : loc.pathname.startsWith(to);
  const cls = typeof className === "function" ? className({ isActive }) : className;
  return (
    <a
      href={to}
      className={cls}
      onClick={(e) => {
        onClick?.(e);
        if (
          e.defaultPrevented ||
          e.metaKey ||
          e.ctrlKey ||
          e.shiftKey ||
          e.altKey ||
          e.button !== 0
        )
          return;
        e.preventDefault();
        navigate(to);
      }}
      {...rest}
    >
      {typeof children === "function" ? children({ isActive }) : children}
    </a>
  );
}

export function Navigate({ to, replace }: { to: string; replace?: boolean }) {
  const navigate = useNavigate();
  React.useEffect(() => {
    navigate(to, { replace });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
