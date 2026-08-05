export default function MascotIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className="block shrink-0"
      aria-hidden="true"
    >
      <path
        d="M52 52 C82 52 72 100 100 100 C128 100 118 148 148 148"
        fill="none"
        className="stroke-violet"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <g className="fill-primary stroke-accent" strokeWidth="5">
        <rect x="32" y="32" width="40" height="40" rx="11" />
        <rect x="80" y="80" width="40" height="40" rx="11" />
        <rect x="128" y="128" width="40" height="40" rx="11" />
      </g>
      <g fill="none" className="stroke-lavender" strokeWidth="6" strokeLinecap="round">
        <path d="M44 48 H60 M44 58 H55" />
        <path d="M92 96 H108 M92 106 H103" />
        <path d="M140 144 L147 151 L158 139" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
