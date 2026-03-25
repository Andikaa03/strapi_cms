export default {
  async updateStatus(ctx) {
    const id = Number(ctx?.params?.id);
    if (!Number.isInteger(id) || id <= 0) {
      return ctx.badRequest('Invalid comment id');
    }

    const nextStatus = String(ctx?.request?.body?.approvalStatus || '').toUpperCase();
    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(nextStatus)) {
      return ctx.badRequest('Invalid approval status');
    }

    const entity = await strapi.db.query('plugin::comments.comment').update({
      where: { id },
      data: {
        approvalStatus: nextStatus,
        removed: false,
      },
    });

    if (!entity) {
      return ctx.notFound('Comment not found');
    }

    ctx.body = {
      data: {
        id: entity.id,
        approvalStatus: entity.approvalStatus,
        removed: entity.removed,
      },
    };
  },
};
