/**
 * share-count controller
 * Custom controller with increment endpoint
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::share-count.share-count', ({ strapi }) => ({
  /**
   * Custom action: Increment share count for a specific platform.
   * POST /api/share-counts/increment
   * Body: { articleId: string (documentId), platform: "facebook"|"twitter"|"linkedin"|"pinterest"|"whatsapp" }
   */
  async increment(ctx) {
    const { articleId, platform } = ctx.request.body as any;

    // Validate input
    const validPlatforms = ['facebook', 'twitter', 'linkedin', 'pinterest', 'whatsapp', 'likes'];
    if (!articleId || !platform || !validPlatforms.includes(platform)) {
      return ctx.badRequest('Invalid request. Required: articleId and platform (facebook|twitter|linkedin|pinterest|whatsapp|likes)');
    }

    try {
      let article = null;
      const numericInput = Number(articleId);

      if (Number.isInteger(numericInput) && numericInput > 0) {
        article = await strapi.db.query('api::article.article').findOne({
          where: { id: numericInput },
          select: ['id'],
        });
      }

      if (!article) {
        article = await strapi.db.query('api::article.article').findOne({
          where: { documentId: articleId },
          select: ['id'],
        });
      }

      if (!article) {
        return ctx.notFound('Article not found');
      }

      const numericArticleId = article.id;

      // Find existing share count record for this article
      const existing = await strapi.db.query('api::share-count.share-count').findOne({
        where: {
          article: numericArticleId,
        },
      });

      if (existing) {
        // Increment the specific platform count
        const updated = await strapi.db.query('api::share-count.share-count').update({
          where: { id: existing.id },
          data: {
            [platform]: (existing[platform] || 0) + 1,
          },
        });
        return { data: updated };
      } else {
        // Create new record with count = 1 for this platform
        const created = await strapi.db.query('api::share-count.share-count').create({
          data: {
            article: numericArticleId,
            facebook: 0,
            twitter: 0,
            linkedin: 0,
            pinterest: 0,
            whatsapp: 0,
            likes: 0,
            [platform]: 1,
          },
        });
        return { data: created };
      }
    } catch (error) {
      strapi.log.error('Share count increment error:', error);
      return ctx.internalServerError('Failed to update share count');
    }
  },

  /**
   * Custom action: Decrement share/like count for a specific platform.
   * POST /api/share-counts/decrement
   * Body: { articleId, platform }
   */
  async decrement(ctx) {
    const { articleId, platform } = ctx.request.body as any;

    const validPlatforms = ['facebook', 'twitter', 'linkedin', 'pinterest', 'whatsapp', 'likes'];
    if (!articleId || !platform || !validPlatforms.includes(platform)) {
      return ctx.badRequest('Invalid request. Required: articleId and platform (facebook|twitter|linkedin|pinterest|whatsapp|likes)');
    }

    try {
      let article = null;
      const numericInput = Number(articleId);

      if (Number.isInteger(numericInput) && numericInput > 0) {
        article = await strapi.db.query('api::article.article').findOne({
          where: { id: numericInput },
          select: ['id'],
        });
      }

      if (!article) {
        article = await strapi.db.query('api::article.article').findOne({
          where: { documentId: articleId },
          select: ['id'],
        });
      }

      if (!article) {
        return ctx.notFound('Article not found');
      }

      const numericArticleId = article.id;

      const existing = await strapi.db.query('api::share-count.share-count').findOne({
        where: {
          article: numericArticleId,
        },
      });

      if (existing) {
        const updated = await strapi.db.query('api::share-count.share-count').update({
          where: { id: existing.id },
          data: {
            [platform]: Math.max((existing[platform] || 0) - 1, 0),
          },
        });
        return { data: updated };
      }

      const created = await strapi.db.query('api::share-count.share-count').create({
        data: {
          article: numericArticleId,
          facebook: 0,
          twitter: 0,
          linkedin: 0,
          pinterest: 0,
          whatsapp: 0,
          likes: 0,
        },
      });
      return { data: created };
    } catch (error) {
      strapi.log.error('Share count decrement error:', error);
      return ctx.internalServerError('Failed to update share count');
    }
  },

  /**
   * Custom action: Get share counts for a specific article.
   * GET /api/share-counts/by-article/:articleId
   * articleId = documentId (string)
   */
  async findByArticle(ctx) {
    const { articleId } = ctx.params;

    if (!articleId) {
      return ctx.badRequest('articleId is required');
    }

    try {
      let article = null;
      const numericInput = Number(articleId);

      if (Number.isInteger(numericInput) && numericInput > 0) {
        article = await strapi.db.query('api::article.article').findOne({
          where: { id: numericInput },
          select: ['id'],
        });
      }

      if (!article) {
        article = await strapi.db.query('api::article.article').findOne({
          where: { documentId: articleId },
          select: ['id'],
        });
      }

      if (!article) {
        return {
          data: {
            facebook: 0, twitter: 0, linkedin: 0, pinterest: 0, whatsapp: 0, likes: 0,
          },
        };
      }

      const shareCount = await strapi.db.query('api::share-count.share-count').findOne({
        where: {
          article: article.id,
        },
      });

      if (!shareCount) {
        return {
          data: {
            facebook: 0, twitter: 0, linkedin: 0, pinterest: 0, whatsapp: 0, likes: 0,
          },
        };
      }

      return {
        data: {
          facebook: shareCount.facebook || 0,
          twitter: shareCount.twitter || 0,
          linkedin: shareCount.linkedin || 0,
          pinterest: shareCount.pinterest || 0,
          whatsapp: shareCount.whatsapp || 0,
          likes: shareCount.likes || 0,
        },
      };
    } catch (error) {
      strapi.log.error('Share count fetch error:', error);
      return ctx.internalServerError('Failed to fetch share count');
    }
  },
}));
