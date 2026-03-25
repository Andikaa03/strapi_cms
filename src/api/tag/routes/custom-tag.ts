export default {
  routes: [
    {
      method: 'GET',
      path: '/tag-names',
      handler: 'tag.listNames',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
