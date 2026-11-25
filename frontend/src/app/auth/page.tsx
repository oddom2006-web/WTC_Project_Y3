'use client';
// src/app/auth/page.tsx
import { useState }    from 'react';
import { useRouter }   from 'next/navigation';
import { useAuth }     from '@/context/AuthContext';
import toast           from 'react-hot-toast';
import styles          from './auth.module.css';
import Image           from 'next/image';
import { ThemeToggle, LanguageToggle } from '@/components/ui/Toggles';
import { useLanguage } from '@/context/LanguageContext'; 

type Tab = 'login' | 'register';

export default function AuthPage() {
  const { login, register, user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [tab,     setTab]     = useState<Tab>('login');
  const [loading, setLoading] = useState(false);

  // Already logged in → redirect
  if (user) {
    const map: Record<string, string> = { admin:'/admin', driver:'/driver', customer:'/customer', employee:'/employee' };
    router.replace(map[user.role] ?? '/auth');
    return null;
  }

  /* ── LOGIN ── */
  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd    = new FormData(e.currentTarget);
    const email = fd.get('email') as string;
    const pw    = fd.get('password') as string;
    setLoading(true);
    try {
      await login(email, pw);
      toast.success('Welcome back!');
      // redirect handled by useAuth onAuthStateChanged + root page
    } catch (err: any) {
      // The API already returns a friendly message ("Invalid credentials.")
      toast.error(err.message ?? 'Login failed');
    } finally { setLoading(false); }
  }

  /* ── REGISTER ── */
  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd  = new FormData(e.currentTarget);
    const name  = fd.get('name')     as string;
    const email = fd.get('email')    as string;
    const phone = fd.get('phone')    as string;
    const pw    = fd.get('password') as string;
    if (!name)         { toast.error('Please enter your name.'); return; }
    if (pw.length < 6) { toast.error('Password needs 6+ characters.'); return; }
    setLoading(true);
    try {
      await register(name, email, phone, pw);
      toast.success('Account created!');
    } catch (err: any) {
      // Laravel validation already returns friendly text, e.g. "The email has
      // already been taken."
      toast.error(err.message ?? 'Registration failed');
    } finally { setLoading(false); }
  }

  return (
    <div className={styles.page}>
      {/* background glows */}
      <div className={styles.glow1} />
      <div className={styles.glow2} />

      <div className={styles.card}>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, padding: '16px 24px' }}>
          <ThemeToggle />
          <LanguageToggle />
        </div>

        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <Image
              src="/assets/images/logo.png"
              alt="ITEA3 EXPRESS Logo"
              width={35}
              height={30}
            />
          </div>

          <div>
            <div className={styles.logoName}>ITEA3 EXPRESS</div>
            <div className={styles.logoSub}>{t('auth.platform')}</div>
          </div>
        </div>

        {/* Tabs */}

        <div className={styles.tabs}>
          <button className={`${styles.tab} ${tab==='login'    ? styles.tabActive : ''}`} onClick={() => setTab('login')}>{t('auth.login')}</button>
          <button className={`${styles.tab} ${tab==='register' ? styles.tabActive : ''}`} onClick={() => setTab('register')}>{t('auth.register')}</button>
        </div>

        {/* LOGIN */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.field}>
              <label>{t('auth.email')}</label>
              <input name="email" type="email" placeholder="you@example.com" required />
            </div>
            <div className={styles.field}>
              <label>{t('auth.password')}</label>
              <input name="password" type="password" placeholder="••••••••" required />
            </div>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? t('auth.loginBtnLoading') : t('auth.loginBtn')}
            </button>

            {/* Demo accounts */}
            <div className={styles.demoBox}>
              <div className={styles.demoTitle}>Demo Accounts</div>
              {[
                { role:'Admin',    email:'admin@itea3express.com',  pw:'admin123'  },
                { role:'Driver1',   email:'driver@itea3express.com', pw:'driver123' },
                { role:'Customer1', email:'nii@gmail.com',     pw:'cust123'   },
                { role:'Customer2', email:'pich.employee@itea3express.com',     pw:'Pich@123'   },
              ].map(d => (
                <div key={d.role} className={styles.demoRow}>
                  <span className={`${styles.demoRole} ${styles['demoRole'+d.role]}`}>{d.role}</span>
                  <span className={styles.demoCreds}>{d.email}</span>
                  <button
                    type="button"
                    className={styles.demoFill}
                    onClick={() => {
                      const f = document.querySelector<HTMLInputElement>('input[name=email]');
                      const p = document.querySelector<HTMLInputElement>('input[name=password]');
                      if (f) f.value = d.email;
                      if (p) p.value = d.pw;
                    }}
                  >Fill</button>
                </div>
              ))}
            </div> 
          </form>
        )}

        {/* REGISTER */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className={styles.form}>
            <div className={styles.field}>
              <label>{t('auth.name')}</label>
              <input name="name" type="text" placeholder={t('auth.fullNamePlaceholder')} required />
            </div>
            <div className={styles.field}>
              <label>{t('auth.email')}</label>
              <input name="email" type="email" placeholder={t('auth.emailPlaceholder')} required />
            </div>
            <div className={styles.field}>
              <label>{t('auth.phone')}</label>
              <input name="phone" type="text" placeholder={t('auth.phonePlaceholder')} />
            </div>
            <div className={styles.field}>
              <label>{t('auth.password')}</label>
              <input name="password" type="password" placeholder={t('auth.passwordPlaceholder')} required />
            </div>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? t('auth.registerBtnLoading') : t('auth.registerBtn')}
            </button>
            <p className={styles.hint}>{t('auth.welcome')}</p>
          </form>
        )}
      </div>
    </div>
  );
}