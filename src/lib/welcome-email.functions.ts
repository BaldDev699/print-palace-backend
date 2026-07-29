import { createServerFn } from "@tanstack/react-start";
import nodemailer from "nodemailer";

// Sends the "how to access Roge" welcome email when someone scans the QR
// code and submits their email on /welcome.
export const sendWelcomeEmail = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string }) => {
    const email = data?.email?.trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Please enter a valid email address.");
    }

    return { email };
  })
  .handler(async ({ data }) => {
    const siteUrl =
      process.env.SITE_URL || "https://print-palace-backend.vercel.app";

    // Configure SMTP transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; padding:20px;">
        <h2 style="color:#111;">Welcome to Roge Print Studio 🎉</h2>

        <p>Thank you for scanning our QR code!</p>

        <p>
          Click the button below to begin creating your custom designs.
        </p>

        <p style="text-align:center; margin:30px 0;">
          <a
            href="${siteUrl}"
            style="
              background:#111;
              color:#fff;
              padding:12px 24px;
              text-decoration:none;
              border-radius:6px;
              display:inline-block;
            "
          >
            Visit Roge Print Studio
          </a>
        </p>

        <h3>Getting Started</h3>

        <ol>
          <li>Create a free account.</li>
          <li>Choose a product to customize.</li>
          <li>Add your text, images, and designs.</li>
          <li>Submit your order.</li>
          <li>A manufacturer will review it and notify you when it's ready.</li>
        </ol>

        <p>If you didn't request this email, you can safely ignore it.</p>

        <hr>

        <p style="font-size:12px;color:#666;">
          Roge Print Studio
        </p>
      </div>
    `;

    try {
      await transporter.sendMail({
        from: `"Roge Print Studio" <${process.env.SMTP_USER}>`,
        to: data.email,
        subject: "Welcome to Roge Print Studio",
        html,
      });

      return {
        sent: true,
      };
    } catch (err) {
      console.error("Email sending failed:", err);

      throw new Error("Could not send the email. Please try again.");
    }
  });