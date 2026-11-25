'use client';

import Image from "next/image";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ThemeToggle, LanguageToggle } from '@/components/ui/Toggles';
import { useLanguage } from '@/context/LanguageContext';
import FooterScene from '@/components/home/BannerScene';
import FooterRoad from '@/components/home/FooterRoad';

const BOOK_FORM = 'https://forms.gle/V8r7aFGMhThujFmJ8';

type T = ReturnType<typeof useLanguage>['t'];

function getNavLinks(t: T) {
  return [
    { href: '#home',       label: t('homepage.nav.home')     },
    { href: '#about',      label: t('homepage.nav.about')    },
    { href: '#services',   label: t('homepage.nav.services') },
    { href: '#estimation', label: t('homepage.nav.features') },
    { href: '#owner',      label: t('homepage.nav.story')    },
    { href: '#contact',    label: t('homepage.nav.contact')  },
  ];
}

function getServices(t: T) {
  return [
    { num: '01', icon: '/assets/images/service-icon1.png', fallback: '🚛', title: t('homepage.services.s1Title'), desc: t('homepage.services.s1Desc') },
    { num: '02', icon: '/assets/images/service-icon2.png', fallback: '📦', title: t('homepage.services.s2Title'), desc: t('homepage.services.s2Desc') },
    { num: '03', icon: '/assets/images/service-icon3.png', fallback: '🏎️', title: t('homepage.services.s3Title'), desc: t('homepage.services.s3Desc') },
    { num: '04', icon: '/assets/images/service-icon4.png', fallback: '⚙️', title: t('homepage.services.s4Title'), desc: t('homepage.services.s4Desc') },
    { num: '05', icon: '/assets/images/service-icon5.png', fallback: '🏠', title: t('homepage.services.s5Title'), desc: t('homepage.services.s5Desc') },
    { num: '06', icon: '/assets/images/service-icon6.png', fallback: '🚌', title: t('homepage.services.s6Title'), desc: t('homepage.services.s6Desc') },
  ];
}

function getFeatures(t: T) {
  return [
    { id: 'f1', num: `01 — ${t('homepage.features.f1Num')}`, icon: '/assets/images/feature-icon-1.png', title: t('homepage.features.f1Title'), desc: t('homepage.features.f1Desc'), href: '#contact' },
    { id: 'f2', num: `02 — ${t('homepage.features.f2Num')}`, icon: '/assets/images/feature-icon-2.png', title: t('homepage.features.f2Title'), desc: t('homepage.features.f2Desc'), href: '#contact' },
    { id: 'f3', num: `03 — ${t('homepage.features.f3Num')}`, icon: '/assets/images/feature-icon-3.png', title: t('homepage.features.f3Title'), desc: t('homepage.features.f3Desc'), href: '/auth' },
  ];
}

function getGallery(t: T) {
  return [
    { id: 'g1', src: '/assets/images/owner.jpe',      alt: 'Our CEO',             tag: t('homepage.gallery.ceo'),  name: 'ITEA3"WTCG3"' },
    { id: 'g2', src: '/assets/images/branch.jpe',     alt: 'Branch inauguration', tag: t('homepage.gallery.dept'), name: t('homepage.gallery.g2Name') },
    { id: 'g3', src: '/assets/images/TukTuk.jpe',     alt: 'TukTuk inauguration', tag: t('homepage.gallery.dept'), name: t('homepage.gallery.g3Name') },
    { id: 'g4', src: '/assets/images/car.jpe',        alt: 'Car inauguration',    tag: t('homepage.gallery.dept'), name: t('homepage.gallery.g4Name') },
    { id: 'g5', src: '/assets/images/Warehouse.jpe',  alt: 'Warehouse inventory', tag: t('homepage.gallery.dept'), name: t('homepage.gallery.g5Name') },
    { id: 'g6', src: '/assets/images/Truck.jpe',      alt: 'Truck inauguration',  tag: t('homepage.gallery.dept'), name: t('homepage.gallery.g6Name') },
  ];
}

function getCheckItems(t: T) {
  return [
    t('homepage.about.check1'),
    t('homepage.about.check2'),
    t('homepage.about.check3'),
    t('homepage.about.check4'),
    t('homepage.about.check5'),
  ];
}

const BRANCHES = [
  'Phnom Penh Branch',
  'Siem Reap Branch',
  'Battambang Branch',
  'Sihanoukville Branch',
  'Kampot Branch',
];

function ServiceIcon({ src, fallback }: { src: string; fallback: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <>{fallback}</>;
  return <img src={src} alt="" onError={() => setFailed(true)} />;
}

export default function HomePage() {
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const [backTop,    setBackTop]    = useState(false);
  const [formSent,   setFormSent]   = useState(false);
  const [sending,    setSending]    = useState(false);
  const { t }     = useLanguage();
  const pageRef = useRef<HTMLDivElement>(null);

  const NAV_LINKS = getNavLinks(t);
  const SERVICES  = getServices(t);
  const FEATURES  = getFeatures(t);
  const GALLERY   = getGallery(t);
  const CHECK_ITEMS = getCheckItems(t);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
      setBackTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const root = pageRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.12 }
    );
    root.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function closeMobileNav() { setMenuOpen(false); }

  function handleContact(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setFormSent(true);
      form.reset();
      setTimeout(() => setFormSent(false), 3000);
    }, 900);
  }

  return (
    <div className="home-page" ref={pageRef}>

      {/* HEADER */}
      <header className={`header ${scrolled ? 'scrolled' : ''}`} id="header">
        <div className="header-inner">
          <Link href="#home" className="nav-brand">
            <div className="brand-icon">
                <Image
                    src="/assets/images/logo.png"
                    alt="ITEA3 EXPRESS Logo"
                    width={35}
                    height={30}
                />
            </div>
            <div>
              <div className="brand-name">ITEA3 <span>EXPRESS</span></div>
              <div className="brand-sub">{t('homepage.platform')}</div>
            </div>
          </Link>

          <nav className="desktop-nav">
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href} className="nav-link">{l.label}</a>
            ))}
          </nav>

          <div className="header-actions">
            <div className="header-phone">
              <span className="header-phone-label">{t('homepage.callUs')}</span>
              <a href="tel:+85587327406" className="header-phone-num">087 327 406</a>
            </div>
            <Link href="/auth" className="btn btn-primary">{t('homepage.signIn')}</Link>
            <ThemeToggle />
            <LanguageToggle />
          </div>

          <button
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            aria-label="Open menu"
            onClick={() => setMenuOpen(v => !v)}
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      {/* MOBILE NAV */}
      <nav className={`mobile-nav ${menuOpen ? 'open' : ''}`}>
        {NAV_LINKS.map(l => (
          <a key={l.href} href={l.href} className="mobile-nav-link" onClick={closeMobileNav}>{l.label}</a>
        ))}
       <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <ThemeToggle />
          <LanguageToggle />
        </div>
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Link href="/auth" className="btn btn-primary btn-full" onClick={closeMobileNav}>{t('homepage.signIn')}</Link>
          <a href={BOOK_FORM} target="_blank" rel="noreferrer" className="btn btn-outline btn-full">{t('homepage.hero.bookDelivery')}</a>
        </div>
      </nav>

      <main>

        {/* HERO */}
        <section className="hero" id="home">
          <div
            className="hero-bg-img"
            style={{ backgroundImage: "url('/assets/images/bg.png')" }}
          />
          <div className="hero-overlay" />

          <div className="hero-inner container">
            <div className="hero-content">
              <div className="hero-eyebrow">
                <span className="hero-dot" />
                {t('homepage.hero.badge')}
              </div>

              <h1 className="hero-title">
                {t('homepage.hero.title1')}<br />
                <span className="hero-title-accent">{t('homepage.hero.title2')}</span>
              </h1>

              <p className="hero-desc">
                {t('homepage.hero.desc')}<br />
                <span className="hero-khmer">{t('homepage.hero.tagline')}</span>
              </p>

              <div className="hero-cta">
                <Link href="/auth" className="btn btn-primary btn-lg">{t('homepage.hero.joinUs')}</Link>
                <a href={BOOK_FORM} target="_blank" rel="noreferrer" className="btn btn-outline btn-lg">{t('homepage.hero.bookDelivery')}</a>
              </div>

              <div className="hero-stats">
                <div className="hero-stat">
                  <div className="hero-stat-num">25+</div>
                  <div className="hero-stat-lbl">{t('homepage.hero.branches')}</div>
                </div>
                <div className="hero-stat-divider" />
                <div className="hero-stat">
                  <div className="hero-stat-num">24/7</div>
                  <div className="hero-stat-lbl">{t('homepage.hero.support')}</div>
                </div>
                <div className="hero-stat-divider" />
                <div className="hero-stat">
                  <div className="hero-stat-num">100%</div>
                  <div className="hero-stat-lbl">{t('homepage.hero.onTime')}</div>
                </div>
              </div>
            </div>

            <div className="hero-pills">
              {[
                { icon: '📍', title: t('homepage.hero.pill1Title'), sub: t('homepage.hero.pill1Sub') },
                { icon: '🚚', title: t('homepage.hero.pill2Title'), sub: t('homepage.hero.pill2Sub') },
                { icon: '🔒', title: t('homepage.hero.pill3Title'), sub: t('homepage.hero.pill3Sub') },
              ].map(p => (
                <div key={p.icon} className="hero-pill">
                  <span className="hero-pill-icon">{p.icon}</span>
                  <div>
                    <div className="hero-pill-title">{p.title}</div>
                    <div className="hero-pill-sub">{p.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section className="section" id="about">
          <div className="container about-grid">
            <div className="about-img-wrap reveal">

               {/* Animated isometric scene replaces the old about-banner image */}
              <FooterScene/>
              
              <div className="about-badge">
                <div className="about-badge-num">10+</div>
                <div className="about-badge-lbl">{t('homepage.about.yearsExp')}</div>
              </div>
            </div>

            <div className="about-body reveal">
              <div className="section-label">{t('homepage.about.label')}</div>
              <h2 className="section-title">{t('homepage.about.title')}</h2>
              <p className="section-text">
                {t('homepage.about.text')} <em>{t('homepage.about.quote')}</em>
              </p>

              <ul className="check-list">
                {CHECK_ITEMS.map((item, i) => (
                  <li key={i}>
                    <span className="check-icon">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <a href="#services" className="btn btn-primary">{t('homepage.about.explore')}</a>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section className="section section-dark" id="services">
          <div className="container">
            <div className="section-label text-center" style={{ justifyContent: 'center' }}>{t('homepage.services.label')}</div>
            <h2 className="section-title text-center">{t('homepage.services.title')}</h2>
            <p className="section-text text-center" style={{ margin: '0 auto 56px' }}>
              {t('homepage.services.text')}
            </p>

            <div className="services-grid">
              {SERVICES.map(s => (
                <div key={s.num} className="service-card reveal" data-num={s.num}>
                  <div className="svc-icon">
                    <ServiceIcon src={s.icon} fallback={s.fallback} />
                  </div>
                  <h3 className="svc-title">{s.title}</h3>
                  <p className="svc-text">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="section" id="estimation">
          <div className="container">
            <div className="features-top">
              <div>
                <div className="section-label">{t('homepage.features.label')}</div>
                <h2 className="section-title">{t('homepage.features.title')}</h2>
                <p className="section-text">
                  {t('homepage.features.text')}
                </p>
              </div>
              <a href="#contact" className="btn btn-outline" style={{ whiteSpace: 'nowrap', alignSelf: 'flex-end' }}>
                {t('homepage.features.getQuote')}
              </a>
            </div>

            <div className="features-grid">
              {FEATURES.map(f => (
                <div key={f.id} className="feature-card reveal">
                  <div className="feature-num">{f.num}</div>
                  <img src={f.icon} alt="" className="feature-img" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <h3 className="feature-title">{f.title}</h3>
                  <p className="feature-text">{f.desc}</p>
                  {f.href.startsWith('/')
                    ? <Link href={f.href} className="feature-arrow">→</Link>
                    : <a href={f.href} className="feature-arrow">→</a>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* OWNER / GALLERY */}
        <section className="section section-dark" id="owner">
          <div className="container">
            <div className="section-label">{t('homepage.owner.label')}</div>
            <h2 className="section-title">
              ITEA3 <span style={{ color: 'var(--accent)' }}>(WTCG3)</span>
            </h2>
            <p className="section-text" style={{ maxWidth: 760, marginBottom: 48 }}>
              {t('homepage.owner.text')}
            </p>

            <div className="gallery-grid">
              {GALLERY.map(g => (
                <div key={g.id} className="gallery-item reveal">
                  <img
                    src={g.src}
                    alt={g.alt}
                    onError={e => { (e.target as HTMLImageElement).style.background = 'var(--bg3)'; (e.target as HTMLImageElement).removeAttribute('src'); }}
                  />
                  <div className="gallery-caption">
                    <div className="gallery-tag">{g.tag}</div>
                    <div className="gallery-name">{g.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </section>

        {/* CTA BAND */}
        <div className="cta-band">
          <div className="container cta-inner">
            <div>
              <h2 className="cta-title">{t('homepage.cta.title')}</h2>
              <p className="cta-sub">{t('homepage.cta.sub')}</p>
            </div>
            <div className="cta-actions">
              <a href={BOOK_FORM} target="_blank" rel="noreferrer" className="btn-cta-dark">{t('homepage.cta.bookNow')}</a>
              <a href="tel:+85587327406" className="btn-cta-ghost">📞 087 327 406</a>
            </div>
          </div>
        </div>

        {/* CONTACT */}
        <section className="section" id="contact">
          <div className="container">
            <div className="section-label">{t('homepage.contact.label')}</div>
            <h2 className="section-title">{t('homepage.contact.title')}</h2>

            <div className="contact-grid">
              <div className="contact-info">
                <div className="contact-item reveal">
                  <div className="contact-item-icon">
                    <img src="assets/icons/googleMaps.svg" alt="Icon Google Map" width="18" height="18" />
                  </div>
                  <div>
                    <div className="contact-item-label">{t('homepage.contact.address')}</div>
                    <div className="contact-item-val">
                      {t('homepage.contact.addressVal')}
                    </div>
                  </div>
                </div>
                <div className="contact-item reveal">
                  <div className="contact-item-icon">
                    <img src="assets/images/mobile.png" alt="Icon Phone" width="18" height="18" />
                  </div>
                  <div>
                    <div className="contact-item-label">{t('homepage.contact.phone')}</div>
                    <div className="contact-item-val">
                      <a href="tel:+85587327406">+855 87 327 406</a><br />
                      <a href="tel:+85595542956">+855 95 542 956</a><br />
                      <a href="tel:+85515318880">+855 15 318 880</a>
                    </div>
                  </div>
                </div>
                <div className="contact-item reveal">
                  <div className="contact-item-icon">
                    <img src="assets/icons/gmail.svg" alt="Icon Gmail" width="18" height="18" />
                  </div>
                  <div>
                    <div className="contact-item-label">{t('homepage.contact.email')}</div>
                    <div className="contact-item-val">
                      <a href="mailto:oddom2022@gmail.com">ITEA3@gmail.com</a>
                    </div>
                  </div>
                </div>

                <div className="social-section reveal">
                  <div className="contact-item-label" style={{ marginBottom: 14 }}>{t('homepage.contact.followUs')}</div>
                  <div className="social-row">
                    <a href="https://www.facebook.com/share/1PS8aCXgcc/?mibextid=wwXIfr" target="_blank" rel="noreferrer" className="social-btn" title="Facebook">
                      <img src="assets/icons/facebook-icon.svg" alt="Icon Facebook" width="18" height="18" />
                    </a>
                    <a href="https://www.instagram.com/oddom2022" target="_blank" rel="noreferrer" className="social-btn" title="Instagram">
                      <img src="assets/icons/instagram-icon.svg" alt="Icon Instagram" width="18" height="18"  />
                    </a>
                    <a href="https://youtube.com/@kh_empire_era" target="_blank" rel="noreferrer" className="social-btn" title="YouTube">
                      <img src="assets/icons/youtube.svg" alt="Icon Youtube" width="18" height="18" />
                    </a>
                    <a href="https://t.me/+xwsm9tXgukdhYzg1" target="_blank" rel="noreferrer" className="social-btn" title="Telegram">
                      <img src="assets/icons/telegram.svg" alt="Icon Telegram" width="18" height="18" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="contact-form-card reveal">
                <h3 className="contact-form-title">{t('homepage.contact.formTitle')}</h3>
                <form onSubmit={handleContact}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">{t('homepage.contact.yourName')}</label>
                      <input type="text" className="form-control" placeholder="Sok Dara" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">{t('homepage.contact.phoneLabel')}</label>
                      <input type="text" className="form-control" placeholder="+855 xx xxx xxxx" required />
                    </div>
                    <div className="form-group col-2">
                      <label className="form-label">{t('homepage.contact.emailLabel')}</label>
                      <input type="email" className="form-control" placeholder="you@example.com" />
                    </div>
                    <div className="form-group col-2">
                      <label className="form-label">{t('homepage.contact.messageLabel')}</label>
                      <textarea className="form-control" placeholder={t('homepage.contact.messagePlaceholder')} required rows={4} />
                    </div>
                    <div className="form-group col-2">
                      <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={sending || formSent}>
                        {formSent ? t('homepage.contact.sent') : sending ? t('homepage.contact.sending') : t('homepage.contact.send')}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">
                <div className="footer-logo-icon">
                  <Image
                    src="/assets/images/logo.png"
                    alt="ITEA3 EXPRESS Logo"
                    width={35}
                    height={30}
                />
                </div>
                <div>
                  <div className="footer-name">ITEA3 <span>EXPRESS</span></div>
                  <div className="footer-tagline">{t('homepage.footer.tagline')}</div>
                </div>
              </div>
              <p className="footer-desc">
                {t('homepage.footer.desc')}
              </p>
              <div className="footer-social">
                <a href="https://www.facebook.com/share/1PS8aCXgcc/?mibextid=wwXIfr" target="_blank" rel="noreferrer" className="social-btn" title="Facebook">
                  <img src="assets/icons/facebook-icon.svg" alt="Icon Facebook" width="18" height="18" />
                </a>
                <a href="https://www.instagram.com/oddom2022" target="_blank" rel="noreferrer" className="social-btn" title="Instagram">
                  <img src="assets/icons/instagram-icon.svg" alt="Icon Instagram" width="18" height="18"  />
                </a>
                <a href="https://youtube.com/@kh_empire_era" target="_blank" rel="noreferrer" className="social-btn" title="YouTube">
                  <img src="assets/icons/youtube.svg" alt="Icon Youtube" width="18" height="18" />
                </a>
                <a href="https://t.me/+xwsm9tXgukdhYzg1" target="_blank" rel="noreferrer" className="social-btn" title="Telegram">
                  <img src="assets/icons/telegram.svg" alt="Icon Telegram" width="18" height="18" />
                </a>
              </div>
            </div>

            <div className="footer-links">
              <div className="footer-links-title">{t('homepage.footer.quickLinks')}</div>
              <a href="#about" className="footer-link">{t('homepage.footer.aboutUs')}</a>
              <a href="#services" className="footer-link">{t('homepage.footer.servicesLink')}</a>
              <a href="#owner" className="footer-link">{t('homepage.footer.ourStory')}</a>
              <a href={BOOK_FORM} target="_blank" rel="noreferrer" className="footer-link">{t('homepage.footer.contactUs')}</a>
            </div>

            <div className="footer-links">
              <div className="footer-links-title">{t('homepage.footer.platform')}</div>
              <Link href="/auth" className="footer-link">{t('homepage.footer.trackShipment')}</Link>
              <Link href="/auth" className="footer-link">{t('homepage.footer.customerPortal')}</Link>
              <Link href="/auth" className="footer-link">{t('homepage.footer.driverPortal')}</Link>
              <a href="#" className="footer-link">{t('homepage.footer.privacyPolicy')}</a>
              <a href="#" className="footer-link">{t('homepage.footer.terms')}</a>
            </div>

            <div className="footer-links">
              <div className="footer-links-title">{t('homepage.footer.ourBranches')}</div>
              {BRANCHES.map(b => (
                <span key={b} className="footer-branch">📍 {b}</span>
              ))}
            </div>
          </div>
        </div>
        <FooterRoad>
          <p className="footer-copy">{t('homepage.footer.copyright')} <a href="#">@ITEA3 EXPRESS</a></p>
          <p className="footer-copy">+855 87 327 406 · +855 15 318 880 . +855 95 542 956 · ITEA3@gmail.com</p>
        </FooterRoad>
      </footer>

      <a href="#home" className={`back-top ${backTop ? 'visible' : ''}`} aria-label="Back to top">
        <img src="assets/images/arrows.png" alt="Icon Back To Top" width="18" height="18" />
      </a>
    </div>
  );
}