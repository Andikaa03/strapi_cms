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
  
        // Update the poll for ALL localized versions
        const allLocales = await strapi.documents('api::poll.poll').findMany({
          filters: { documentId: id },
          locale: '*', // Get all locales in Strapi 5
          populate: ['options'],
          status: 'published' // Make sure we get published ones
        });

        console.log(`Poll ID: ${id}. Found ${allLocales.length} localized versions.`);
        allLocales.forEach(l => console.log(` - Locale: ${l.locale}, Options Count: ${l.options?.length}`));

        let updatedEntryForCurrentLocale = null;

        for (const p of allLocales) {
          console.log(`Syncing locale: ${p.locale} (Option Index: ${idx})`);
          
          // Sync by index: only update if the locale has enough options
          if (!p.options || idx >= p.options.length) {
            console.log(` ! Skipping locale ${p.locale}: options length is ${p.options?.length || 0}`);
            continue;
          }

          const updatedOptions = p.options.map((opt: any, index: number) => {
            const currentCount = Number(opt.voteCount) || 0;
            if (index === idx) {
              const newVoteCount = currentCount + 1;
              console.log(`   + Index ${idx} in ${p.locale}: ${currentCount} -> ${newVoteCount}`);
              return {
                text: opt.text,
                voteCount: newVoteCount 
              };
            }
            return {
              text: opt.text,
              voteCount: currentCount
            };
          });

          await strapi.documents('api::poll.poll').update({
            documentId: id,
            locale: p.locale,
            data: {
              totalVotes: (Number(p.totalVotes) || 0) + 1,
              options: updatedOptions,
            },
          });

          // Auto-publish to reflect changes instantly
          await strapi.documents('api::poll.poll').publish({
            documentId: id,
            locale: p.locale,
          });

          if (p.locale === poll.locale) {
            // Re-fetch to get the state after update for return value
            updatedEntryForCurrentLocale = await strapi.documents('api::poll.poll').findOne({
              documentId: id,
              locale: p.locale,
              populate: ['options'],
            });
          }
        }

        return { data: updatedEntryForCurrentLocale };
      } catch (err) {
        console.error('Error in vote controller:', err);
        ctx.throw(500, err.message || 'Internal Server Error');
      }
    },
}));
