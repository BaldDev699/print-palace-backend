import { createFileRoute } from "@tanstack/react-router";
import AuthPage from "@/pages/AuthPage";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In — Roge Print Studio" },
      { name: "description", content: "Sign in or create your Roge Print Studio account." },
    ],
  }),
  component: AuthPage,
});
