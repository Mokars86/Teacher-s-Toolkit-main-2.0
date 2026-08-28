import React from 'react';

interface IllustrationProps {
  className?: string;
}

export const ScanIllustration: React.FC<IllustrationProps> = ({ className = "w-64 h-64" }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full max-w-full">
        {/* Background circle */}
        <circle cx="100" cy="100" r="70" fill="#ecfdf5" />
        
        {/* Scanning beam */}
        <path d="M50 85 H150" stroke="#10b981" strokeWidth="3" strokeDasharray="4 4" className="animate-pulse" />
        <rect x="55" y="87" width="90" height="20" fill="url(#beamGrad)" opacity="0.3" />

        {/* OMR Sheet */}
        <rect x="65" y="50" width="70" height="90" rx="4" fill="white" stroke="#34d399" strokeWidth="3" />
        <line x1="75" y1="65" x2="125" y2="65" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
        <line x1="75" y1="75" x2="110" y2="75" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
        
        {/* OMR Bubbles */}
        <circle cx="80" cy="95" r="3" fill="#10b981" />
        <circle cx="95" cy="95" r="3" stroke="#cbd5e1" strokeWidth="1" />
        <circle cx="110" cy="95" r="3" stroke="#cbd5e1" strokeWidth="1" />
        
        <circle cx="80" cy="110" r="3" stroke="#cbd5e1" strokeWidth="1" />
        <circle cx="95" cy="110" r="3" fill="#10b981" />
        <circle cx="110" cy="110" r="3" stroke="#cbd5e1" strokeWidth="1" />

        <circle cx="80" cy="125" r="3" stroke="#cbd5e1" strokeWidth="1" />
        <circle cx="95" cy="125" r="3" stroke="#cbd5e1" strokeWidth="1" />
        <circle cx="110" cy="125" r="3" fill="#10b981" />

        {/* Smiling Teacher Hands holding phone */}
        {/* Left hand */}
        <path d="M40 140 C45 125 55 110 65 115 C75 120 70 135 60 145" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" fill="#f8fafc" />
        {/* Phone */}
        <rect x="52" y="90" width="30" height="55" rx="3" fill="#1e293b" />
        <rect x="55" y="93" width="24" height="42" rx="1" fill="#0f172a" />
        {/* Phone screen OMR scan frame */}
        <rect x="58" y="96" width="18" height="24" stroke="#10b981" strokeWidth="1" fill="#ecfdf5" />
        <line x1="61" y1="108" x2="73" y2="108" stroke="#10b981" strokeWidth="1" />
        
        {/* Smiling Teacher Face popping in */}
        <path d="M25 90 C25 65 45 45 70 45 C75 45 80 46 85 48" stroke="#1e293b" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* Hair */}
        <path d="M22 85 C20 60 40 38 65 38 C80 38 90 48 90 60" fill="#334155" />
        {/* Glasses */}
        <rect x="42" y="65" width="14" height="10" rx="2" stroke="#1e293b" strokeWidth="2" fill="white" />
        <rect x="58" y="65" width="14" height="10" rx="2" stroke="#1e293b" strokeWidth="2" fill="white" />
        <line x1="56" y1="70" x2="58" y2="70" stroke="#1e293b" strokeWidth="2" />
        {/* Smiling Mouth */}
        <path d="M48 83 C54 87 60 87 66 83" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Blushing cheeks */}
        <circle cx="40" cy="78" r="3" fill="#fca5a5" opacity="0.6" />
        <circle cx="68" cy="78" r="3" fill="#fca5a5" opacity="0.6" />

        <defs>
          <linearGradient id="beamGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export const GradeIllustration: React.FC<IllustrationProps> = ({ className = "w-64 h-64" }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full max-w-full">
        {/* Background circle */}
        <circle cx="100" cy="100" r="70" fill="#ecfdf5" />

        {/* Report Blackboard/Screen */}
        <rect x="40" y="45" width="120" height="85" rx="6" fill="white" stroke="#1e293b" strokeWidth="3" />
        <rect x="45" y="50" width="110" height="75" rx="3" fill="#f8fafc" />

        {/* Graph on board */}
        <path d="M55 105 L75 80 L95 95 L120 65 L145 75" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="75" cy="80" r="4" fill="#10b981" stroke="white" strokeWidth="1.5" />
        <circle cx="120" cy="65" r="4" fill="#10b981" stroke="white" strokeWidth="1.5" />
        <circle cx="145" cy="75" r="4" fill="#10b981" stroke="white" strokeWidth="1.5" />
        
        {/* A+ Circle */}
        <circle cx="130" cy="100" r="16" fill="#10b981" />
        <text x="130" y="105" fill="white" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">A+</text>

        {/* Dashboard Text Lines */}
        <line x1="55" y1="60" x2="90" y2="60" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
        <line x1="55" y1="112" x2="110" y2="112" stroke="#cbd5e1" strokeWidth="2.5" />

        {/* Smiling Teacher standing with pointer */}
        <path d="M145 130 C145 110 155 100 165 100 C175 100 185 110 185 130" stroke="#1e293b" strokeWidth="3" fill="#f8fafc" />
        {/* Face */}
        <circle cx="165" cy="85" r="18" fill="white" stroke="#1e293b" strokeWidth="3" />
        {/* Hair */}
        <path d="M147 80 C147 67 155 67 165 67 C175 67 183 67 183 80 C183 82 180 82 178 80" stroke="#1e293b" strokeWidth="2" fill="#334155" />
        {/* Glasses */}
        <rect x="152" y="79" width="10" height="8" rx="1.5" stroke="#1e293b" strokeWidth="1.5" fill="white" />
        <rect x="166" y="79" width="10" height="8" rx="1.5" stroke="#1e293b" strokeWidth="1.5" fill="white" />
        {/* Smile */}
        <path d="M161 93 C163 96 167 96 169 93" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
        {/* Pointer stick */}
        <line x1="148" y1="95" x2="115" y2="80" stroke="#b45309" strokeWidth="3.5" strokeLinecap="round" />
      </svg>
    </div>
  );
};

export const OfflineIllustration: React.FC<IllustrationProps> = ({ className = "w-64 h-64" }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full max-w-full">
        {/* Background circle */}
        <circle cx="100" cy="100" r="70" fill="#ecfdf5" />

        {/* Forest / Cabin Desk Elements */}
        {/* Tree Outline */}
        <path d="M35 125 L45 100 L40 100 L50 80 L45 80 L55 60 L65 80 L60 80 L70 100 L65 100 L75 125 Z" fill="#a7f3d0" stroke="#059669" strokeWidth="2" strokeLinejoin="round" />
        <rect x="52" y="125" width="6" height="15" fill="#78350f" />

        {/* Desk */}
        <rect x="65" y="115" width="85" height="25" rx="3" fill="white" stroke="#1e293b" strokeWidth="3" />
        {/* Laptop */}
        <rect x="85" y="93" width="45" height="22" rx="2" fill="#475569" stroke="#1e293b" strokeWidth="2.5" />
        <line x1="80" y1="115" x2="135" y2="115" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
        {/* Checkmark of grading result on laptop screen */}
        <path d="M102 104 L106 108 L113 101" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Big "No Wifi" / Cloud Offline Symbol */}
        <path d="M140 60 C135 55 125 55 120 60 C115 50 102 52 98 62 C90 60 82 68 85 78 C75 80 75 92 84 95 L145 95 C155 95 155 82 148 78 C153 72 148 62 140 60 Z" fill="white" stroke="#1e293b" strokeWidth="2.5" />
        
        {/* Signal waves crossed out */}
        <path d="M110 50 C114 46 122 46 126 50" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M104 43 C112 35 128 35 136 43" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
        {/* Big cross-out line */}
        <line x1="95" y1="35" x2="145" y2="60" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />

        {/* Text Offline badge */}
        <rect x="95" y="145" width="62" height="20" rx="10" fill="#fee2e2" stroke="#ef4444" strokeWidth="1" />
        <text x="126" y="159" fill="#ef4444" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">OFFLINE</text>
      </svg>
    </div>
  );
};

export const ShrugIllustration: React.FC<IllustrationProps> = ({ className = "w-48 h-48" }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full max-w-full">
        {/* Background circle */}
        <circle cx="100" cy="100" r="60" fill="#f1f5f9" />

        {/* Shrugging shoulders and hands */}
        <path d="M45 150 C50 120 70 115 85 115 H115 C130 115 150 120 155 150" stroke="#1e293b" strokeWidth="3.5" fill="#f8fafc" />
        {/* Shrugging Arms / Hands */}
        <path d="M45 115 C35 105 25 105 30 95 C35 85 45 95 50 115" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M155 115 C165 105 175 105 170 95 C165 85 155 95 150 115" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" fill="none" />

        {/* Smiling Teacher Face in Middle */}
        <circle cx="100" cy="85" r="22" fill="white" stroke="#1e293b" strokeWidth="3.5" />
        {/* Smiling mouth */}
        <path d="M93 93 C96 97 104 97 107 93" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* Hair */}
        <path d="M76 80 C76 63 85 62 100 62 C115 62 124 63 124 80 C124 82 120 83 118 80" stroke="#1e293b" strokeWidth="2" fill="#334155" />
        {/* Glasses */}
        <rect x="84" y="78" width="12" height="9" rx="1.5" stroke="#1e293b" strokeWidth="2" fill="white" />
        <rect x="104" y="78" width="12" height="9" rx="1.5" stroke="#1e293b" strokeWidth="2" fill="white" />
        <line x1="96" y1="82" x2="104" y2="82" stroke="#1e293b" strokeWidth="2" />
        {/* Subtle shrug quote */}
        <path d="M140 60 L155 50 M145 70 L162 65" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
};

export interface TeacherAvatarProps {
  className?: string;
  src?: string;
  gender?: 'female' | 'male' | 'headteacher';
  showBadge?: boolean;
}

export const TeacherAvatar: React.FC<TeacherAvatarProps> = ({ 
  className = "w-10 h-10", 
  src, 
  gender = 'female',
  showBadge = true
}) => {
  if (src) {
    return (
      <div className={`relative overflow-hidden border-2 border-emerald-500/80 shadow-md ${className}`}>
        <img src={src} alt="Teacher Profile Avatar" className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden border-2 border-emerald-500/80 shadow-md bg-gradient-to-br from-emerald-500 via-teal-600 to-indigo-700 flex items-center justify-center shrink-0 ${className}`}>
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full scale-110">
        <defs>
          <linearGradient id="avatarShirt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          <linearGradient id="avatarHair" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.25)" />
          </linearGradient>
          <filter id="avatarShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Ambient inner circle glow */}
        <circle cx="60" cy="60" r="58" fill="url(#avatarShirt)" opacity="0.15" />

        {/* Shoulder / Shirt */}
        <path d="M22 105 C25 85 40 76 60 76 C80 76 95 85 98 105 Z" fill="url(#avatarShirt)" filter="url(#avatarShadow)" />
        <path d="M48 76 L60 92 L72 76 Z" fill="#ffffff" opacity="0.95" />
        {/* Teacher Tie / Collar Accent */}
        <path d="M56 84 L60 98 L64 84 Z" fill="#f59e0b" />

        {/* Neck */}
        <rect x="52" y="62" width="16" height="18" rx="4" fill="#fcd34d" />

        {/* Head */}
        <circle cx="60" cy="46" r="24" fill="#fcd34d" filter="url(#avatarShadow)" />

        {/* Hair Styles */}
        {gender === 'female' ? (
          <g>
            <path d="M32 44 C28 20 45 15 60 15 C75 15 92 20 88 44 C88 56 82 62 82 62 C78 48 74 30 60 30 C46 30 42 48 38 62 C38 62 32 56 32 44 Z" fill="url(#avatarHair)" />
            <circle cx="60" cy="14" r="8" fill="url(#avatarHair)" />
          </g>
        ) : (
          <path d="M34 40 C34 22 45 18 60 18 C75 18 86 22 86 40 C84 32 76 26 60 26 C44 26 36 32 34 40 Z" fill="url(#avatarHair)" />
        )}

        {/* Eyeglasses */}
        <g filter="url(#avatarShadow)">
          <rect x="40" y="40" width="16" height="12" rx="3" stroke="#0f172a" strokeWidth="2.5" fill="url(#glassGrad)" />
          <rect x="64" y="40" width="16" height="12" rx="3" stroke="#0f172a" strokeWidth="2.5" fill="url(#glassGrad)" />
          <line x1="56" y1="46" x2="64" y2="46" stroke="#0f172a" strokeWidth="2.5" />
          <line x1="34" y1="44" x2="40" y2="44" stroke="#0f172a" strokeWidth="2" />
          <line x1="80" y1="44" x2="86" y2="44" stroke="#0f172a" strokeWidth="2" />
        </g>

        {/* Smiling Mouth */}
        <path d="M52 57 C55 61 65 61 68 57" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Rosy Cheeks */}
        <circle cx="41" cy="52" r="3.5" fill="#f87171" opacity="0.4" />
        <circle cx="79" cy="52" r="3.5" fill="#f87171" opacity="0.4" />

        {/* Teacher ID Badge / Lanyard */}
        {showBadge && (
          <g filter="url(#avatarShadow)">
            <path d="M44 88 L52 98 M76 88 L68 98" stroke="#3b6ff5" strokeWidth="2" strokeDasharray="3 2" />
            <rect x="53" y="96" width="14" height="16" rx="2" fill="#ffffff" stroke="#3b6ff5" strokeWidth="1.5" />
            <rect x="56" y="99" width="8" height="2" fill="#10b981" />
            <rect x="56" y="103" width="8" height="2" fill="#cbd5e1" />
            <circle cx="60" cy="107" r="1.5" fill="#3b6ff5" />
          </g>
        )}
      </svg>
    </div>
  );
};
