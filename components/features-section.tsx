"use client";

import React from 'react';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { Star, Camera, TrendingUp, Users } from 'lucide-react';

const features = [
    {
        icon: Star,
        title: "Avis Authentiques",
        description: "Obtenez de véritables avis vérifiés de vrais testeurs qui utilisent réellement vos produits. Construisez la confiance et la crédibilité sur Amazon, Shopify et toutes les plateformes majeures."
    },
    {
        icon: Camera,
        title: "Contenu Généré par les Utilisateurs",
        description: "Recevez des photos et vidéos de haute qualité de vos testeurs. Contenu parfait pour vos pages produits, publicités sur les réseaux sociaux et campagnes marketing."
    },
    {
        icon: TrendingUp,
        title: "Boostez vos Classements",
        description: "Améliorez votre visibilité dans les recherches et le classement de vos produits avec des avis authentiques et cohérents. Regardez vos produits grimper en haut des résultats de recherche."
    },
    {
        icon: Users,
        title: "Réseau de Vrais Testeurs",
        description: "Accédez à des milliers de testeurs vérifiés désireux d'essayer de nouveaux produits. Ils testent gratuitement en échange d'avis honnêtes et de contenu UGC."
    }
];

export default function FeaturesSection() {
    return (
        <section className="bg-background py-24 md:py-32">
            <div className="mx-auto max-w-7xl px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        Comment fonctionne Super Try
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Tout ce dont vous avez besoin pour booster le classement de vos produits et augmenter vos ventes avec des avis et du contenu authentiques
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group relative rounded-2xl border bg-card p-8 transition-all duration-300 hover:shadow-lg"
                        >
                            <GlowingEffect
                                disabled={false}
                                proximity={200}
                                blur={10}
                                spread={30}
                                movementDuration={1.5}
                                borderWidth={1.5}
                            />

                            <div className="relative z-10">
                                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                                    <feature.icon className="h-6 w-6 text-primary" />
                                </div>

                                <h3 className="text-2xl font-semibold mb-3">
                                    {feature.title}
                                </h3>

                                <p className="text-muted-foreground leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
