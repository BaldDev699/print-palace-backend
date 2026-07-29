import { createFileRoute } from "@tanstack/react-router";
import WelcomePage from "@/pages/WelcomePage";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Welcome — Roge Print Studio" },
      {
        name: "description",
        content: "Get started with Roge Print Studio - enter your email for access instructions.",
      },
    ],
  }),
  component: WelcomePage,
});
