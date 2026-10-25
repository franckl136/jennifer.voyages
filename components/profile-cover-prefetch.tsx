import { CoverWarmup } from "@/components/blog-card-link";
import { getPostBySlug, isNotionConfigured } from "@/lib/notion";
import { PROFILE_POST_SLUG } from "@/lib/site";

/** Charge la couverture du portrait pendant la lecture de l’accueil. */
export async function ProfileCoverPrefetch() {
  if (!isNotionConfigured()) return null;

  try {
    const post = await getPostBySlug(PROFILE_POST_SLUG);
    if (!post?.coverUrl) return null;
    return <CoverWarmup src={post.coverUrl} />;
  } catch {
    return null;
  }
}
