type TomatoIconProps = {
  className?: string;
  size?: number;
};

export default function TomatoIcon({ className, size = 20 }: TomatoIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M19.3 9.05c1.58 4.14-.53 9.14-5.07 10.5-4.52 1.35-9.25-1.19-9.82-5.62-.53-4.13 2.57-7.49 7.3-7.56 3.57-.05 6.38 1.05 7.59 2.68Z"
        fill="currentColor"
      />
      <path
        d="m11.64 7.13-2.9-1.34 2.38-.63.72-2.2 1.22 2.04 2.62-.22-1.73 1.74 2.02 1.12-3.04-.06-1.12 1.63-.17-2.08Z"
        fill="#4f8a57"
        stroke="#37643e"
        strokeWidth=".55"
        strokeLinejoin="round"
      />
      <path
        d="M8.2 12.1c.35-1.5 1.5-2.52 2.95-2.8"
        stroke="rgba(255,255,255,.72)"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}
