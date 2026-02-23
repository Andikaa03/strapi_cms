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
        handler: (uid, { documentId, locale, status, slug }) => {
          const baseUrl = process.env.PREVIEW_FRONTEND_URL || 'http://localhost:3000';
          const secret = process.env.PREVIEW_SECRET || 'my-super-secret-preview-token';
          const slugParam = slug || documentId; 
          return `${baseUrl}/api/preview?secret=${secret}&slug=${slugParam}&locale=${locale}&status=${status}`;
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
  bootstrap(/* { strapi }: { strapi: Core.Strapi } */) {},
};
