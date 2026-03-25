const TAG_INPUT_FIELD = 'tagsInput';
const TAG_CONTENT_TYPE = 'api::tag.tag';

const normalizeTagName = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\s+/g, ' ');
};

const extractTagNames = (value: unknown): string[] => {
  if (typeof value !== 'string') return [];

  const uniqueByLower = new Map<string, string>();

  value
    .split(/[\n,;|]/)
    .map(normalizeTagName)
    .filter(Boolean)
    .forEach((name) => {
      const key = name.toLowerCase();
      if (!uniqueByLower.has(key)) {
        uniqueByLower.set(key, name);
      }
    });

  return Array.from(uniqueByLower.values());
};

const slugifyTagName = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '') || `tag-${Date.now()}`;
};

const findExistingTagId = async (name: string, locale?: string) => {
  const where: Record<string, unknown> = {
    name: {
      $eqi: name,
    },
  };

  if (locale) {
    where.locale = locale;
  }

  const existing = await strapi.db.query(TAG_CONTENT_TYPE).findOne({
    where,
    select: ['id'],
  });

  return existing?.id;
};

const findOrCreateTagId = async (name: string, locale?: string) => {
  const existingId = await findExistingTagId(name, locale);

  if (existingId) {
    return existingId;
  }

  let slug = slugifyTagName(name);
  const duplicate = await strapi.db.query(TAG_CONTENT_TYPE).findOne({
    where: { slug },
    select: ['document_id'],
  });

  if (duplicate) {
    slug = `${slug}-${Date.now()}`;
  }

  const created = await strapi.documents(TAG_CONTENT_TYPE).create({
    data: {
      name,
      slug,
    },
    ...(locale ? { locale } : {}),
  });

  if (created?.documentId) {
    const publishedEntries = await strapi.documents(TAG_CONTENT_TYPE).publish({
      documentId: created.documentId,
      ...(locale ? { locale } : {}),
    });

    const publishedEntry = Array.isArray(publishedEntries)
      ? publishedEntries.find((entry: any) => !locale || entry?.locale === locale) || publishedEntries[0]
      : null;

    if (publishedEntry?.id) {
      return publishedEntry.id;
    }
  }

  const createdId = await findExistingTagId(name, locale);
  return createdId;
};

const applyTagsFromInput = async (event: any) => {
  const data = event?.params?.data as Record<string, unknown> | undefined;
  if (!data || !(TAG_INPUT_FIELD in data)) {
    return;
  }

  const rawInput = data[TAG_INPUT_FIELD];
  const tagNames = extractTagNames(rawInput);

  if (!tagNames.length) {
    delete data[TAG_INPUT_FIELD];
    return;
  }

  const locale = typeof data.locale === 'string' && data.locale.trim() ? data.locale.trim() : undefined;

  const tagIds: number[] = [];

  for (const tagName of tagNames) {
    const tagId = await findOrCreateTagId(tagName, locale);
    if (typeof tagId === 'number') {
      tagIds.push(tagId);
    }
  }

  if (tagIds.length) {
    data.tags = {
      set: tagIds,
    };
  }

  delete data[TAG_INPUT_FIELD];
};

const loadTagNamesForArticle = async (item: any): Promise<string[]> => {
  if (!item?.id) {
    return [];
  }

  const rows = await strapi.db.query(TAG_CONTENT_TYPE).findMany({
    where: {
      articles: {
        id: item.id,
      },
    },
    select: ['name'],
    orderBy: { name: 'asc' },
  });

  return (rows || []).map((tag: any) => tag?.name).filter(Boolean);
};

const syncTagsInputFromTags = async (item: any) => {
  if (!item) return;

  const inlineTagNames = Array.isArray(item.tags)
    ? item.tags.map((t: any) => t?.name).filter(Boolean)
    : [];

  const tagNames = inlineTagNames.length ? inlineTagNames : await loadTagNamesForArticle(item);
  item[TAG_INPUT_FIELD] = tagNames.join(', ');
};

export default {
  async afterFindOne(event: any) {
    await syncTagsInputFromTags(event?.result);
  },

  async afterFindMany(event: any) {
    const results = event?.result;
    if (Array.isArray(results)) {
      await Promise.all(results.map(syncTagsInputFromTags));
    }
  },

  async beforeCreate(event: any) {
    await applyTagsFromInput(event);
  },

  async beforeUpdate(event: any) {
    await applyTagsFromInput(event);
  },
};
