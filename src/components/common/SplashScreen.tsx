import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SplashScreen as CapacitorSplashScreen } from '@capacitor/splash-screen';
import unidwellLogo from '../../assets/unidwell-logo.png';

interface SplashScreenProps {
  onComplete?: () => void;
}

/**
 * Premium Unidwell Logo Intro Splash Screen
 * 
 * Displays the Unidwell house & roommate logo first with smooth animations,
 * then seamlessly transitions to the Sign In / Welcome page.
 */

const TOTAL_MS       = 4000;
const FADE_OUT_MS    = 3400;
const LOADING_MS     = 2000;
const SUBTITLE_MS    = 1300;
const TITLE_MS       = 800;
const LOGO_MS        = 100;

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const navigate = useNavigate();

  const [bgVisible,       setBgVisible]       = useState(false);
  const [logoVisible,     setLogoVisible]     = useState(false);
  const [titleVisible,    setTitleVisible]    = useState(false);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [loadingVisible,  setLoadingVisible]  = useState(false);
  const [exiting,         setExiting]         = useState(false);
  const [rendered,        setRendered]        = useState(true);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const handleSkip = () => {
    timers.current.forEach(clearTimeout);
    setRendered(false);
    if (onComplete) onComplete();
    else navigate('/welcome', { replace: true });
  };

  useEffect(() => {
    CapacitorSplashScreen.hide().catch(() => {});

    const after = (ms: number, fn: () => void) => {
      const t = setTimeout(fn, ms);
      timers.current.push(t);
    };

    after(0,           () => setBgVisible(true));
    after(LOGO_MS,     () => setLogoVisible(true));
    after(TITLE_MS,    () => setTitleVisible(true));
    after(SUBTITLE_MS, () => setSubtitleVisible(true));
    after(LOADING_MS,  () => setLoadingVisible(true));
    after(FADE_OUT_MS, () => setExiting(true));
    after(TOTAL_MS,    () => {
      setRendered(false);
      if (onComplete) onComplete();
      else navigate('/welcome', { replace: true });
    });

    return () => timers.current.forEach(clearTimeout);
  }, [navigate, onComplete]);

  if (!rendered) return null;

  return (
    <div
      aria-label="Unidwell App Launch"
      role="status"
      style={{
        position:   'fixed',
        inset:      0,
        zIndex:     99999,
        display:    'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        overflow:   'hidden',
        background: 'linear-gradient(135deg, #091E2A 0%, #0B3C3D 50%, #0EA5A4 100%)',
        opacity:     exiting ? 0 : bgVisible ? 1 : 0,
        transition:  exiting
          ? 'opacity 0.6s cubic-bezier(0.4,0,0.2,1)'
          : 'opacity 0.4s ease-out',
        fontFamily: "'Poppins', 'Inter', system-ui, sans-serif",
      }}
    >
      {/* ── Keyframes ── */}
      <style>{`
        @keyframes orb-float {
          0%,100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-20px) scale(1.06); }
        }
        @keyframes logo-pulse {
          0%,100% { transform: scale(1); }
          50%      { transform: scale(1.04); }
        }
        @keyframes shimmer-sweep {
          0%   { left:-70px; }
          100% { left:110%;  }
        }
      `}</style>

      {/* ── Top-right Skip to Sign In ── */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 z-20 flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white/90 font-bold text-xs rounded-full border border-white/20 backdrop-blur-md transition-all active:scale-95 shadow-lg"
      >
        <span>Continue to Sign In</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>

      {/* ── Ambient Floating Orbs ── */}
      <div style={{
        position:'absolute', top:'-10%', left:'-10%',
        width:'55vw', height:'55vw',
        background:'radial-gradient(circle, rgba(14,165,164,0.28) 0%, transparent 70%)',
        borderRadius:'50%',
        animation:'orb-float 6s ease-in-out infinite',
        pointerEvents:'none',
      }} />
      <div style={{
        position:'absolute', bottom:'-12%', right:'-8%',
        width:'50vw', height:'50vw',
        background:'radial-gradient(circle, rgba(37,99,235,0.22) 0%, transparent 70%)',
        borderRadius:'50%',
        animation:'orb-float 8s ease-in-out infinite reverse',
        pointerEvents:'none',
      }} />

      {/* ── Center Content Container ── */}
      <div style={{
        position:'relative', zIndex:10,
        display:'flex', flexDirection:'column',
        alignItems:'center', textCenter: 'center',
        padding:'0 24px',
      }}>

        {/* ── Unidwell Logo Card ── */}
        <div style={{
          position:'relative',
          marginBottom:'28px',
          opacity:   logoVisible ? 1 : 0,
          transform: logoVisible ? 'scale(1.05)' : 'scale(0.55)',
          transition:'opacity 0.6s ease-out, transform 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}>

          {/* Outer Ring */}
          <div style={{
            position:'absolute', inset:'-16px',
            borderRadius:'42px',
            border:'1.5px solid rgba(255,255,255,0.22)',
            opacity:   logoVisible ? 1 : 0,
            transition:'opacity 0.8s ease 0.4s',
            pointerEvents:'none',
          }} />

          {/* Logo Glow */}
          <div style={{
            position:'absolute', inset:'-12px',
            borderRadius:'36px',
            background:'radial-gradient(circle, rgba(14,165,164,0.65) 0%, transparent 70%)',
            filter:'blur(24px)',
            opacity: logoVisible ? 0.85 : 0,
            transition:'opacity 0.8s ease 0.3s',
            pointerEvents:'none',
          }} />

          {/* Unidwell App Logo Image */}
          <div style={{
            padding:'10px',
            borderRadius:'32px',
            background:'rgba(255,255,255,0.08)',
            backdropFilter:'blur(16px)',
            border:'1px solid rgba(255,255,255,0.25)',
            boxShadow:'0 20px 50px rgba(0,0,0,0.3)',
          }}>
            <img
              src={unidwellLogo}
              alt="Unidwell Logo"
              style={{
                width:'clamp(140px, 36vw, 180px)',
                height:'clamp(140px, 36vw, 180px)',
                objectFit:'cover',
                borderRadius:'24px',
                display:'block',
              }}
            />
          </div>
        </div>

        {/* ── Brand Title ── */}
        <div style={{
          opacity:   titleVisible ? 1 : 0,
          transform: titleVisible ? 'translateY(0)' : 'translateY(18px)',
          transition:'opacity 0.5s ease-out, transform 0.5s ease-out',
          marginBottom:'8px',
        }}>
          <h1 style={{
            margin:0,
            fontSize:'clamp(36px, 5vw, 52px)',
            fontWeight:900,
            color:'#ffffff',
            letterSpacing:'-0.03em',
            lineHeight:1,
            textAlign:'center',
          }}>
            Unidwell
          </h1>
        </div>

        {/* ── Tagline ── */}
        <div style={{
          opacity:   subtitleVisible ? 1 : 0,
          transform: subtitleVisible ? 'translateY(0)' : 'translateY(12px)',
          transition:'opacity 0.5s ease-out, transform 0.5s ease-out',
          marginBottom:'36px',
        }}>
          <p style={{
            margin:0,
            fontSize:'clamp(13px, 2vw, 16px)',
            fontWeight:600,
            color:'rgba(255,255,255,0.75)',
            letterSpacing:'0.06em',
            textTransform:'uppercase',
            textAlign:'center',
          }}>
            STAY TOGETHER. LIVE BETTER.
          </p>
        </div>

        {/* ── Loading Progress Bar ── */}
        <div style={{
          opacity:   loadingVisible ? 1 : 0,
          transform: loadingVisible ? 'scaleX(1)' : 'scaleX(0)',
          transition:'opacity 0.4s ease-out, transform 0.4s ease-out',
          width:'180px',
        }}>
          <div style={{
            width:'100%', height:'4px',
            background:'rgba(255,255,255,0.15)',
            borderRadius:'999px',
            overflow:'hidden',
            position:'relative',
          }}>
            <div style={{
              position:'absolute', top:0, left:0,
              height:'100%',
              width: loadingVisible ? '100%' : '0%',
              borderRadius:'999px',
              background:'linear-gradient(90deg, #0EA5A4, #22C55E, #2563EB)',
              transition: loadingVisible ? 'width 1.2s ease-out 0.05s' : 'none',
            }} />
          </div>
        </div>

      </div>
    </div>
  );
}
