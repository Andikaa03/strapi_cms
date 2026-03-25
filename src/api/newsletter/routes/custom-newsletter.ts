export default {
  routes: [
    {
      method: 'POST',
      path: '/newsletters/subscribe',
      handler: 'newsletter.subscribe',
      config: {
        auth: false,
      },
    },
  ],
};
