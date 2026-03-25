export default {
  routes: [
    {
      method: 'PUT',
      path: '/comment-status/:id',
      handler: 'comment-status.updateStatus',
      config: {
        auth: false,
      },
    },
  ],
};
