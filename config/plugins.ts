export default ({ env }) => ({
  ckeditor5: {
    enabled: true,
  },
  i18n: {
    enabled: true,
    config: {
      defaultLocale: 'bn-BD',
    },
  },
  upload: {
    config: {
      provider: 'local',
      sizeLimit: 1024 * 1024 * 1024, // 1GB (Super high limit to simulate no limit)
      providerOptions: {
        // using Strapi's built-in local provider (uploads go to /public/uploads)
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
  comments: {
    enabled: true,
    config: {
      badWords: false,
      moderatorRoles: ['Authenticated'],
      approvalFlow: ['api::article.article'],
      entryLabel: {
        '*': ['title', 'slug'],
      },
      enabledCollections: ['api::article.article'],
    },
  },
  // Email plugin with AWS SES provider
  // Only activates when AWS credentials are set in .env
  ...(env('AWS_SES_ACCESS_KEY_ID') ? {
    email: {
      config: {
        provider: '@strapi/provider-email-amazon-ses',
        providerOptions: {
          key: env('AWS_SES_ACCESS_KEY_ID'),
          secret: env('AWS_SES_SECRET_ACCESS_KEY'),
          amazon: `https://email.${env('AWS_SES_REGION', 'ap-southeast-1')}.amazonaws.com`,
        },
        settings: {
          defaultFrom: env('AWS_SES_DEFAULT_FROM', 'noreply@shottyodharaprotidin.com'),
          defaultReplyTo: env('AWS_SES_DEFAULT_REPLY_TO', 'noreply@shottyodharaprotidin.com'),
        },
      },
    },
  } : {}),
  seo: {
    enabled: true,
  },
  publisher: {
    enabled: true,
  },
  redis: {
    enabled: false,
  },
  'webp-converter': {
    enabled: false, // Disabled due to Windows PNG upload crash issues
  },
});
