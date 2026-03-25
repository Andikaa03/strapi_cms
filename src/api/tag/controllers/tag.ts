import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::tag.tag', ({ strapi }) => ({
	async listNames(ctx) {
		const rows = await strapi.db.query('api::tag.tag').findMany({
			select: ['name'],
			orderBy: { name: 'asc' },
			limit: 500,
		});

		ctx.body = {
			data: (rows || []).map((row: any) => row?.name).filter(Boolean),
		};
	},
}));
