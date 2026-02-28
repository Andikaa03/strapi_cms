export default ({ env }) => ({
  ckeditor5: {
    enabled: true,
    config: {
      plugin: {
        // By default Strapi CKEditor plugins might need explicit config for certain blocks
        // We'll leave the default toolbar but ensure 'blockQuote' is available.
      },
      editor: {
        toolbar: {
          items: [
            'heading',
            '|',
            'bold',
            'italic',
            'underline',
            'strikethrough',
            'link',
            '|',
            'bulletedList',
            'numberedList',
            '|',
            'blockQuote',      // Ensure BlockQuote is in the toolbar
            'insertImage',
            'mediaEmbed',
            'insertTable',
            '|',
            'undo',
            'redo',
            '|',
            'sourceEditing'
          ]
        }
      }
    }
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
      sizeLimit: 10000000,
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
});
