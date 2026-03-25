'use strict';

const RELATED_UID_REGEX = /^(?<uid>[a-z0-9-]+\:{2}[a-z0-9-]+\.[a-z0-9-]+)\:{1}(?<id>[a-z0-9-]+)$/i;

const getDisplayTitle = (entity, documentId) => {
  if (!entity || typeof entity !== 'object') {
    return `Entry ${documentId}`;
  }

  return (
    entity.title ||
    entity.name ||
    entity.subject ||
    entity.headline ||
    entity.slug ||
    `Entry ${documentId}`
  );
};

module.exports = (plugin) => {
  const originalCommonFactory = plugin.services.common;
  const originalAdminFactory = plugin.services.admin;
  const originalAdminController = plugin.controllers.admin;

  plugin.services.common = ({ strapi }) => {
    const service = originalCommonFactory({ strapi });

    const resolveRelatedEntity = async (relation, locale) => {
      const match = String(relation || '').match(RELATED_UID_REGEX);
      if (!match?.groups?.uid || !match?.groups?.id) {
        return null;
      }

      const uid = match.groups.uid;
      const documentId = match.groups.id;

      const tryFind = async (params) => {
        try {
          return await strapi.documents(uid).findOne(params);
        } catch {
          return null;
        }
      };

      // First try exact locale without restricting status so admin can resolve draft/unpublished entries too.
      let entity = await tryFind({
        documentId,
        ...(locale ? { locale } : {}),
      });

      // Fall back to published lookup for compatibility.
      if (!entity) {
        entity = await tryFind({
          documentId,
          ...(locale ? { locale } : {}),
          status: 'published',
        });
      }

      // Final fallback keeps the admin discussion usable even when the entry lives in another environment.
      if (!entity) {
        return {
          uid,
          documentId,
          locale: locale || null,
          title: `Remote entry (${documentId})`,
          __placeholder: true,
        };
      }

      return {
        ...entity,
        uid,
        documentId: entity.documentId || documentId,
        title: getDisplayTitle(entity, documentId),
      };
    };

    return {
      ...service,
      async resolveRelatedEntity(relation, locale) {
        return resolveRelatedEntity(relation, locale);
      },
      async findRelatedEntitiesFor(comments) {
        const resolved = await Promise.all(
          (comments || []).map((comment) => resolveRelatedEntity(comment.related, comment.locale || null))
        );

        const deduped = [];
        const seen = new Set();
        for (const entity of resolved) {
          if (!entity) continue;
          const key = `${entity.uid}:${entity.documentId}:${entity.locale || ''}`;
          if (seen.has(key)) continue;
          seen.add(key);
          deduped.push(entity);
        }

        return deduped;
      },
      mergeRelatedEntityTo(comment, relatedEntities = []) {
        const merged = service.mergeRelatedEntityTo(comment, relatedEntities);
        if (merged.related) {
          return merged;
        }

        const match = String(comment?.related || '').match(RELATED_UID_REGEX);
        if (!match?.groups?.uid || !match?.groups?.id) {
          return merged;
        }

        return {
          ...merged,
          related: {
            uid: match.groups.uid,
            documentId: match.groups.id,
            locale: comment?.locale || null,
            title: `Remote entry (${match.groups.id})`,
            __placeholder: true,
          },
        };
      },
    };
  };

  plugin.services.admin = ({ strapi }) => {
    const service = originalAdminFactory({ strapi });

    return {
      ...service,
      async findOneAndThread(params) {
        const result = await service.findOneAndThread(params);
        if (result?.entity) {
          return result;
        }

        try {
          const commentService = plugin.services.common({ strapi });
          const selected = result?.selected;
          const relation = selected?.related;
          const locale = selected?.locale || null;
          const fallbackEntity = await commentService.resolveRelatedEntity(relation, locale);

          if (fallbackEntity) {
            return {
              ...result,
              entity: fallbackEntity,
            };
          }
        } catch {
          // Preserve original behavior if fallback resolution fails.
        }

        return result;
      },
    };
  };

  plugin.controllers.admin = {
    ...originalAdminController,
    async pendingComment(ctx) {
      const id = Number(ctx?.params?.id);
      if (!Number.isInteger(id) || id <= 0) {
        return ctx.badRequest('Invalid comment id');
      }

      const entity = await strapi.db.query('plugin::comments.comment').update({
        where: { id },
        data: {
          approvalStatus: 'PENDING',
          removed: false,
        },
      });

      if (!entity) {
        return ctx.notFound('Comment not found');
      }

      const commonService = plugin.services.common({ strapi });
      return commonService.sanitizeCommentEntity(entity, []);
    },
  };

  const routeGroups = Object.values(plugin.routes || {}).filter((group) => Array.isArray(group?.routes));
  const moderationGroup = routeGroups.find((group) =>
    group.routes.some((route) => route?.path === '/moderate/all')
  );

  if (moderationGroup) {
    const hasPendingRoute = moderationGroup.routes.some(
      (route) => route?.method === 'PUT' && route?.path === '/moderate/single/:id/pending'
    );

    if (!hasPendingRoute) {
      moderationGroup.routes.push({
        method: 'PUT',
        path: '/moderate/single/:id/pending',
        handler: 'admin.pendingComment',
        config: { policies: [] },
      });
    }
  }

  return plugin;
};
