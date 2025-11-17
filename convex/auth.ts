import { convexAuth } from "@convex-dev/auth/server";
import { ResendOTP } from "./ResendOTP";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [ResendOTP],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, args) {
      const { userId, existingUserId } = args;

      // Solo asignar rol si es un usuario nuevo
      if (!existingUserId) {
        await ctx.db.patch(userId, {
          role: "jugador" as const,
        });
      }
    },
  },
});
