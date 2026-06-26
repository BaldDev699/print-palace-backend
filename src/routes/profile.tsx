import { createFileRoute } from "@tanstack/react-router";
import ProfilePage from "@/pages/ProfilePage";

export const Route = createFileRoute("/profile")({
  ssr: false,
  head: () => ({
    meta: [{ title: "My Profile — Roge Print Studio" }],
  }),
  component: ProfilePage,
});
