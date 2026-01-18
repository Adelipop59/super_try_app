'use client';

import { TestimonialsSection as TestimonialsSectionUI } from "@/components/blocks/testimonials-with-marquee";
import { testimonialsData } from "@/lib/testimonials-data";

export default function TestimonialsSection() {
  return (
    <TestimonialsSectionUI
      title="Adoré par les vendeurs e-commerce du monde entier"
      description="Rejoignez des milliers de vendeurs à succès qui ont boosté leurs classements et leurs ventes avec des avis authentiques et du contenu UGC"
      testimonials={testimonialsData}
    />
  );
}
