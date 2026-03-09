export default {
    routes: [
      {
        method: 'PUT',
        path: '/polls/:id/vote',
        handler: 'poll.vote',
        config: {
          policies: [],
          middlewares: [],
        },
      },
    ],
  };
