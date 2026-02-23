export default [
  'strapi::logger',
  {
    name: 'strapi::compression',
    config: {
      threshold: 1024,
    },
  },
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:', process.env.PREVIEW_FRONTEND_URL || 'http://localhost:3000'],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            process.env.PREVIEW_FRONTEND_URL || 'http://localhost:3000',
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            process.env.PREVIEW_FRONTEND_URL || 'http://localhost:3000',
          ],
          'frame-src': ["'self'", process.env.PREVIEW_FRONTEND_URL || 'http://localhost:3000'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
