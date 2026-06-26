import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Trophy, Zap, Flame, BookOpen, Mail, TrendingUp,
  CheckCircle, AlertTriangle, Play, ChevronRight, Star, Target,
  Award, Clock, ArrowRight, Users, Lock
} from 'lucide-react';
import celebrationImg from '../../assets/celebration.png';
import shieldLowImg from '../../assets/shield_low.png';
import shieldMidImg from '../../assets/shield_mid.png';
import shieldHighImg from '../../assets/shield_high.png';

/* ─── tiny animated counter ─── */
const Counter = ({ value, suffix = '' }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseInt(value, 10);
    if (isNaN(end)) { setDisplay(value); return; }
    const step = Math.ceil(end / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(start);
    }, 25);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display}{suffix}</>;
};

/* ─── stat card ─── */
const StatCard = ({ icon: Icon, label, value, suffix, sub, cardBg, cardBorder, textColor, iconColor, iconBg, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, delay }}
    whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(0,0,0,0.06)' }}
    style={{
      background: cardBg || '#fff',
      border: `1px solid ${cardBorder || '#e2e8f0'}`,
      borderRadius: '20px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      cursor: 'default',
      transition: 'box-shadow 0.25s ease, transform 0.25s ease',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{
        width: '46px', height: '46px', borderRadius: '14px',
        background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0
      }}>
        <Icon size={22} color={iconColor || '#fff'} />
      </div>
      <span style={{
        fontSize: '11px',
        color: textColor || '#10b981',
        fontWeight: '800',
        background: 'rgba(255, 255, 255, 0.45)',
        padding: '3px 10px',
        borderRadius: '99px',
        border: `1px solid ${cardBorder || 'rgba(0,0,0,0.05)'}`,
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}>
        ↑ Live
      </span>
    </div>
    <div>
      <div style={{ fontSize: '30px', fontWeight: '900', color: textColor || '#0f172a', lineHeight: 1.1, letterSpacing: '-0.03em' }}>
        <Counter value={value} suffix={suffix} />
      </div>
      <div style={{ fontSize: '13px', fontWeight: '800', color: textColor || '#0f172a', marginTop: '2px' }}>{label}</div>
      <div style={{ fontSize: '12px', color: textColor ? `${textColor}ba` : '#94a3b8', marginTop: '3px', fontWeight: '600' }}>{sub}</div>
    </div>
  </motion.div>
);

/* ─── streak ring ─── */
const StreakRing = ({ streak }) => {
  const size = 80;
  const r = 32;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(streak / 30, 1);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(245,158,11,0.12)" strokeWidth="6" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="#f59e0b" strokeWidth="6"
          strokeDasharray={`${circ * pct} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center'
      }}>
        <Flame size={16} color="#f59e0b" fill="#f59e0b" />
        <span style={{ fontSize: '14px', fontWeight: '900', color: '#ffffff', lineHeight: 1 }}>{streak}</span>
      </div>
    </div>
  );
};

/* ─── main component ─── */
const UserHome = () => {
  const { currentUser, trainingModules, simulations, certificates } = useAppContext();
  const navigate = useNavigate();

  const xp = currentUser?.rewards_balance || 1010;
  const level = Math.floor(xp / 100) + 1;
  const xpInLevel = xp % 100;
  const securityScore = currentUser?.securityScore || 80;
  const rank = currentUser?.leaderboard_rank || 1;
  const streak = currentUser?.streakDays || 4;
  const completedCount = (trainingModules || []).filter(m => m.isCompleted).length;
  const totalCount = (trainingModules || []).length || 1;
  const completionPct = Math.round((completedCount / totalCount) * 100);

  const pendingModules = (trainingModules || []).filter(m => !m.isCompleted);
  const nextCourse = pendingModules[0] || null;

  const recentReports = (simulations || []).filter(s => s.result === 'Reported' || s.interaction_status === 'Reported');
  const recentCerts = (certificates || []).slice(0, 2);

  const firstName = currentUser?.name?.split(' ')[0] || 'Agent';

  /* greeting */
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const isLow = securityScore < 34;
  const scoreColor = securityScore >= 68 ? '#10b981' : securityScore >= 34 ? '#f59e0b' : '#ef4444';
  const textColor = securityScore >= 68 ? '#14532d' : securityScore >= 34 ? '#78350f' : '#881337';
  const cardBg = securityScore >= 68 
    ? 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)' 
    : securityScore >= 34 
      ? 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)' 
      : 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)';
  const cardBorder = securityScore >= 68 ? '#bbf7d0' : securityScore >= 34 ? '#fde68a' : '#fecdd3';
  const statusLabel = securityScore >= 68 ? 'HIGH' : securityScore >= 34 ? 'MEDIUM' : 'LOW';

  const standingImg = securityScore < 34 
    ? shieldLowImg 
    : securityScore < 68 
      ? shieldMidImg 
      : shieldHighImg;

  return (
    <div style={{ fontFamily: "'Inter', 'Outfit', sans-serif", maxWidth: '1200px', margin: '0 auto' }}>

      {/* ── Hero Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: 'linear-gradient(135deg, #090e1a 0%, #0f172a 60%, #1e3a8a 100%)',
          borderRadius: '24px',
          padding: '36px 40px',
          marginBottom: '28px',
          position: 'relative',
          overflow: 'visible',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          boxShadow: '0 20px 40px -15px rgba(37,99,235,0.35)',
        }}
      >
        {/* inner glow blobs clipped */}
        <div style={{ position: 'absolute', inset: 0, borderRadius: '23px', overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', right: '-60px', top: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.25) 0%, transparent 70%)', filter: 'blur(40px)' }} />
          <div style={{ position: 'absolute', left: '35%', bottom: '-80px', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        </div>

        {/* Celebration Pop-out Graphic */}
        <div className="emp-hero-celebration-wrapper" style={{
          position: 'absolute',
          right: '40px',
          bottom: '-12px',
          height: '240px',
          width: '240px',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 3
        }}>
          <img
            src={celebrationImg}
            alt="Celebration"
            style={{
              maxHeight: '105%',
              maxWidth: '105%',
              objectFit: 'contain',
              transform: 'scale(1.15)',
              transformOrigin: 'bottom center',
              filter: 'drop-shadow(0 15px 30px rgba(37,99,235,0.3)) drop-shadow(0 4px 10px rgba(0,0,0,0.2))'
            }}
          />
        </div>

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Text */}
          <div style={{ flex: 1, minWidth: '260px', maxWidth: '520px' }} className="emp-hero-text-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ background: 'rgba(37,99,235,0.25)', border: '1px solid rgba(96,165,250,0.3)', color: '#60a5fa', fontSize: '11px', fontWeight: '800', padding: '3px 12px', borderRadius: '99px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Level {level} Agent
              </span>
              <span style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '99px' }}>
                ✦ Active
              </span>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.15, margin: 0 }}>
              {greeting}, {firstName}! 👋
            </h1>
            <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '8px', lineHeight: 1.6, fontWeight: '500', maxWidth: '480px' }}>
              You're on a <strong style={{ color: '#fbbf24' }}>{streak}-day streak</strong>. Complete trainings, report phishing emails, and protect your organization.
            </p>

            {/* XP Bar */}
            <div style={{ marginTop: '20px', maxWidth: '380px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Zap size={11} color="#f59e0b" /> XP to Level {level + 1}
                </span>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>{xpInLevel} / 100 XP</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.07)', borderRadius: '99px', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(4, xpInLevel)}%` }}
                  transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                  style={{ height: '100%', background: 'linear-gradient(90deg, #2563EB, #06B6D4)', borderRadius: '99px' }}
                />
              </div>
            </div>
          </div>

          {/* Streak Ring & CTA */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', zIndex: 4 }} className="emp-hero-right-container">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <StreakRing streak={streak} />
              <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Day Streak</span>
            </div>

            {/* Quick CTA */}
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 8px 20px rgba(37,99,235,0.45)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/user/report')}
              style={{
                background: 'linear-gradient(135deg, #2563EB, #06B6D4)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                flexShrink: 0
              }}
            >
              <Mail size={16} /> Report Threat
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ── Stats Grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '28px'
      }}>
        <StatCard
          icon={ShieldCheck}
          label="Security Score"
          value={securityScore}
          suffix="/100"
          sub="Overall safety rating"
          cardBg="linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)"
          cardBorder="#bbf7d0"
          textColor="#14532d"
          iconBg="linear-gradient(135deg, #10b981, #059669)"
          iconColor="#ffffff"
          delay={0.05}
        />
        <StatCard
          icon={Zap}
          label="Total XP"
          value={xp}
          suffix=" XP"
          sub="Accumulated rewards"
          cardBg="linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)"
          cardBorder="#fde68a"
          textColor="#78350f"
          iconBg="linear-gradient(135deg, #f59e0b, #d97706)"
          iconColor="#ffffff"
          delay={0.1}
        />
        <StatCard
          icon={Trophy}
          label="Leaderboard Rank"
          value={`#${rank}`}
          suffix=""
          sub="Company standings"
          cardBg="linear-gradient(135deg, #F5F3FF 0%, #E0E7FF 100%)"
          cardBorder="#c7d2fe"
          textColor="#4338ca"
          iconBg="linear-gradient(135deg, #6366f1, #4f46e5)"
          iconColor="#ffffff"
          delay={0.15}
        />
        <StatCard
          icon={BookOpen}
          label="Training Done"
          value={completionPct}
          suffix="%"
          sub={`${completedCount} of ${totalCount} modules`}
          cardBg="linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)"
          cardBorder="#bae6fd"
          textColor="#0369a1"
          iconBg="linear-gradient(135deg, #0284c7, #0369a1)"
          iconColor="#ffffff"
          delay={0.2}
        />
      </div>

      {/* ── Middle Section ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', marginBottom: '28px' }} className="emp-home-mid-grid">

        {/* LEFT: Next Course + Training Progress */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Next Training */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              padding: '28px',
              flex: 1,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb' }} />
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Next Recommended</span>
            </div>

            {nextCourse ? (
              <>
                <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                  {nextCourse.name}
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6', marginBottom: '20px', fontWeight: '500' }}>
                  {nextCourse.description || 'Strengthen your cybersecurity skills with this training module.'}
                </p>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#64748b', fontWeight: '600', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '5px 12px', borderRadius: '8px' }}>
                    <Clock size={12} /> {nextCourse.duration || '15 min'}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#d97706', fontWeight: '700', background: '#fffbeb', border: '1px solid #fde68a', padding: '5px 12px', borderRadius: '8px' }}>
                    <Zap size={12} /> +100 XP
                  </span>
                </div>
              </>
            ) : (
              <>
                <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#10b981', marginBottom: '8px' }}>
                  All Trainings Complete! 🎉
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6', marginBottom: '20px' }}>
                  Outstanding! You've cleared all awareness coursework. Keep reporting emails to earn bonus XP!
                </p>
              </>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/user/training')}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #2563EB, #1d4ed8)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '12px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Play size={14} fill="#fff" />
              {nextCourse ? 'Start Training' : 'Browse All Modules'}
              <ArrowRight size={14} />
            </motion.button>
          </motion.div>

          {/* Training Curriculum Progress */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>Curriculum Progress</h3>
              <span style={{ fontSize: '22px', fontWeight: '900', color: '#2563eb' }}>{completionPct}%</span>
            </div>
            <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden', marginBottom: '12px' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPct}%` }}
                transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
                style={{ height: '100%', background: 'linear-gradient(90deg, #2563EB, #06B6D4)', borderRadius: '99px', minWidth: '8px' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>
              <span>{completedCount} completed</span>
              <span>{totalCount - completedCount} remaining</span>
            </div>
          </motion.div>
        </div>

        {/* RIGHT: Security Score Gauge + Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Security Score Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.28 }}
            whileHover={{ scale: 1.02, y: -4, boxShadow: `0 20px 40px -10px ${scoreColor}30, 0 8px 24px rgba(0,0,0,0.05)` }}
            style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: '24px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: `0 15px 35px -10px ${scoreColor}15, 0 4px 20px rgba(0,0,0,0.02)`,
              transition: 'all 0.3s ease',
              width: '100%',
              alignSelf: 'stretch'
            }}
          >
            {/* Cyber decorative grid (subtle light grid) */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'radial-gradient(rgba(0,0,0,0.02) 1px, transparent 1px)',
              backgroundSize: '16px 16px',
              opacity: 0.8,
              pointerEvents: 'none'
            }} />
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
              background: `linear-gradient(90deg, transparent, ${scoreColor}, transparent)`
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', zIndex: 2 }}>
              <h3 style={{ fontSize: '13px', fontWeight: '900', color: textColor, opacity: 0.8, letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
                Shield Standing
              </h3>
              <span style={{
                fontSize: '9px', fontWeight: '800', color: scoreColor,
                background: '#fff',
                border: `1px solid ${cardBorder}`,
                padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em'
              }}>
                Online
              </span>
            </div>

            {/* Gauge & Avatar Row */}
            <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', gap: '20px', zIndex: 2, flexWrap: 'wrap' }}>
              {/* Circular gauge */}
              <div style={{ position: 'relative', width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Background glow blob */}
                <div style={{
                  position: 'absolute',
                  width: '80px', height: '80px', borderRadius: '50%',
                  background: scoreColor, filter: 'blur(28px)', opacity: 0.08,
                  pointerEvents: 'none'
                }} />

                <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="60" cy="60" r="46" fill="none" stroke="rgba(0, 0, 0, 0.03)" strokeWidth="7" />
                  <motion.circle
                    cx="60" cy="60" r="46" fill="none"
                    stroke={scoreColor}
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 46}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 46 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 46 * (1 - securityScore / 100) }}
                    transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
                    style={{ filter: `drop-shadow(0 0 4px ${scoreColor}80)` }}
                  />
                </svg>
                <div style={{
                  position: 'absolute',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center'
                }}>
                  <span style={{
                    fontSize: '28px',
                    fontWeight: '950',
                    color: textColor,
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                  }}>
                    {securityScore}
                  </span>
                  <span style={{ fontSize: '9px', color: textColor, opacity: 0.7, fontWeight: '800', marginTop: '2px', letterSpacing: '0.05em' }}>/ 100 PTS</span>
                </div>
              </div>

              {/* Avatar Image representing status */}
              <div style={{
                width: '110px',
                height: '110px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <img
                  src={standingImg}
                  alt={`Mascot for status ${statusLabel}`}
                  style={{
                    maxHeight: '100%',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.12))'
                  }}
                />
              </div>
            </div>

            {/* Tactical Standing Tier */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 2 }}>
              <div style={{ fontSize: '9px', fontWeight: '800', color: textColor, opacity: 0.7, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Tactical Standing
              </div>
              <div style={{
                fontSize: isLow ? '11px' : '14px',
                fontWeight: '900',
                color: textColor,
                background: '#fff',
                border: `1px solid ${cardBorder}`,
                padding: isLow ? '3px 12px' : '6px 20px',
                borderRadius: '10px',
                letterSpacing: '0.1em',
                boxShadow: `0 4px 12px ${scoreColor}15`,
                textAlign: 'center',
                width: isLow ? '45%' : '80%',
                textTransform: 'uppercase'
              }}>
                {statusLabel}
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              padding: '24px',
              flex: 1,
            }}
          >
            <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Report Suspicious Email', icon: Mail, path: '/user/report', color: '#2563eb', bg: '#eff6ff' },
                { label: 'View Trainings', icon: BookOpen, path: '/user/training', color: '#0d9488', bg: '#f0fdfa' },
                { label: 'Check Leaderboard', icon: Trophy, path: '/user/leaderboard', color: '#7c3aed', bg: '#f5f3ff' },
              ].map((action, i) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.path}
                    whileHover={{ x: 4 }}
                    onClick={() => navigate(action.path)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '12px 14px', borderRadius: '12px',
                      background: action.bg, border: `1px solid ${action.color}15`,
                      cursor: 'pointer', width: '100%', textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{
                      width: '34px', height: '34px', borderRadius: '10px',
                      background: action.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      <Icon size={16} color="#fff" />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', flex: 1 }}>{action.label}</span>
                    <ChevronRight size={14} color={action.color} />
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Activity Feed ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '20px',
          padding: '28px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Recent Activity</h3>
          <button
            onClick={() => navigate('/user/leaderboard')}
            style={{ fontSize: '12px', color: '#2563eb', fontWeight: '700', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            See all <ChevronRight size={12} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          {/* Certs */}
          {recentCerts.map((c, i) => (
            <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CheckCircle size={18} color="#10b981" />
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                  Completed: {c.courseName || c.module_title}
                </p>
                <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px', fontWeight: '600' }}>+100 XP earned · Certificate issued</p>
              </div>
            </div>
          ))}

          {/* Reports */}
          {recentReports.slice(0, 2).map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertTriangle size={18} color="#2563eb" />
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                  Reported: {s.subject}
                </p>
                <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px', fontWeight: '600' }}>+100 XP earned · Great vigilance!</p>
              </div>
            </div>
          ))}

          {/* Fallback */}
          {recentCerts.length === 0 && recentReports.length === 0 && (
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Star size={18} color="#2563eb" />
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Welcome to Phintra! 🎉</p>
                <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px', fontWeight: '600' }}>Complete your first training to earn XP rewards</p>
              </div>
            </div>
          )}

          {/* Current streak activity */}
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '14px', background: '#fffbeb', borderRadius: '12px', border: '1px solid #fde68a' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Flame size={18} color="#f59e0b" fill="#f59e0b" />
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                {streak > 0 ? `${streak}-Day Streak Active! 🔥` : 'Start your streak today!'}
              </p>
              <p style={{ fontSize: '11px', color: '#92400e', marginTop: '3px', fontWeight: '600' }}>
                {streak > 0 ? 'Keep it going — log in daily to maintain your streak' : 'Complete a training or report an email to begin'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* responsive grid tweak */}
      <style>{`
        @media (max-width: 991px) {
          .emp-hero-celebration-wrapper { display: none !important; }
          .emp-hero-text-container { max-width: 100% !important; }
          .emp-hero-right-container { flex-direction: row !important; width: 100% !important; justify-content: flex-start !important; gap: 24px !important; margin-top: 16px; }
          .emp-home-mid-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 580px) {
          .emp-hero-right-container { flex-direction: column !important; align-items: flex-start !important; gap: 16px !important; }
        }
      `}</style>
    </div>
  );
};

export default UserHome;
