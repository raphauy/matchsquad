import { Email } from "@convex-dev/auth/providers/Email";
import { Resend as ResendAPI } from "resend";
import { RandomReader, generateRandomString } from "@oslojs/crypto/random";

export const ResendOTP = Email({
  id: "resend-otp",
  apiKey: process.env.AUTH_RESEND_KEY,
  maxAge: 60 * 15, // 15 minutos
  async generateVerificationToken() {
    const random: RandomReader = {
      read(bytes) {
        crypto.getRandomValues(bytes);
      },
    };

    const alphabet = "0123456789";
    const length = 6;
    return generateRandomString(random, alphabet, length);
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    // Detectar modo desarrollo usando CONVEX_ENV:
    // - En desarrollo local: CONVEX_ENV=development (en .env.local)
    // - En producción: CONVEX_ENV=production (en Convex Dashboard)
    const isDev = process.env.CONVEX_ENV !== "production";

    if (isDev) {
      console.log("\n" + "=".repeat(60));
      console.log("🔐 CÓDIGO OTP DE DESARROLLO");
      console.log("=".repeat(60));
      console.log(`📧 Email: ${email}`);
      console.log(`🔢 Código: ${token}`);
      console.log(`⏰ Expira en: 15 minutos`);
      console.log("=".repeat(60) + "\n");
      return; // No enviar email en desarrollo
    }

    // En producción, validar y enviar email con Resend
    const apiKey = provider.apiKey || process.env.AUTH_RESEND_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;

    if (!apiKey) {
      console.error("[ResendOTP] ERROR: AUTH_RESEND_KEY no está configurada en Convex Dashboard");
      throw new Error("AUTH_RESEND_KEY no está configurada en Convex Dashboard");
    }

    if (!fromEmail) {
      console.error("[ResendOTP] ERROR: RESEND_FROM_EMAIL no está configurada en Convex Dashboard");
      throw new Error("RESEND_FROM_EMAIL no está configurada en Convex Dashboard");
    }

    // Enviar email con Resend
    console.log("[ResendOTP] Enviando email a:", email);
    const resend = new ResendAPI(apiKey);
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: `Tu código de verificación - MatchSquad`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Bienvenido a MatchSquad</h2>
          <p style="font-size: 16px; color: #666;">
            Tu código de verificación es:
          </p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333;">
              ${token}
            </span>
          </div>
          <p style="font-size: 14px; color: #999;">
            Este código expirará en 15 minutos.
          </p>
        </div>
      `,
      text: `Tu código de verificación es: ${token}. Este código expirará en 15 minutos.`,
    });

    if (error) {
      console.error("[ResendOTP] Error de Resend:", JSON.stringify(error));
      throw new Error(JSON.stringify(error));
    }

    console.log("[ResendOTP] Email enviado exitosamente. ID:", data?.id);
  },
});
