import type { SVGProps } from "react";

/* Nucleo "sharp" outlines (24px grid), the closest match to the Font Awesome Sharp set in the Figma file. */

type IconProps = SVGProps<SVGSVGElement>;

function Svg({ children, className = "size-[15px]", ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className} {...rest}>
      {children}
    </svg>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden {...props}>
      <circle cx="10" cy="10" r="3.25" />
      <path d="M10 1.75v1.5M10 16.75v1.5M18.25 10h-1.5M3.25 10h-1.5M15.83 4.17l-1.06 1.06M5.23 14.77l-1.06 1.06M15.83 15.83l-1.06-1.06M5.23 5.23 4.17 4.17" />
    </svg>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" aria-hidden {...props}>
      <path d="M16.5 12.2A6.75 6.75 0 0 1 7.8 3.5a6.75 6.75 0 1 0 8.7 8.7Z" />
    </svg>
  );
}

export function FingerprintIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M11.3 17.32A8.68 8.68 0 0 0 17.5 20c.17 0 .33 0 .5-.02v2c-.17.01-.33.02-.5.02a10.67 10.67 0 0 1-7.66-3.32l1.46-1.36Z" fill="currentColor" />
      <path d="M5 12.5c0 3.95 1.99 7.43 5.02 9.5H6.91A10.47 10.47 0 0 1 3 12.5V12h2v.5Z" fill="currentColor" />
      <path d="M4 10a8 8 0 0 1 8-8" stroke="currentColor" strokeWidth="2" />
      <path d="M13 11a5 5 0 0 0 7 4.58v2.13A7 7 0 0 1 11 11v-1h2v1Z" fill="currentColor" />
      <path d="M16.36 2.13A8.99 8.99 0 0 1 21 10v1a3 3 0 0 1-5.83 1H18a1 1 0 0 0 1-1v-1a7 7 0 0 0-3.6-6.13l.96-1.74Z" fill="currentColor" />
      <path d="M16 10a4 4 0 0 0-8 0v1.5c0 1.53.36 2.97 1 4.25" stroke="currentColor" strokeWidth="2" />
    </Svg>
  );
}

export function DatabaseIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M21 12c0 1.66-4.03 3-9 3s-9-1.34-9-3" stroke="currentColor" strokeWidth="2" />
      <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" stroke="currentColor" strokeWidth="2" />
      <ellipse cx="12" cy="5" rx="9" ry="3" stroke="currentColor" strokeWidth="2" />
    </Svg>
  );
}

export function GridIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M10 10V3H3v7h7ZM10 21v-7H3v7h7ZM21 21v-7h-7v7h7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
      <path d="M13 6.05v.9L17.05 11h.9L22 6.95v-.9L17.95 2h-.9L13 6.05Z" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </Svg>
  );
}

export function CloudIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M18 20H6a5 5 0 0 1 0-10 6 6 0 0 1 12 0 5 5 0 0 1 0 10Z" stroke="currentColor" strokeWidth="2" />
    </Svg>
  );
}

export function MessageDotsIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2 4v14h7l2.25 4h1.5L15 18h7V4H2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
      <path d="M8 11v.01M12 11v.01M16 11v.01" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </Svg>
  );
}

export function PlugIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M16 2v5M8 2v5" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
      <path d="M4 14V7h16v7l-5 4v3H9v-3l-5-4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </Svg>
  );
}

export function BranchIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M7 12h10V7M7 7v10" stroke="currentColor" strokeWidth="2" />
      <circle cx="7" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="17" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="7" cy="19.5" r="2.5" stroke="currentColor" strokeWidth="2" />
    </Svg>
  );
}

export function CopyIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M7 17V3h14v14H7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
      <path d="M3 7v14h14" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </Svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m4 12.5 5 5L20 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </Svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 12h17M14 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </Svg>
  );
}

export function ArrowUpRightIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 18 18 6M9 6h9v9" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </Svg>
  );
}

export function DownloadIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3v12M6 9.5l6 6 6-6M4 21h16" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </Svg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m5 5 14 14M19 5 5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </Svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 8h18M3 16h18" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </Svg>
  );
}

export function KeyIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="7.5" cy="15.5" r="4.5" stroke="currentColor" strokeWidth="2" />
      <path d="m11 12 9-9m-4 4 3 3m-6 0 2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </Svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 10h16v12H4V10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" />
      <path d="M12 14.5v3" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </Svg>
  );
}

export function HandshakeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2 7h4l3-2h5l3 2h5v8h-4l-4 4-5-3-4-2H2V7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="m9 9 3 2 3-2" stroke="currentColor" strokeWidth="2" />
    </Svg>
  );
}

export function RouteIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="5" cy="18" r="2.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="19" cy="6" r="2.5" stroke="currentColor" strokeWidth="2" />
      <path d="M7.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7.5" stroke="currentColor" strokeWidth="2" />
    </Svg>
  );
}

export function GitHubIcon({ className = "size-6", ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} {...rest}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M12 3.84c-4.61 0-8.35 3.75-8.35 8.37 0 3.7 2.39 6.83 5.71 7.94.42.07.57-.18.57-.4l-.01-1.43c-2.32.5-2.81-1.12-2.81-1.12-.38-.97-.93-1.23-.93-1.23-.76-.52.06-.51.06-.51.84.06 1.28.86 1.28.86.74 1.28 1.95.91 2.43.7.08-.54.29-.91.53-1.12-1.85-.21-3.8-.93-3.8-4.13 0-.91.32-1.66.86-2.24-.09-.21-.37-1.06.08-2.21 0 0 .7-.23 2.3.86a7.9 7.9 0 0 1 4.18 0c1.6-1.09 2.3-.86 2.3-.86.45 1.15.17 2 .08 2.21.54.58.86 1.33.86 2.24 0 3.21-1.95 3.92-3.81 4.13.3.26.57.76.57 1.54l-.01 2.3c0 .22.15.48.58.4a8.37 8.37 0 0 0 5.7-7.94c0-4.62-3.73-8.37-8.34-8.37Z"
      />
    </svg>
  );
}

export function XLogo({ className = "size-4", ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} {...rest}>
      <path
        fill="currentColor"
        d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77L17.75 3Zm-1.08 16.18h1.7L7.4 4.73H5.58l11.09 14.45Z"
      />
    </svg>
  );
}

export function LinkedInLogo({ className = "size-4", ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} {...rest}>
      <path
        fill="currentColor"
        d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z"
      />
    </svg>
  );
}
