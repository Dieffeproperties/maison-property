'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import HairlineDivider from './ui/HairlineDivider';
import ScrollReveal from './ui/ScrollReveal';

type Status = 'idle' | 'sending' | 'success' | 'error';

export default function Contact() {
  const t = useTranslations('contact');
  const tf = useTranslations('contact.form');
  const td = useTranslations('contact.details');

  const [status, setStatus] = useState<Status>('idle');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');

    const form = e.currentTarget;
    const data = new FormData(form);
    const name = (data.get('name') as string | null) ?? '';
    const email = (data.get('email') as string | null) ?? '';
    const phone = (data.get('phone') as string | null) ?? '';
    const property = (data.get('property') as string | null) ?? '';
    const message = (data.get('message') as string | null) ?? '';

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, property, message }),
      });
      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  const inputClass = `
    w-full bg-transparent border-b border-taupe/35 py-3.5 px-0
    font-light text-ink placeholder:text-mist/60
    focus:outline-none focus:border-bronze
    transition-colors duration-200
    text-sm
  `;

  const labelClass = `block eyebrow text-mist mb-2`;

  return (
    <section id="contact" className="bg-ivory py-24 md:py-36 px-6 md:px-10 lg:px-16">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20">

          {/* Left: heading */}
          <div className="lg:col-span-4 xl:col-span-3">
            <ScrollReveal>
              <p className="eyebrow text-bronze mb-8">{t('eyebrow')}</p>
            </ScrollReveal>

            <ScrollReveal delay={0.08}>
              <h2
                className="font-display font-light text-ink leading-[1.1] mb-8 md:mb-10"
                style={{ fontSize: 'clamp(2rem, 3.2vw, 2.8rem)' }}
              >
                {t('title_before')}{' '}
                <em className="italic">{t('title_italic')}</em>
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={0.14}>
              <HairlineDivider className="w-8 mb-8 opacity-50" />
              <p
                className="font-light text-mist leading-relaxed mb-12"
                style={{ fontSize: '0.9375rem', lineHeight: 1.85 }}
              >
                {t('subtitle')}
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <p className="eyebrow text-mist mb-4">{td('label')}</p>
              <a
                href={`mailto:${td('email')}`}
                className="font-display italic text-bronze hover:text-mocha transition-colors duration-200 block mb-2"
                style={{ fontSize: '1.05rem' }}
              >
                {td('email')}
              </a>
              <p
                className="font-light text-mist"
                style={{ fontSize: '0.875rem' }}
              >
                {td('phone')}
              </p>
            </ScrollReveal>
          </div>

          {/* Right: form */}
          <div className="lg:col-span-8 xl:col-span-9">
            <ScrollReveal delay={0.1}>
              {status === 'success' ? (
                <div className="flex flex-col items-start py-20">
                  <div className="hairline w-8 mb-8" />
                  <p
                    className="font-display font-light italic text-ink"
                    style={{ fontSize: 'clamp(1.3rem, 2vw, 1.75rem)' }}
                  >
                    {tf('success')}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8 mb-10">
                    {/* Name */}
                    <div>
                      <label htmlFor="name" className={labelClass}>{tf('name_label')}</label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        placeholder={tf('name_placeholder')}
                        className={inputClass}
                        autoComplete="name"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className={labelClass}>{tf('email_label')}</label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder={tf('email_placeholder')}
                        className={inputClass}
                        autoComplete="email"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label htmlFor="phone" className={labelClass}>{tf('phone_label')}</label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder={tf('phone_placeholder')}
                        className={inputClass}
                        autoComplete="tel"
                      />
                    </div>

                    {/* Property location */}
                    <div>
                      <label htmlFor="property" className={labelClass}>{tf('property_label')}</label>
                      <input
                        id="property"
                        name="property"
                        type="text"
                        placeholder={tf('property_placeholder')}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div className="mb-12">
                    <label htmlFor="message" className={labelClass}>{tf('message_label')}</label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      placeholder={tf('message_placeholder')}
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  {/* Submit */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                    <button
                      type="submit"
                      disabled={status === 'sending'}
                      className="
                        eyebrow text-ink border border-taupe/40 px-8 py-3.5 cursor-pointer
                        hover:bg-sand hover:border-taupe/60 disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all duration-300
                      "
                    >
                      {status === 'sending' ? tf('sending') : tf('submit')}
                    </button>

                    <p className="text-xs text-mist/60 font-light">{tf('note')}</p>
                  </div>

                  {status === 'error' && (
                    <p className="mt-4 text-sm text-mist font-light" role="alert">{tf('error')}</p>
                  )}
                </form>
              )}
            </ScrollReveal>
          </div>

        </div>
      </div>
    </section>
  );
}
