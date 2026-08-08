import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  GraduationCap, 
  ShieldCheck, 
  MapPin, 
  CheckCircle2,
  Users,
  Zap,
  MessageSquare
} from 'lucide-react';
import unidwellLogo from '../assets/unidwell-logo.png';

export default function AuthLayout() {
  const featureCards = [
    {
      icon: Home,
      title: 'Verified Properties',
      desc: 'Every listing verified before publishing.',
      color: 'text-amber-300 bg-amber-400/15 border-amber-300/25',
    },
    {
      icon: GraduationCap,
      title: 'Student Community',
      desc: 'Connect with verified college students.',
      color: 'text-blue-300 bg-blue-400/15 border-blue-300/25',
    },
    {
      icon: ShieldCheck,
      title: 'Secure Verification',
      desc: 'Owner Aadhaar verification & verified student accounts.',
      color: 'text-emerald-300 bg-emerald-400/15 border-emerald-300/25',
    },
    {
      icon: MapPin,
      title: 'Smart Nearby Search',
      desc: 'Find accommodation near your selected college.',
      color: 'text-teal-300 bg-teal-400/15 border-teal-300/25',
    },
  ];

  const chips = [
    { icon: ShieldCheck, label: 'Verified Owners' },
    { icon: Users, label: 'Student Community' },
    { icon: Zap, label: 'Zero Brokerage' },
    { icon: MessageSquare, label: 'Instant Visit Requests' },
    { icon: MapPin, label: 'Smart Roommate Finder' },
  ];

  const statistics = [
    { value: '10,000+', label: 'Students' },
    { value: '2,500+', label: 'Properties' },
    { value: '300+',   label: 'Colleges' },
    { value: '100%',   label: 'Verified Owners' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-5 lg:p-8" style={{ background: '#0F172A' }}>
      <div className="w-full max-w-[1300px] bg-white rounded-[28px] overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 min-h-[740px]">

        {/* ══════════════ LEFT HERO PANEL ══════════════ */}
        <div
          className="hidden lg:flex lg:col-span-6 xl:col-span-5 text-white p-8 xl:p-10 flex-col justify-between relative overflow-hidden select-none"
          style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 52%, #0EA5A4 100%)' }}
        >
          {/* Animated Background Icons */}
          <motion.div
            animate={{ y: [0, -14, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-5 right-5 text-white/8 pointer-events-none"
          >
            <Home className="w-24 h-24" />
          </motion.div>
          <motion.div
            animate={{ y: [0, 12, 0], rotate: [0, -8, 0] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
            className="absolute top-2/5 left-3 text-teal-300/10 pointer-events-none"
          >
            <GraduationCap className="w-20 h-20" />
          </motion.div>
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [0, 8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
            className="absolute bottom-1/3 right-3 text-amber-300/10 pointer-events-none"
          >
            <Home className="w-16 h-16" />
          </motion.div>
          <motion.div
            animate={{ y: [0, 10, 0], rotate: [0, -6, 0] }}
            transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut', delay: 1.8 }}
            className="absolute bottom-20 left-5 text-blue-300/10 pointer-events-none"
          >
            <GraduationCap className="w-14 h-14" />
          </motion.div>

          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top: Logo + Brand */}
          <div className="relative z-10 space-y-7">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
                <img
                  src={unidwellLogo}
                  alt="Unidwell"
                  className="w-12 h-12 object-contain rounded-xl"
                />
              </div>
              <div>
                <h2 className="font-black text-2xl tracking-tight text-white leading-none" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Unidwell
                </h2>
                <p className="text-[11px] text-teal-300 font-semibold uppercase tracking-wider mt-0.5">
                  Smart Student Housing
                </p>
              </div>
            </div>

            {/* Hero Headline */}
            <div className="space-y-3">
              <h1
                className="text-[30px] xl:text-[34px] font-black leading-[1.12] tracking-tight text-white"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                Find Your Perfect<br />
                <span style={{ color: '#22C55E' }}>Student Home</span><br />
                Near Your College
              </h1>
              <p className="text-[13px] text-slate-200/90 font-medium leading-relaxed max-w-sm">
                Discover verified rooms, PGs and apartments directly from trusted property owners.{' '}
                <span className="text-white font-semibold">Safe. Affordable. Transparent.</span>
              </p>
            </div>

            {/* Feature Chips */}
            <div className="flex flex-wrap gap-2">
              {chips.map((chip, i) => {
                const Icon = chip.icon;
                return (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i, duration: 0.4 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-teal-200 bg-white/8 backdrop-blur-sm border border-white/15 rounded-full"
                  >
                    <CheckCircle2 className="w-3 h-3 text-accent-400" />
                    {chip.label}
                  </motion.span>
                );
              })}
            </div>

            {/* 4 Glass Feature Cards */}
            <div className="grid grid-cols-2 gap-2.5">
              {featureCards.map((card, idx) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 * idx, duration: 0.4, ease: 'easeOut' }}
                    whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.12)' }}
                    className="bg-white/7 backdrop-blur-md border border-white/15 rounded-[18px] p-3.5 shadow-lg cursor-default"
                    style={{ background: 'rgba(255,255,255,0.07)' }}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={`p-1.5 rounded-xl border ${card.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="font-bold text-[11px] text-white leading-tight">{card.title}</h3>
                    </div>
                    <p className="text-[10px] text-slate-300/80 leading-snug font-medium">{card.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Bottom Stats */}
          <div className="relative z-10 pt-5 mt-4 border-t border-white/15">
            <div className="grid grid-cols-4 gap-2 text-center">
              {statistics.map((stat, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span className="text-[15px] font-black text-white leading-none" style={{ color: i % 2 === 0 ? '#22C55E' : '#38bdf8' }}>
                    {stat.value}
                  </span>
                  <span className="text-[9px] font-semibold text-slate-300/70 mt-1 uppercase tracking-wide leading-tight text-center">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════ RIGHT FORM PANEL ══════════════ */}
        <div className="lg:col-span-6 xl:col-span-7 bg-white flex flex-col justify-center px-8 sm:px-12 xl:px-16 py-10">
          {/* Mobile-only logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="relative inline-block mb-3">
              <div className="absolute inset-0 bg-teal-400/20 rounded-3xl blur-xl" />
              <img
                src={unidwellLogo}
                alt="Unidwell"
                className="relative w-20 h-auto object-contain mx-auto rounded-2xl shadow-lg border border-gray-100"
              />
            </div>
            <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Unidwell
            </h1>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Smart Student Housing</p>
          </div>

          {/* Form Content */}
          <div className="w-full max-w-md mx-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
