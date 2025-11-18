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
    // En modo desarrollo, solo logear el código en consola
    // En desarrollo local, CONVEX_CLOUD_URL apunta a localhost
    // En producción, existe CONVEX_DEPLOY_KEY
    const isDev = !process.env.CONVEX_DEPLOY_KEY;

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

    // En producción, enviar email con Resend
    const resend = new ResendAPI(provider.apiKey);
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
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
      throw new Error(JSON.stringify(error));
    }
  },
});
