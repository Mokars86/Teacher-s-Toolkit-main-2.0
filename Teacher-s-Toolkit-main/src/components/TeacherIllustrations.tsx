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

export const TeacherAvatar: React.FC<IllustrationProps> = ({ className = "w-10 h-10" }) => {
  return (
    <div className={`rounded-full overflow-hidden border border-emerald-300 bg-emerald-50 flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full scale-110">
        {/* Neck */}
        <rect x="44" y="65" width="12" height="15" fill="#f8fafc" stroke="#1e293b" strokeWidth="2" />
        {/* Collar */}
        <path d="M35 80 L50 85 L65 80 L50 95 Z" fill="#10b981" />
        {/* Head */}
        <circle cx="50" cy="45" r="22" fill="white" stroke="#1e293b" strokeWidth="3" />
        {/* Glasses */}
        <rect x="34" y="38" width="13" height="10" rx="2" stroke="#1e293b" strokeWidth="2.5" fill="white" />
        <rect x="53" y="38" width="13" height="10" rx="2" stroke="#1e293b" strokeWidth="2.5" fill="white" />
        <line x1="47" y1="43" x2="53" y2="43" stroke="#1e293b" strokeWidth="2" />
        {/* Smiling Mouth */}
        <path d="M44 55 C47 58 53 58 56 55" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* Hair */}
        <path d="M26 40 C25 24 35 22 50 22 C65 22 75 24 74 40 C74 42 70 42 68 39 C60 38 55 41 50 38 C45 41 40 38 32 39 C30 42 26 42 26 40 Z" fill="#334155" stroke="#1e293b" strokeWidth="1.5" />
        {/* Blushing cheeks */}
        <circle cx="32" cy="48" r="3" fill="#fca5a5" opacity="0.5" />
        <circle cx="68" cy="48" r="3" fill="#fca5a5" opacity="0.5" />
      </svg>
    </div>
  );
};
