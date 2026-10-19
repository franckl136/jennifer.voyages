import { BlogSectionSkeleton } from "@/components/home-skeletons";
import { BlogSection } from "@/components/sections/blog-section";
import { HeroSection } from "@/components/sections/hero-section";
import { ServicesSection } from "@/components/sections/services-section";
import { Suspense } from "react";

/** ISR aligné sur le cache Notion (liste blog). */
export const revalidate = 300;

export default function Home() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <Suspense fallback={<BlogSectionSkeleton />}>
        <BlogSection />
      </Suspense>
    </>
  );
}
