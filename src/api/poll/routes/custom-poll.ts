export default {
    routes: [
      {
        method: 'PUT',
        path: '/polls/:id/vote',
        handler: 'poll.vote',
        config: {
          auth: false,
          policies: [],
          middlewares: [],
        },
      },
    ],
  };
