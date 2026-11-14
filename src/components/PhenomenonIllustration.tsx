import React from 'react';

interface PhenomenonIllustrationProps {
  mode: 'normal' | 'hujan';
  onModeChange: (mode: 'normal' | 'hujan') => void;
}

export const PhenomenonIllustration: React.FC<PhenomenonIllustrationProps> = ({
  mode,
  onModeChange,
}) => {
  const isHujan = mode === 'hujan';

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold text-slate-800">
          Simulasi Fenomena Lingkungan
        </span>
        <div
          className="inline-flex rounded-lg bg-slate-200/70 p-1"
          role="group"
          aria-label="Pilih kondisi cuaca"
        >
          <button
            type="button"
            onClick={() => onModeChange('normal')}
            className={`whitespace-nowrap shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              !isHujan
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Kondisi Normal
          </button>
          <button
            type="button"
            onClick={() => onModeChange('hujan')}
            className={`whitespace-nowrap shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              isHujan
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Saat Hujan Deras
          </button>
        </div>
      </div>

      <svg
        viewBox="0 0 460 190"
        className="mx-auto block w-full max-w-lg rounded-lg border border-slate-200"
        style={{ background: isHujan ? '#cbd5e1' : '#e0f2fe' }}
        role="img"
        aria-label={
          isHujan
            ? 'Ilustrasi saluran air keruh saat hujan deras membawa lumpur dan daun'
            : 'Ilustrasi saluran air jernih saat cuaca normal'
        }
      >
        {isHujan ? (
          <>
            <ellipse cx="120" cy="30" rx="58" ry="18" fill="#64748b" />
            <ellipse cx="310" cy="32" rx="68" ry="20" fill="#475569" />
            {[95, 130, 165, 275, 315, 355].map((x, idx) => (
              <line
                key={x}
                x1={x}
                y1={52 + (idx % 2) * 4}
                x2={x - 8}
                y2={78 + (idx % 2) * 4}
                stroke="#0284c7"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            ))}
          </>
        ) : (
          <>
            <circle cx="395" cy="36" r="20" fill="#facc15" />
            <ellipse cx="125" cy="36" rx="48" ry="15" fill="#ffffff" />
            <ellipse cx="240" cy="28" rx="36" ry="12" fill="#ffffff" />
          </>
        )}

        {/* Profil Tanah dan Saluran */}
        <rect x="0" y="98" width="460" height="92" fill="#854d0e" />
        <path
          d="M0 98 L135 98 L165 162 L295 162 L325 98 L460 98 L460 190 L0 190 Z"
          fill="#78350f"
        />

        {/* Permukaan Air di Saluran */}
        <path
          d="M144 114 L316 114 L295 162 L165 162 Z"
          fill={isHujan ? '#92400e' : '#0ea5e9'}
        />

        {isHujan ? (
          <>
            <circle cx="182" cy="130" r="4.5" fill="#451a03" />
            <circle cx="222" cy="142" r="3.5" fill="#713f12" />
            <circle cx="268" cy="128" r="5" fill="#166534" />
            <circle cx="204" cy="123" r="3" fill="#451a03" />
            <circle cx="246" cy="148" r="3.8" fill="#fde047" />
            <circle cx="282" cy="144" r="3.2" fill="#451a03" />
            <text
              x="230"
              y="179"
              textAnchor="middle"
              fill="#fef3c7"
              fontSize="11.5"
              fontWeight="700"
            >
              Campuran heterogen: air + lumpur + pasir + serpihan daun
            </text>
          </>
        ) : (
          <text
            x="230"
            y="179"
            textAnchor="middle"
            fill="#e0f2fe"
            fontSize="11.5"
            fontWeight="700"
          >
            Air saluran relatif jernih (sedikit partikel padat tersuspensi)
          </text>
        )}
      </svg>
    </div>
  );
};
