/**
 * poll controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::poll.poll', ({ strapi }) => ({
    async vote(ctx) {
      try {
        const { id } = ctx.params;
        const { optionIndex } = ctx.request.body;
        
        console.log(`Voting for poll ${id}, option index: ${optionIndex}`);
  
        if (optionIndex === undefined || optionIndex === null) {
          return ctx.badRequest('optionIndex is required');
        }
  
        // Fetch the existing poll with its options using Documents Service
        const poll: any = await strapi.documents('api::poll.poll').findOne({
          documentId: id,
          populate: ['options'],
        });
  
        if (!poll) {
          return ctx.notFound(`Poll ${id} not found`);
        }
  
        const idx = parseInt(optionIndex);
        if (!poll.options || idx < 0 || idx >= poll.options.length) {
          return ctx.badRequest('Invalid optionIndex');
        }
  
        // Increment the votes for the selected option
        const updatedOptions = poll.options.map((opt: any, index: number) => {
          if (index === idx) {
            return {
              id: opt.id,
              text: opt.text,
              voteCount: (parseInt(opt.voteCount) || 0) + 1 
            };
          }
          return {
            id: opt.id,
            text: opt.text,
            voteCount: parseInt(opt.voteCount) || 0
          };
        });
  
        // Update the poll with the new options
        const updatedPoll = await strapi.documents('api::poll.poll').update({
          documentId: id,
          data: {
            totalVotes: (parseInt(poll.totalVotes) || 0) + 1,
            options: updatedOptions,
          },
        });
  
        // Auto-publish the draft changes so it instantly reflects on the frontend
        await strapi.documents('api::poll.poll').publish({
          documentId: id,
        });
  
        return { data: updatedPoll };
      } catch (err) {
        console.error('Error in vote controller:', err);
        ctx.throw(500, err.message || 'Internal Server Error');
      }
    },
}));
