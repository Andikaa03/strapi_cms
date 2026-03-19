const SOCIAL_COUNT_FIELDS = [
  'socialRssSubscribers',
  'socialFacebookFans',
  'socialInstagramFollowers',
  'socialYoutubeSubscribers',
  'socialTwitterFollowers',
  'socialPinterestFollowers',
] as const;

const toSafeNumber = (value: unknown): number => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === 'string') {
    const normalized = value.replace(/,/g, '').trim();
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const getSocialTotal = (data: Record<string, unknown>) => {
  return SOCIAL_COUNT_FIELDS.reduce((sum, field) => sum + toSafeNumber(data[field]), 0);
};

const mergeWithExistingCounts = async (event: any) => {
  const where = event?.params?.where;
  const incomingData = (event?.params?.data || {}) as Record<string, unknown>;

  if (!where) {
    return incomingData;
  }

  const existing = await strapi.db.query('api::global.global').findOne({
    where,
    select: [...SOCIAL_COUNT_FIELDS],
  });

  if (!existing) {
    return incomingData;
  }

  return {
    ...existing,
    ...incomingData,
  };
};

export default {
  async beforeCreate(event: any) {
    const data = (event.params.data || {}) as Record<string, unknown>;
    data.socialTotalFollowers = getSocialTotal(data);
    event.params.data = data;
  },

  async beforeUpdate(event: any) {
    const merged = await mergeWithExistingCounts(event);
    event.params.data = {
      ...(event.params.data || {}),
      socialTotalFollowers: getSocialTotal(merged),
    };
  },
};
