import { Client } from "@notionhq/client";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { PROFILE_POST_SLUG } from "./site";

/** @typedef {{ id: string, slug: string, title: string, excerpt: string, coverUrl: string | null, publishedAt: string | null }} BlogPostSummary */

/** Noms de propriétés alignés sur la base Notion (cf. base « Blog »). */
const PROP_TITLE = "Nom";
const PROP_DATE = "Date";
const PROP_COVER_FILES = "Fichiers et médias";
const PROP_EXCERPT = "text";

let _client;

export function getNotionClient() {
  const token = process.env.NOTION_TOKEN?.trim();
  if (!token) {
    throw new Error("NOTION_TOKEN est requis (voir .env.local).");
  }
  if (!_client) {
    _client = new Client({ auth: token });
  }
  return _client;
}

export function normalizeNotionDatabaseId(raw) {
  const s = String(raw).trim().replace(/-/g, "");
  if (!/^[a-f0-9]{32}$/i.test(s)) {
    return String(raw).trim();
  }
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
}

export function getDatabaseId() {
  const raw = process.env.NOTION_DATABASE_ID?.trim();
  if (!raw) {
    throw new Error("NOTION_DATABASE_ID est requis (voir .env.local).");
  }
  return normalizeNotionDatabaseId(raw);
}

export function isNotionConfigured() {
  return Boolean(
    process.env.NOTION_TOKEN?.trim() && process.env.NOTION_DATABASE_ID?.trim(),
  );
}

function plainText(richText) {
  if (!richText?.length) return "";
  return richText.map((t) => t.plain_text).join("");
}

function slugify(str) {
  const s = String(str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || "article";
}

/**
 * Lit une valeur de page par le nom affiché Notion (API 2026 : clés = ids).
 * @param {import('@notionhq/client').PageObjectResponse} page
 * @param {import('@notionhq/client').DataSourceObjectResponse | null} schema
 * @param {string} displayName
 */
function getPagePropByDisplayName(page, schema, displayName) {
  if (schema?.properties) {
    for (const [propId, cfg] of Object.entries(schema.properties)) {
      if (cfg?.name === displayName && page.properties[propId] != null) {
        return page.properties[propId];
      }
    }
  }
  const direct = page.properties[displayName];
  return direct ?? undefined;
}

/**
 * Une seule résolution base → data source par requête (évite les appels doublons).
 * @returns {Promise<{ dataSourceId: string, schema: import('@notionhq/client').DataSourceObjectResponse }>}
 */
export const resolveBlogDataSource = cache(async () => {
  const notion = getNotionClient();
  const dbId = getDatabaseId();
  const override = process.env.NOTION_DATA_SOURCE_ID?.trim();
  let dataSourceId = override ? normalizeNotionDatabaseId(override) : null;

  /** @type {import('@notionhq/client').GetDataSourceResponse} */
  let schema;

  if (dataSourceId) {
    schema = await notion.dataSources.retrieve({ data_source_id: dataSourceId });
  } else {
    const db = await notion.databases.retrieve({ database_id: dbId });
    const sources = db.data_sources;
    if (!sources?.length) {
      throw new Error(
        "Base Notion sans data_sources. Ouvrez la base en pleine page, ou renseignez NOTION_DATA_SOURCE_ID dans .env.local (voir doc Notion API).",
      );
    }
    dataSourceId = sources[0].id;
    schema = await notion.dataSources.retrieve({ data_source_id: dataSourceId });
  }

  if (!schema.properties || Object.keys(schema.properties).length === 0) {
    throw new Error(
      "Schéma de source Notion illisible (properties vides). Vérifiez que l’intégration a accès à la base.",
    );
  }

  return { dataSourceId, schema };
});

/**
 * @param {import('@notionhq/client').DataSourceObjectResponse} schema
 */
function getPublishedCheckboxName(schema) {
  for (const cfg of Object.values(schema.properties)) {
    if (cfg.type === "checkbox" && cfg.name?.toLowerCase() === "case") {
      return cfg.name;
    }
  }
  const boxes = Object.values(schema.properties).filter((c) => c.type === "checkbox");
  if (boxes.length === 1) return boxes[0].name;
  return null;
}

/**
 * @param {import('@notionhq/client').DataSourceObjectResponse} schema
 */
function getDatePropertyNameForSort(schema) {
  for (const cfg of Object.values(schema.properties)) {
    if (cfg.type === "date" && cfg.name?.toLowerCase() === "date") {
      return cfg.name;
    }
  }
  const d = Object.values(schema.properties).find((c) => c.type === "date");
  return d?.name ?? null;
}

/**
 * @param {import('@notionhq/client').DataSourceObjectResponse} schema
 */
function getSlugPropertyName(schema) {
  const s = Object.values(schema.properties).find(
    (c) => c.type === "rich_text" && c.name?.toLowerCase() === "slug",
  );
  return s?.name ?? null;
}

function getTitleFromPage(page, schema) {
  const nom = getPagePropByDisplayName(page, schema, PROP_TITLE);
  if (nom?.type === "title") {
    return plainText(nom.title);
  }
  for (const prop of Object.values(page.properties)) {
    if (prop.type === "title") {
      return plainText(prop.title);
    }
  }
  return "";
}

function getRichTextByDisplayName(page, schema, name) {
  const prop = getPagePropByDisplayName(page, schema, name);
  if (!prop || prop.type !== "rich_text") return "";
  return plainText(prop.rich_text);
}

function getExcerptRichText(page, schema) {
  const direct = getRichTextByDisplayName(page, schema, PROP_EXCERPT);
  if (direct) return direct;
  for (const [propId, prop] of Object.entries(page.properties)) {
    if (prop.type !== "rich_text") continue;
    const cfg = schema?.properties?.[propId];
    if (cfg?.name?.toLowerCase() === "text") {
      return plainText(prop.rich_text);
    }
  }
  return "";
}

function getSlugFromPage(page, schema, title) {
  const fromProp = getRichTextByDisplayName(page, schema, "Slug").trim();
  if (fromProp) return slugify(fromProp);
  return slugify(title);
}

function filePropToUrl(filesProp) {
  if (filesProp?.type !== "files" || !filesProp.files?.[0]) return null;
  const f = filesProp.files[0];
  if (f.type === "external") return f.external.url;
  if (f.type === "file") return f.file.url;
  return null;
}

function getCoverUrl(page, schema) {
  const exact = getPagePropByDisplayName(page, schema, PROP_COVER_FILES);
  let u = filePropToUrl(exact);
  if (u) return u;
  for (const [key, prop] of Object.entries(page.properties)) {
    const cfg = schema?.properties?.[key];
    const label = cfg?.name ?? "";
    if (
      prop.type === "files" &&
      (label.toLowerCase().includes("fichier") || label.includes("médias"))
    ) {
      u = filePropToUrl(prop);
      if (u) return u;
    }
  }
  const anyFiles = Object.values(page.properties).find((p) => p.type === "files");
  u = filePropToUrl(anyFiles);
  if (u) return u;
  // Couverture native Notion (page.cover) en dernier recours
  if ("cover" in page && page.cover) {
    if (page.cover.type === "external") return page.cover.external.url;
    if (page.cover.type === "file") return page.cover.file.url;
  }
  return null;
}

/** URLs S3 Notion signées : expirent ~1 h — ne jamais les mettre en cache HTML. */
export function isExpiringNotionUrl(url) {
  if (!url) return false;
  try {
    const host = new URL(url).hostname;
    return (
      host.includes("amazonaws.com") ||
      host.includes("notion-static") ||
      host.endsWith("notion.so") ||
      host.endsWith("notion.com")
    );
  } catch {
    return false;
  }
}

/**
 * URL stable (proxy local) pour les fichiers Notion temporaires.
 * @param {string} pageId
 * @param {string | null} coverUrl
 * @param {string | null | undefined} lastEditedTime
 */
export function toStableCoverUrl(pageId, coverUrl, lastEditedTime) {
  if (!coverUrl) return null;
  if (!isExpiringNotionUrl(coverUrl)) return coverUrl;
  const params = new URLSearchParams();
  if (lastEditedTime) params.set("v", lastEditedTime);
  return `/api/notion-cover/${pageId}?${params.toString()}`;
}

/**
 * Récupère une URL de couverture fraîche (signée) depuis Notion.
 * @param {string} pageId
 * @returns {Promise<string | null>}
 */
export async function fetchFreshCoverUrl(pageId) {
  const notion = getNotionClient();
  const { schema } = await resolveBlogDataSource();
  const page = await notion.pages.retrieve({ page_id: pageId });
  if (!page || page.object !== "page" || !("properties" in page)) {
    return null;
  }
  return getCoverUrl(
    /** @type {import('@notionhq/client').PageObjectResponse} */ (page),
    schema,
  );
}

/**
 * URL fraîche d’un bloc image / fichier Notion.
 * @param {string} blockId
 * @returns {Promise<string | null>}
 */
export async function fetchFreshBlockFileUrl(blockId) {
  const notion = getNotionClient();
  const block = await notion.blocks.retrieve({ block_id: blockId });
  if (!block || !("type" in block)) return null;
  if (block.type === "image") {
    const img = block.image;
    if (img.type === "external") return img.external.url;
    if (img.type === "file") return img.file.url;
  }
  if (block.type === "file") {
    const f = block.file;
    if (f.type === "external") return f.external.url;
    if (f.type === "file") return f.file.url;
  }
  return null;
}

function getPublishedDate(page, schema) {
  const d = getPagePropByDisplayName(page, schema, PROP_DATE);
  if (d?.type === "date" && d.date?.start) return d.date.start;
  for (const prop of Object.values(page.properties)) {
    if (prop.type === "date" && prop.date?.start) return prop.date.start;
  }
  return null;
}

/**
 * @param {import('@notionhq/client').PageObjectResponse} page
 * @param {import('@notionhq/client').DataSourceObjectResponse | null} schema
 */
export function pageToSummary(page, schema = null) {
  const title = getTitleFromPage(page, schema);
  const rawCover = getCoverUrl(page, schema);
  const lastEdited =
    "last_edited_time" in page ? page.last_edited_time : null;
  return {
    id: page.id,
    slug: getSlugFromPage(page, schema, title),
    title,
    excerpt: getExcerptRichText(page, schema),
    coverUrl: toStableCoverUrl(page.id, rawCover, lastEdited),
    publishedAt: getPublishedDate(page, schema),
  };
}

/**
 * @param {import('@notionhq/client').Client} notion
 * @param {string} dataSourceId
 * @param {object} baseBody filter + sorts (sans pagination)
 */
async function queryDataSourceAllPages(notion, dataSourceId, baseBody) {
  const all = [];
  let cursor = undefined;
  do {
    /** @type {import('@notionhq/client').QueryDataSourceParameters} */
    const args = {
      data_source_id: dataSourceId,
      ...baseBody,
      start_cursor: cursor,
      page_size: 100,
    };
    const res = await notion.dataSources.query(args);
    const pages = res.results.filter(
      (r) => r.object === "page" && "properties" in r && r.properties,
    );
    all.push(...pages);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return /** @type {import('@notionhq/client').PageObjectResponse[]} */ (all);
}

/**
 * @param {import('@notionhq/client').DataSourceObjectResponse} schema
 * @param {{ withPublishedFilter?: boolean, withSort?: boolean }} opts
 */
function buildDataSourceQueryBody(schema, opts = {}) {
  const { withPublishedFilter = true, withSort = true } = opts;
  /** @type {Record<string, unknown>} */
  const body = {};

  const publishedName = getPublishedCheckboxName(schema);
  if (withPublishedFilter && publishedName) {
    body.filter = {
      property: publishedName,
      type: "checkbox",
      checkbox: { equals: true },
    };
  }

  if (withSort) {
    // Tri Notion indicative uniquement — l’ordre final est fixé côté serveur
    // (sans date = à la une, puis dates du plus récent au plus ancien).
    const dateName = getDatePropertyNameForSort(schema);
    body.sorts = dateName
      ? [{ property: dateName, direction: "ascending" }]
      : [{ timestamp: "last_edited_time", direction: "descending" }];
  }

  return { body, publishedName };
}

/**
 * Sans date → devant (à la une). Avec date → ensuite, du plus récent au plus ancien.
 * @param {BlogPostSummary[]} posts
 */
function sortPostsFeaturedFirst(posts) {
  return [...posts].sort((a, b) => {
    const aDated = Boolean(a.publishedAt);
    const bDated = Boolean(b.publishedAt);
    if (!aDated && bDated) return -1;
    if (aDated && !bDated) return 1;
    if (!aDated && !bDated) return 0;
    return (
      new Date(/** @type {string} */ (b.publishedAt)).getTime() -
      new Date(/** @type {string} */ (a.publishedAt)).getTime()
    );
  });
}

/**
 * @param {import('@notionhq/client').PageObjectResponse} page
 * @param {import('@notionhq/client').DataSourceObjectResponse} schema
 * @param {string | null} publishedName
 */
function isPublishedPage(page, schema, publishedName) {
  if (!publishedName) return true;
  const prop = getPagePropByDisplayName(page, schema, publishedName);
  return prop?.type === "checkbox" && prop.checkbox === true;
}

/**
 * @returns {Promise<BlogPostSummary[]>}
 */
async function fetchBlogPostList() {
  const notion = getNotionClient();
  const { dataSourceId, schema } = await resolveBlogDataSource();

  const { body: baseBody, publishedName } = buildDataSourceQueryBody(schema);

  /** @type {import('@notionhq/client').PageObjectResponse[]} */
  let rows = [];

  try {
    rows = await queryDataSourceAllPages(notion, dataSourceId, baseBody);
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[Notion] Requête data source (avec tri) échouée, essai sans tri :",
        err?.message || err,
      );
    }
    const { body: noSortBody } = buildDataSourceQueryBody(schema, {
      withSort: false,
    });
    try {
      rows = await queryDataSourceAllPages(notion, dataSourceId, noSortBody);
    } catch (err2) {
      throw err2;
    }
  }

  if (publishedName && rows.length === 0) {
    const { body: unfiltered } = buildDataSourceQueryBody(schema, {
      withPublishedFilter: false,
    });
    try {
      const raw = await queryDataSourceAllPages(notion, dataSourceId, unfiltered);
      rows = raw.filter((p) => isPublishedPage(p, schema, publishedName));
      if (process.env.NODE_ENV === "development" && rows.length > 0) {
        console.warn(
          "[Notion] Filtre API checkbox vide — filtrage côté serveur appliqué.",
        );
      }
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[Notion] Secours sans filtre :", err?.message || err);
      }
    }
  }

  const summaries = sortPostsFeaturedFirst(
    rows
      .map((p) => pageToSummary(p, schema))
      .filter((s) => s.slug && s.title && s.slug !== PROFILE_POST_SLUG),
  );

  if (process.env.NODE_ENV === "development" && summaries.length === 0 && rows.length > 0) {
    console.warn(
      "[Notion] Pages reçues mais titre/slug vide — vérifiez la propriété « Nom ».",
    );
  }

  return summaries;
}

/**
 * Liste mise en cache (accueil + generateStaticParams) — moins d’appels Notion répétés.
 * @returns {Promise<BlogPostSummary[]>}
 */
export async function listBlogPosts() {
  return unstable_cache(
    async () => fetchBlogPostList(),
    ["notion-blog-list"],
    { revalidate: 300, tags: ["notion-blog"] },
  )();
}

/**
 * Sans colonne Slug : une seule requête sur les brouillons publiés + recherche du slug (évite listBlogPosts complet).
 * @param {import('@notionhq/client').Client} notion
 * @param {string} dataSourceId
 * @param {import('@notionhq/client').DataSourceObjectResponse} schema
 * @param {string} slug
 */
async function findPostBySlugWithoutSlugColumn(notion, dataSourceId, schema, slug) {
  const { body } = buildDataSourceQueryBody(schema, {
    withPublishedFilter: true,
    withSort: false,
  });
  const rows = await queryDataSourceAllPages(notion, dataSourceId, body);
  for (const page of rows) {
    const s = pageToSummary(/** @type {import('@notionhq/client').PageObjectResponse} */ (page), schema);
    if (s.slug === slug) return s;
  }
  return null;
}

/**
 * Logique brute (sans cache Next) — utilisée par getPostBySlug exporté.
 * @param {string} slug
 * @returns {Promise<BlogPostSummary | null>}
 */
async function loadPostBySlug(slug) {
  const notion = getNotionClient();
  const { dataSourceId, schema } = await resolveBlogDataSource();

  const slugPropName = getSlugPropertyName(schema);
  const publishedName = getPublishedCheckboxName(schema);

  if (slugPropName) {
    /** @type {import('@notionhq/client').QueryDataSourceParameters['filter']} */
    let filter = {
      property: slugPropName,
      type: "rich_text",
      rich_text: { equals: slug },
    };
    if (publishedName) {
      filter = {
        and: [
          filter,
          {
            property: publishedName,
            type: "checkbox",
            checkbox: { equals: true },
          },
        ],
      };
    }
    const res = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter,
      page_size: 10,
    });
    const page = res.results.find(
      (p) => p.object === "page" && "properties" in p && p.properties,
    );
    if (page) {
      return pageToSummary(/** @type {import('@notionhq/client').PageObjectResponse} */ (page), schema);
    }
  }

  return findPostBySlugWithoutSlugColumn(notion, dataSourceId, schema, slug);
}

/**
 * Cache requête : métadonnées + page ne déclenchent qu’un seul aller Notion par slug.
 * `unstable_cache` : réutilisation entre requêtes (ISR).
 */
export const getPostBySlug = cache(async (slug) =>
  unstable_cache(
    async () => loadPostBySlug(slug),
    ["notion-blog-post", slug],
    { revalidate: 300, tags: ["notion-blog"] },
  )(),
);

async function listAllBlockChildren(notion, blockId) {
  const out = [];
  let cursor = undefined;
  do {
    const res = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100,
    });
    out.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return out;
}

async function attachChildren(notion, blocks) {
  await Promise.all(
    blocks.map(async (block) => {
      if ("has_children" in block && block.has_children) {
        const children = await listAllBlockChildren(notion, block.id);
        block._children = await attachChildren(notion, children);
      }
    }),
  );
  return blocks;
}

async function loadPageBlocks(pageId) {
  const notion = getNotionClient();
  const top = await listAllBlockChildren(notion, pageId);
  await attachChildren(notion, top);
  return top;
}

/**
 * Blocs de page mis en cache (contenu Notion rarement modifié en prod).
 * @param {string} pageId
 */
export const getPageBlocks = cache(async (pageId) =>
  unstable_cache(
    async () => loadPageBlocks(pageId),
    ["notion-page-blocks", pageId],
    { revalidate: 300, tags: ["notion-blog"] },
  )(),
);
