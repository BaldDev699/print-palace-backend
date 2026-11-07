import { createFileRoute } from "@tanstack/react-router";
import ResetPasswordPage from "@/pages/ResetPasswordPage";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Reset Password — Roge Print Studio" }],
  }),
  component: ResetPasswordPage,
});