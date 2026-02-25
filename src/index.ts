import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }: { strapi: Core.Strapi }) {
    strapi.config.set('admin.preview', {
      enabled: true,
      config: {
        handler: async (uid, { documentId, locale, status }) => {
          const baseUrl = (process.env.PREVIEW_FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
          const secret = process.env.PREVIEW_SECRET || 'my-super-secret-preview-token';

          let resolvedSlug = '';

          try {
            if (uid && documentId) {
              const entry = await strapi.documents(uid).findOne({
                documentId,
                locale,
                status,
                fields: ['slug'],
              } as any);

              if (typeof entry?.slug === 'string' && entry.slug.trim()) {
                resolvedSlug = entry.slug.trim();
              }
            }
          } catch (error) {
            strapi.log.warn(`Preview slug resolve failed for ${uid}:${documentId}`);
          }

          const slugParam = encodeURIComponent(resolvedSlug || documentId || '');
          const localeParam = encodeURIComponent(locale || 'bn');
          const statusParam = encodeURIComponent(status || 'draft');
          const secretParam = encodeURIComponent(secret);

          return `${baseUrl}/api/preview?secret=${secretParam}&slug=${slugParam}&locale=${localeParam}&status=${statusParam}`;
        },
      },
    });
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started. ghghgh
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const redisEnabled = ['true', '1', 'yes', 'on'].includes((process.env.REDIS_ENABLED || '').toLowerCase());

    if (redisEnabled) {
      const redisHost = process.env.REDIS_HOST || '127.0.0.1';
      const redisPort = process.env.REDIS_PORT || '6379';
      strapi.log.info(`Redis: enabled (${redisHost}:${redisPort})`);
      return;
    }

    strapi.log.info('Redis: disabled (set REDIS_ENABLED=true to enable)');
  },
};
