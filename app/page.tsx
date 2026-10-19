import { BlogSectionSkeleton } from "@/components/home-skeletons";
import { AboutSection } from "@/components/sections/about-section";
import { BlogSection } from "@/components/sections/blog-section";
import { ClosingCtaSection } from "@/components/sections/closing-cta-section";
import { FaqSection } from "@/components/sections/faq-section";
import { HeroSection } from "@/components/sections/hero-section";
import { ProcessSection } from "@/components/sections/process-section";
import { ServicesSection } from "@/components/sections/services-section";
import { Suspense } from "react";

/** ISR aligné sur le cache Notion (liste blog). */
export const revalidate = 300;

export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <Suspense fallback={<BlogSectionSkeleton />}>
        <BlogSection />
      </Suspense>
      <ProcessSection />
      <FaqSection />
      <ClosingCtaSection />
    </>
  );
}
