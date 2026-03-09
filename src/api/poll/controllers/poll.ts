/**
 * poll controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::poll.poll', ({ strapi }) => ({
    async vote(ctx) {
      try {
        const { id } = ctx.params;
        const { optionIndex } = ctx.request.body;
  
        if (typeof optionIndex !== 'number') {
          return ctx.badRequest('optionIndex is required and must be a number');
        }
  
        // Fetch the existing poll with its options
        const poll: any = await strapi.entityService.findOne('api::poll.poll', id, {
          populate: ['options'],
        });
  
        if (!poll) {
          return ctx.notFound('Poll not found');
        }
  
        if (!poll.options || optionIndex < 0 || optionIndex >= poll.options.length) {
          return ctx.badRequest('Invalid optionIndex');
        }
  
        // Increment the votes for the selected option
        const updatedOptions = poll.options.map((opt: any, index: number) => {
          if (index === optionIndex) {
            return { ...opt, votes: (opt.votes || 0) + 1 };
          }
          return { ...opt };
        });
  
        // Update the poll with the new options
        const updatedPoll = await strapi.entityService.update('api::poll.poll', id, {
          data: {
            options: updatedOptions,
          },
        });
  
        return { data: updatedPoll };
      } catch (err) {
        ctx.throw(500, err);
      }
    },
}));
