import { HeroHeader } from "@/components/header";
import HeroSection from "@/components/hero-section";
import FeaturesSection from "@/components/features-section";
import ProductImpact from "@/components/product-impact";
import TestimonialsSection from "@/components/testimonials-section";
import { Footer } from "@/components/blocks/footer-section";

export default function Home() {
  return (
    <>
      <HeroHeader />
      <main className="overflow-hidden">
        <HeroSection />
        <FeaturesSection />
        <ProductImpact />
        <TestimonialsSection />
      </main>
      <Footer />
    </>
  );
}
