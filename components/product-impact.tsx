'use client';

import { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  TrendingUp,
  Users,
  ChevronRight,
  ShoppingCart,
  Eye,
  BarChart3,
  ArrowUpRight,
  LucideIcon,
} from 'lucide-react';

// =========================================
// 1. CONFIGURATION & DATA TYPES
// =========================================

export type ProductId = 'before' | 'after';

export interface FeatureMetric {
  label: string;
  value: number; // 0-100
  icon: LucideIcon;
}

export interface ProductData {
  id: ProductId;
  label: string;
  title: string;
  description: string;
  image: string;
  colors: {
    gradient: string;
    glow: string;
    ring: string;
  };
  stats: {
    status: string;
    improvement: string;
  };
  features: FeatureMetric[];
}

// Default Data (Easy to Modify Here)
const PRODUCT_DATA: Record<ProductId, ProductData> = {
  before: {
    id: 'before',
    label: 'Avant',
    title: 'Commerce Classique',
    description: 'Ventes limitées par l\'imagination. Les clients ne peuvent voir qu\'une image statique du produit, sans comprendre sa vraie valeur.',
    image: 'https://ik.imagekit.io/kqmrslzuq/SOUND/left-earbud.png',
    colors: {
      gradient: 'from-blue-600 to-indigo-900',
      glow: 'bg-blue-500',
      ring: 'border-l-blue-500/50',
    },
    stats: { status: 'Standard', improvement: '' },
    features: [
      { label: 'Engagement', value: 35, icon: Eye },
      { label: 'Conversion', value: 42, icon: ShoppingCart },
      { label: 'Nombre d\'avis', value: 28, icon: Users },
    ],
  },
  after: {
    id: 'after',
    label: 'Avec Super Try',
    title: 'Expérience Immersive',
    description: 'Vos clients peuvent essayer vos produits en AR avant d\'acheter. Confiance maximale, retours minimisés, ventes explosives.',
    image: 'https://ik.imagekit.io/kqmrslzuq/SOUND/right-earbud.png',
    colors: {
      gradient: 'from-emerald-600 to-teal-900',
      glow: 'bg-emerald-500',
      ring: 'border-r-emerald-500/50',
    },
    stats: { status: 'Optimisé', improvement: '' },
    features: [
      { label: 'Engagement', value: 94, icon: Eye },
      { label: 'Conversion', value: 88, icon: ShoppingCart },
      { label: 'Nombre d\'avis', value: 92, icon: Users },
    ],
  },
};

// =========================================
// 2. ANIMATION VARIANTS
// =========================================

const ANIMATIONS = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 },
    },
  },
  item: {
    hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { type: 'spring', stiffness: 100, damping: 20 },
    },
    exit: { opacity: 0, y: -10, filter: 'blur(5px)' },
  },
  image: (isBefore: boolean): Variants => ({
    initial: {
      opacity: 0,
      scale: 1.5,
      filter: 'blur(15px)',
      rotate: isBefore ? -30 : 30,
      x: isBefore ? -80 : 80,
    },
    animate: {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      rotate: 0,
      x: 0,
      transition: { type: 'spring', stiffness: 260, damping: 20 },
    },
    exit: {
      opacity: 0,
      scale: 0.6,
      filter: 'blur(20px)',
      transition: { duration: 0.25 },
    },
  }),
};

// =========================================
// 3. SUB-COMPONENTS
// =========================================

const BackgroundGradient = ({ isBefore }: { isBefore: boolean }) => (
  <div className="absolute inset-0 pointer-events-none opacity-50 dark:opacity-100">
    <motion.div
      animate={{
        background: isBefore
          ? 'radial-gradient(circle at 0% 50%, rgba(59, 130, 246, 0.15), transparent 50%)'
          : 'radial-gradient(circle at 100% 50%, rgba(16, 185, 129, 0.15), transparent 50%)',
      }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-0"
    />
  </div>
);

const ProductVisual = ({ data, isBefore }: { data: ProductData; isBefore: boolean }) => (
  <motion.div layout="position" className="relative group shrink-0">
    {/* Animated Rings */}
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      className={`absolute inset-[-20%] rounded-full border border-dashed border-white/10 ${data.colors.ring}`}
    />
    <motion.div
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      className={`absolute inset-0 rounded-full bg-gradient-to-br ${data.colors.gradient} blur-2xl opacity-40`}
    />

    {/* Image Container */}
    <div className="relative h-80 w-80 md:h-[450px] md:w-[450px] rounded-full border border-border shadow-2xl flex items-center justify-center overflow-hidden bg-muted/20 backdrop-blur-sm">
      <motion.div
        animate={{ y: [-10, 10, -10] }}
        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        className="relative z-10 w-full h-full flex items-center justify-center"
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={data.id}
            src={data.image}
            alt={`${data.title}`}
            variants={ANIMATIONS.image(isBefore)}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-4"
            draggable={false}
          />
        </AnimatePresence>
      </motion.div>
    </div>

    {/* Status Label */}
    <motion.div
      layout="position"
      className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
    >
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground bg-card/80 px-4 py-2 rounded-full border border-border backdrop-blur">
        <span className={`h-1.5 w-1.5 rounded-full ${data.colors.glow} animate-pulse`} />
        {data.stats.status}
      </div>
    </motion.div>
  </motion.div>
);

const ProductDetails = ({ data, isBefore }: { data: ProductData; isBefore: boolean }) => {
  const alignClass = isBefore ? 'items-start text-left' : 'items-end text-right';
  const flexDirClass = isBefore ? 'flex-row' : 'flex-row-reverse';
  const barColorClass = isBefore ? 'left-0 bg-blue-500' : 'right-0 bg-emerald-500';

  return (
    <motion.div
      variants={ANIMATIONS.container}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`flex flex-col ${alignClass}`}
    >
      <motion.h2 variants={ANIMATIONS.item} className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">
        {data.label}
      </motion.h2>
      <motion.h1 variants={ANIMATIONS.item} className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
        {data.title}
      </motion.h1>
      <motion.p variants={ANIMATIONS.item} className={`text-muted-foreground mb-8 max-w-sm leading-relaxed ${isBefore ? 'mr-auto' : 'ml-auto'}`}>
        {data.description}
      </motion.p>

      {/* Feature Grid */}
      <motion.div variants={ANIMATIONS.item} className="w-full space-y-6 bg-card/40 p-6 rounded-2xl border border-border backdrop-blur-sm">
        {data.features.map((feature, idx) => (
          <div key={feature.label} className="group">
            <div className={`flex items-center justify-between mb-3 text-sm ${flexDirClass}`}>
              <div className={`flex items-center gap-2 ${feature.value > 50 ? 'text-foreground' : 'text-muted-foreground'}`}>
                <feature.icon size={16} /> <span>{feature.label}</span>
              </div>
              <span className="font-mono text-xs text-muted-foreground">{feature.value}%</span>
            </div>
            <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${feature.value}%` }}
                transition={{ duration: 1, delay: 0.4 + idx * 0.15 }}
                className={`absolute top-0 bottom-0 ${barColorClass} opacity-80`}
              />
            </div>
          </div>
        ))}
      </motion.div>

      {/* Improvement */}
      {data.stats.improvement && (
        <motion.div variants={ANIMATIONS.item} className={`mt-6 flex items-center gap-3 ${isBefore ? 'text-blue-400' : 'text-emerald-400'} ${flexDirClass}`}>
          <ArrowUpRight size={16} />
          <span className="text-sm font-medium">{data.stats.improvement} de ventes</span>
        </motion.div>
      )}
    </motion.div>
  );
};

const Switcher = ({
  activeId,
  onToggle
}: {
  activeId: ProductId;
  onToggle: (id: ProductId) => void
}) => {
  const options = Object.values(PRODUCT_DATA).map(p => ({ id: p.id, label: p.label }));

  return (
    <div className="absolute bottom-12 inset-x-0 flex justify-center z-50 pointer-events-none">
      <motion.div layout className="pointer-events-auto flex items-center gap-1 p-1.5 rounded-full bg-card/80 backdrop-blur-2xl border border-border shadow-lg">
        {options.map((opt) => (
          <motion.button
            key={opt.id}
            onClick={() => onToggle(opt.id)}
            whileTap={{ scale: 0.96 }}
            className="relative px-6 h-12 rounded-full flex items-center justify-center text-sm font-medium focus:outline-none"
          >
            {activeId === opt.id && (
              <motion.div
                layoutId="island-surface"
                className="absolute inset-0 rounded-full bg-primary/10 dark:bg-primary/20 shadow-inner"
                transition={{ type: 'spring', stiffness: 220, damping: 22 }}
              />
            )}
            <span className={`relative z-10 transition-colors duration-300 whitespace-nowrap ${activeId === opt.id ? 'text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'}`}>
              {opt.label}
            </span>
            {activeId === opt.id && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute -bottom-1 h-1 w-6 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent"
              />
            )}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};

// =========================================
// 4. MAIN COMPONENT
// =========================================

export default function ProductImpact() {
  const [activeSide, setActiveSide] = useState<ProductId>('before');

  const currentData = PRODUCT_DATA[activeSide];
  const isBefore = activeSide === 'before';

  return (
    <section className="relative min-h-screen w-full bg-background text-foreground overflow-hidden py-24 md:py-32 flex flex-col items-center justify-center">

      <BackgroundGradient isBefore={isBefore} />

      {/* Section Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center mb-16 px-6"
      >
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          L&apos;impact de Super Try
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Découvrez comment la réalité augmentée transforme radicalement l&apos;expérience d&apos;achat
        </p>
      </motion.div>

      <main className="relative z-10 w-full px-6 py-8 flex flex-col justify-center max-w-7xl mx-auto">
        <motion.div
          layout
          transition={{ type: 'spring', bounce: 0, duration: 0.9 }}
          className={`flex flex-col md:flex-row items-center justify-center gap-12 md:gap-32 lg:gap-48 w-full ${
            isBefore ? 'md:flex-row' : 'md:flex-row-reverse'
          }`}
        >
          {/* Left Column: Visuals */}
          <ProductVisual data={currentData} isBefore={isBefore} />

          {/* Right Column: Content */}
          <motion.div layout="position" className="w-full max-w-md">
            <AnimatePresence mode="wait">
              <ProductDetails
                key={activeSide}
                data={currentData}
                isBefore={isBefore}
              />
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </main>

      <Switcher activeId={activeSide} onToggle={setActiveSide} />
    </section>
  );
}
