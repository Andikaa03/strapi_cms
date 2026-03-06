/**
 * Custom share-count routes for increment and findByArticle
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/share-counts/increment',
      handler: 'share-count.increment',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/share-counts/by-article/:articleId',
      handler: 'share-count.findByArticle',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
