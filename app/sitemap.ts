import type { MetadataRoute } from "next";
import { isNotionConfigured, listBlogPosts } from "@/lib/notion";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://jennifervoyages.fr";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/mentions-legales`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  if (!isNotionConfigured()) {
    return staticRoutes;
  }

  try {
    const posts = await listBlogPosts();
    const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: post.publishedAt
        ? new Date(post.publishedAt)
        : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
    return [...staticRoutes, ...blogRoutes];
  } catch {
    return staticRoutes;
  }
}
