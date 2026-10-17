import {
  BlogSectionSkeleton,
  ContactSectionSkeleton,
} from "@/components/home-skeletons";
import { BlogSection } from "@/components/sections/blog-section";
import { HeroSection } from "@/components/sections/hero-section";
import { ServicesSection } from "@/components/sections/services-section";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const ContactSection = dynamic(
  () =>
    import("@/components/sections/contact-section").then((m) => ({
      default: m.ContactSection,
    })),
  {
    loading: () => <ContactSectionSkeleton />,
    ssr: true,
  },
);

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
      <ContactSection />
    </>
  );
}
