import { createServerFn } from "@tanstack/react-start";

// Sends the "how to access Roge" welcome email when someone scans the QR
// code and submits their email on /welcome. Public/unauthenticated -
// anyone with the QR code can trigger this, no login required.
export const sendWelcomeEmail = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string }) => {
    const email = data?.email?.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Please enter a valid email address.");
    }
    return { email };
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.RESEND_API_KEY;
    const siteUrl = process.env.SITE_URL || "https://print-palace-backend.vercel.app";

    const subject = "Welcome to Roge — here's how to get started";
    const html = `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #111;">Welcome to Roge Print Studio</h2>
        <p>Thanks for scanning our QR code! You can start designing and ordering custom prints right away:</p>
        <p><a href="${siteUrl}" style="display:inline-block; background:#111; color:#fff; padding:12px 20px; border-radius:6px; text-decoration:none;">Visit Roge Print Studio</a></p>
        <p style="color:#555; font-size: 14px;">Once there:</p>
        <ol style="color:#555; font-size: 14px;">
          <li>Create a free account or sign in</li>
          <li>Head to the Design Studio and pick a product template</li>
          <li>Customize it with your own designs, text, or images</li>
          <li>Submit your order — a manufacturer will confirm and you'll be notified when it's ready to pay</li>
        </ol>
        <p style="color:#888; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `;

    if (!apiKey) {
      console.log(`[stub email] Welcome email to=${data.email} (RESEND_API_KEY not set)`);
      return { sent: false };
    }

    try {
      const { Resend } = await import("resend");
      const resend = new Resend(apiKey);
      const from = process.env.RESEND_FROM_EMAIL || "Roge Print Studio <onboarding@resend.dev>";
      const { error } = await resend.emails.send({
        from,
        to: data.email,
        subject,
        html,
      });
      if (error) {
        console.error("[welcome email] Resend error:", error);
        throw new Error("Could not send the email. Please try again.");
      }
      return { sent: true };
    } catch (err) {
      console.error("[welcome email] Failed to send:", err);
      throw new Error("Could not send the email. Please try again.");
    }
  });
