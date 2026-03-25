import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }: { strapi: Core.Strapi }) {
    strapi.customFields.register({
      name: 'tag-picker',
      type: 'string',
    });

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
    strapi.db.lifecycles.subscribe({
      models: ['plugin::comments.comment'],
      async beforeUpdate(event) {
        const nextStatus = String(event?.params?.data?.approvalStatus || '').toUpperCase();
        if (nextStatus !== 'REJECTED') {
          return;
        }

        const existing = await strapi.db.query('plugin::comments.comment').findOne({
          where: event?.params?.where,
          select: ['id', 'approvalStatus', 'removed'],
        });

        const currentStatus = String(existing?.approvalStatus || '').toUpperCase();
        if (currentStatus !== 'APPROVED') {
          return;
        }

        // Do not mark as removed when rejecting - just update the status
        // event.params.data = {
        //   ...(event.params.data || {}),
        //   removed: true,
        // };

        event.state = {
          ...(event.state || {}),
          cascadeRemovedFromId: null, // Do not cascade remove children
        };
      },
      async afterUpdate(event) {
        const rootId = event?.state?.cascadeRemovedFromId;
        if (!rootId) {
          return;
        }

        const descendants = new Set();
        let frontier = [rootId];

        while (frontier.length > 0) {
          const children = await strapi.db.query('plugin::comments.comment').findMany({
            where: {
              threadOf: {
                id: {
                  $in: frontier,
                },
              },
              removed: { $not: true },
            },
            select: ['id'],
            limit: 1000,
          });

          const nextFrontier = [];
          for (const child of children || []) {
            if (!descendants.has(child.id)) {
              descendants.add(child.id);
              nextFrontier.push(child.id);
            }
          }

          frontier = nextFrontier;
        }

        if (descendants.size > 0) {
          await strapi.db.query('plugin::comments.comment').updateMany({
            where: {
              id: {
                $in: Array.from(descendants),
              },
            },
            data: {
              removed: true,
            },
          });
        }
      },
    });

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
