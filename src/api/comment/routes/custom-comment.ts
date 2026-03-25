export default {
  routes: [
    {
      method: 'GET',
      path: '/public-comments/:documentId',
      handler: 'comment.findByArticle',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/public-comments/:documentId',
      handler: 'comment.createForArticle',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
