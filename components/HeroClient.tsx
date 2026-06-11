'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

interface HeroClientProps {
  eyebrow: string;
  titleBefore: string;
  titleItalic: string;
  titleAfter: string;
  subtitle: string;
  cta: string;
  scrollLabel: string;
}

const ease = [0.22, 1, 0.36, 1] as const;

export default function HeroClient({
  eyebrow,
  titleBefore,
  titleItalic,
  titleAfter,
  subtitle,
  cta,
  scrollLabel,
}: HeroClientProps) {
  const reduced = useReducedMotion();

  const stagger = (i: number) => ({
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduced ? 0.2 : 0.9, delay: reduced ? 0.1 : 0.2 + i * 0.12, ease },
  });

  function scrollToContact() {
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="max-w-3xl">
      {/* Eyebrow */}
      <motion.p {...stagger(0)} className="eyebrow text-cream/70 mb-7 md:mb-9">
        {eyebrow}
      </motion.p>

      {/* Title */}
      <motion.h1
        {...stagger(1)}
        className="font-display font-light leading-[1.08] text-cream mb-8 md:mb-10"
        style={{
          fontSize: 'clamp(2.8rem, 6.5vw, 5.2rem)',
          textShadow: '0 2px 24px rgba(0,0,0,0.45), 0 1px 6px rgba(0,0,0,0.30)',
        }}
      >
        {titleBefore}{' '}
        <em className="italic" style={{ fontStyle: 'italic', fontWeight: 300 }}>
          {titleItalic}
        </em>
        <br />
        {titleAfter}
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        {...stagger(2)}
        className="font-light text-cream/80 leading-relaxed max-w-xl mb-12 md:mb-14"
        style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.05rem)', fontFamily: 'var(--font-jost)' }}
      >
        {subtitle}
      </motion.p>

      {/* CTA */}
      <motion.div {...stagger(3)}>
        <button
          onClick={scrollToContact}
          className="
            eyebrow text-cream border border-cream/30 px-7 py-3.5 cursor-pointer
            hover:bg-cream/10 hover:border-cream/50 transition-all duration-300
          "
          aria-label={cta}
        >
          {cta}
        </button>
      </motion.div>
    </div>
  );
}
