export default ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
  },

  apiToken: {
    salt: env('API_TOKEN_SALT'),
  },

  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },

  secrets: {
    encryptionKey: env('ENCRYPTION_KEY'),
  },

  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
  },

  preview: {
    enabled: true,
    config: {
      allowedOrigins: env("PREVIEW_FRONTEND_URL", "http://localhost:3000"),
      async handler(uid, { documentId, locale, status }) {
        const clientUrl = env("PREVIEW_FRONTEND_URL", "http://localhost:3000");
        const secret = env("PREVIEW_SECRET", "");
        // Pass type so the Next.js preview route knows where to redirect
        return `${clientUrl}/api/preview?secret=${secret}&slug=${documentId}&locale=${locale}&type=${uid}`;
      },
    },
  },
  // Required for production admin URL
  url: env('STRAPI_ADMIN_URL', '/admin'),
});
