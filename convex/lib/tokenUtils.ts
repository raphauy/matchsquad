import { RandomReader, generateRandomString } from "@oslojs/crypto/random";

/**
 * Genera un token seguro de invitación de 32 caracteres alfanuméricos
 */
export function generateInvitationToken(): string {
  const random: RandomReader = {
    read(bytes) {
      crypto.getRandomValues(bytes);
    },
  };

  const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const length = 32; // Token de 32 caracteres
  return generateRandomString(random, alphabet, length);
}

/**
 * Obtiene el timestamp de expiración para una invitación (7 días desde ahora)
 */
export function getInvitationExpirationTime(): number {
  return Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 días
}

