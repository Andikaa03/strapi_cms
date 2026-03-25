import { factories } from '@strapi/strapi';

const RELATION_UID = 'api::article.article';

const normalizeLocale = (locale?: string) => {
  if (!locale) return undefined;
  if (locale === 'bn') return 'bn-BD';
  if (locale === 'en') return 'en';
  return locale;
};

export default factories.createCoreController('api::article.article', ({ strapi }) => ({
  async findByArticle(ctx) {
    const { documentId } = ctx.params as { documentId?: string };
    const localeParam = normalizeLocale((ctx.query?.locale as string) || (ctx.request?.query?.locale as string));

    if (!documentId) {
      return ctx.badRequest('documentId is required');
    }

    try {
      const relation = `${RELATION_UID}:${documentId}`;
      const whereClause: any = {
        related: relation,
        removed: { $not: true },
        blocked: { $not: true },
        approvalStatus: 'APPROVED',
      };

      if (localeParam) {
        whereClause.locale = localeParam;
      }

      const rows = await strapi.db.query('plugin::comments.comment').findMany({
        where: whereClause,
        select: [
          'id',
          'documentId',
          'content',
          'authorId',
          'authorName',
          'authorEmail',
          'authorAvatar',
          'createdAt',
          'updatedAt',
          'approvalStatus',
          'locale',
        ],
        populate: {
          threadOf: {
            select: ['id'],
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const nodes = (rows || []).map((item: any) => ({
        id: item.id,
        documentId: item.documentId,
        content: item.content,
        author: {
          id: item.authorId,
          name: item.authorName || 'Anonymous',
          email: item.authorEmail,
          avatar: item.authorAvatar,
        },
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        threadOf: item.threadOf || null,
        approvalStatus: item.approvalStatus,
        locale: item.locale,
        children: [],
      }));

      const byId = new Map<number, any>();
      nodes.forEach((n: any) => byId.set(n.id, n));

      const roots: any[] = [];
      nodes.forEach((n: any) => {
        const parentId = typeof n.threadOf === 'object' ? n.threadOf?.id : n.threadOf;
        if (parentId && byId.has(parentId)) {
          byId.get(parentId).children.push(n);
        } else if (!parentId) {
          roots.push(n);
        }
      });

      return roots;
    } catch (error) {
      strapi.log.error('Public comments fetch failed:', error);
      return ctx.internalServerError('Failed to fetch comments');
    }
  },

  async listForAdmin(ctx) {
    const page = Math.max(1, parseInt((ctx.query?.page as string) || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt((ctx.query?.pageSize as string) || '25', 10)));
    const offset = (page - 1) * pageSize;

    try {
      const [rows, total] = await Promise.all([
        strapi.db.query('plugin::comments.comment').findMany({
          where: { removed: { $not: true } },
          select: ['id', 'content', 'authorName', 'authorEmail', 'related', 'createdAt', 'approvalStatus', 'locale'],
          populate: { threadOf: { select: ['id'] } },
          orderBy: { createdAt: 'desc' },
          limit: pageSize,
          offset,
        }),
        strapi.db.query('plugin::comments.comment').count({ where: { removed: { $not: true } } }),
      ]);

      // collect unique article documentIds from related field
      const docIds = [...new Set(
        (rows || []).map((r: any) => {
          const match = (r.related || '').match(/api::article\.article:(.+)/);
          return match ? match[1] : null;
        }).filter(Boolean)
      )] as string[];

      // fetch article slugs in one query
      const articles = docIds.length
        ? await strapi.db.query('api::article.article').findMany({
            where: { documentId: { $in: docIds } },
            select: ['documentId', 'slug'],
          })
        : [];

      const slugMap: Record<string, string> = {};
      (articles as any[]).forEach((a: any) => { slugMap[a.documentId] = a.slug; });

      const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://shottyodharaprotidin.com';

      const data = (rows || []).map((r: any) => {
        const match = (r.related || '').match(/api::article\.article:(.+)/);
        const articleDocId = match ? match[1] : null;
        const slug = articleDocId ? slugMap[articleDocId] : null;
        const postUrl = slug ? `${SITE_URL}/article/${slug}` : (articleDocId ? `(docId: ${articleDocId})` : '-');
        return {
          id: r.id,
          authorName: r.authorName,
          authorEmail: r.authorEmail || '-',
          content: r.content,
          threadOf: r.threadOf?.id ?? null,
          postUrl,
          status: r.approvalStatus,
          locale: r.locale,
          createdAt: r.createdAt,
        };
      });

      ctx.body = { data, meta: { page, pageSize, total, pageCount: Math.ceil(total / pageSize) } };
    } catch (error) {
      strapi.log.error('listForAdmin failed:', error);
      return ctx.internalServerError('Failed to list comments');
    }
  },

  async createForArticle(ctx) {
    const { documentId } = ctx.params as { documentId?: string };
    const body = (ctx.request.body || {}) as {
      author?: { id?: string; name?: string; email?: string; avatar?: string };
      content?: string;
      threadOf?: number | string | null;
      locale?: string;
    };

    if (!documentId) {
      return ctx.badRequest('documentId is required');
    }

    if (!body?.content || typeof body.content !== 'string' || !body.content.trim()) {
      return ctx.badRequest('content is required');
    }

    if (!body?.author?.name || !body?.author?.email) {
      return ctx.badRequest('author name and email are required');
    }

    const locale = normalizeLocale(body.locale);

    try {
      const relation = `${RELATION_UID}:${documentId}`;

      let parentCommentId: number | null = null;
      if (body.threadOf !== null && body.threadOf !== undefined && body.threadOf !== '') {
        const parsed = Number(body.threadOf);
        if (Number.isFinite(parsed) && parsed > 0) {
          parentCommentId = parsed;
        }
      }

      const created = await strapi.db.query('plugin::comments.comment').create({
        data: {
          content: body.content.trim(),
          related: relation,
          authorId: body.author.id || body.author.email,
          authorName: body.author.name,
          authorEmail: body.author.email,
          authorAvatar: body.author.avatar || null,
          blocked: false,
          blockedThread: false,
          removed: false,
          approvalStatus: 'PENDING',
          threadOf: parentCommentId,
          locale: locale || null,
        },
      });

      return {
        id: created.id,
        documentId: created.documentId,
        content: created.content,
        author: {
          id: created.authorId,
          name: created.authorName,
          email: created.authorEmail,
          avatar: created.authorAvatar,
        },
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      };
    } catch (error) {
      strapi.log.error('Public comment create failed:', error);
      return ctx.internalServerError('Failed to create comment');
    }
  },
}));
