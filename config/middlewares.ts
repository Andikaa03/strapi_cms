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
          'script-src': ["'self'", "'unsafe-inline'", 'cdn.ckeditor.com'],
          'style-src': ["'self'", "'unsafe-inline'", 'cdn.ckeditor.com'],
          'font-src': ["'self'", 'cdn.ckeditor.com'],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            'cdn.ckeditor.com',
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
  {
    name: 'strapi::body',
    config: {
      formLimit: '1024mb',
      jsonLimit: '1024mb',
      textLimit: '1024mb',
      formidable: {
        maxFileSize: 1024 * 1024 * 1024, // 1GB max file size
        maxFieldsSize: 1024 * 1024 * 1024,
        maxFields: 1000,
        keepExtensions: true,
      },
    },
  },
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
