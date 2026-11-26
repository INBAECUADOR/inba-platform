import { cn } from '@/utils/cn'

const FLAG = {
  yellow: '#FFD100',
  blue: '#0B4FA8',
  red: '#E01B22',
  gold: '#C9A227',
}

/** Contenido del globo (sin <svg>) para poder anidarlo en el emblema. */
function GloboContenido({ idPrefix = 'inba' }: { idPrefix?: string }) {
  const clipId = `${idPrefix}-globo-clip`
  return (
    <>
      <defs>
        <clipPath id={clipId}>
          <circle cx="100" cy="100" r="92" />
        </clipPath>
      </defs>
      <circle cx="100" cy="100" r="96" fill="#ffffff" />
      <g clipPath={`url(#${clipId})`}>
        <rect x="0" y="8" width="200" height="62" fill={FLAG.yellow} />
        <rect x="0" y="73" width="200" height="54" fill={FLAG.blue} />
        <rect x="0" y="130" width="200" height="70" fill={FLAG.red} />
        <g stroke="#ffffff" strokeOpacity="0.55" strokeWidth="2" fill="none">
          <ellipse cx="100" cy="100" rx="40" ry="92" />
          <ellipse cx="100" cy="100" rx="72" ry="92" />
          <path d="M8 73h184M8 127h184" />
        </g>
        <path
          d="M100 26c14 12 18 26 14 38-4 12-14 18-14 18s-10-6-14-18c-4-12 0-26 14-38Z"
          fill="#ffffff"
          fillOpacity="0.9"
        />
      </g>
      <circle cx="100" cy="100" r="92" fill="none" stroke={FLAG.gold} strokeWidth="6" />
    </>
  )
}

function Globo({ size = 96, className, idPrefix }: { size?: number; className?: string; idPrefix?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <GloboContenido idPrefix={idPrefix} />
    </svg>
  )
}

/**
 * Emblema completo: INBA + globo con la bandera del Ecuador + ECUADOR.
 * Usa currentColor para adaptarse a fondos claros u oscuros.
 */
export function InbaEmblem({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 420 452" role="img" aria-label="INBA Ecuador" className={cn('h-auto w-full', className)}>
      <text
        x="210"
        y="150"
        textAnchor="middle"
        fill="currentColor"
        fontFamily="Arial Black, Arial, Helvetica, sans-serif"
        fontSize="168"
        fontWeight="800"
        letterSpacing="-10"
      >
        INBA
      </text>
      <svg x="114" y="176" width="192" height="192" viewBox="0 0 200 200" aria-hidden="true">
        <GloboContenido idPrefix="inba-emblem" />
      </svg>
      <text
        x="210"
        y="400"
        textAnchor="middle"
        fill="currentColor"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="10"
        letterSpacing="1.9"
        opacity="0.75"
      >
        INTERNATIONAL NATURAL BODYBUILDING ASSOCIATION
      </text>
      <text
        x="210"
        y="448"
        textAnchor="middle"
        fill="currentColor"
        fontFamily="Arial Black, Arial, Helvetica, sans-serif"
        fontSize="44"
        fontWeight="800"
        letterSpacing="4"
      >
        ECUADOR
      </text>
      <circle cx="356" cy="402" r="8" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.7" />
      <text
        x="356"
        y="406"
        textAnchor="middle"
        fill="currentColor"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="9"
        opacity="0.7"
      >
        R
      </text>
    </svg>
  )
}

/** Versión horizontal para barras de navegación. */
export function InbaLogo({ className }: { className?: string }) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <Globo size={40} className="shrink-0" idPrefix="inba-logo" />
      <span className="flex flex-col leading-none">
        <span className="font-black text-xl tracking-tight text-foreground">INBA</span>
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          Ecuador
        </span>
      </span>
    </span>
  )
}
