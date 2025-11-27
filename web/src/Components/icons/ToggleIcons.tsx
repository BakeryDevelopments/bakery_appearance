import { FC } from 'react';

interface IconProps {
  size?: number;
}

export const IconHat: FC<IconProps> = ({ size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2L2 7v4c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-8-5zm0 2.18l6 3.75v3.57c0 4.42-2.83 8.78-6 10.05-3.17-1.27-6-5.63-6-10.05V7.93l6-3.75z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
};

export const IconMask: FC<IconProps> = ({ size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      <ellipse cx="9" cy="10" rx="1.5" ry="2" />
      <ellipse cx="15" cy="10" rx="1.5" ry="2" />
    </svg>
  );
};

export const IconGlasses: FC<IconProps> = ({ size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M6 14c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm12 0c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zM9 17c0-1.11.45-2.11 1.18-2.83L12 12l1.82 2.17A3.94 3.94 0 0 1 15 17h3c0-2.21-1.79-4-4-4h-4c-2.21 0-4 1.79-4 4h3z" />
    </svg>
  );
};

export const IconShirt: FC<IconProps> = ({ size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M16 3l-4 4-4-4H3v6l3 2v10h12V11l3-2V3h-5zm2 14H6V12.5L4 11V5h2.5l3.5 3.5L14 5h2.5v6l-2 1.5V17z" />
    </svg>
  );
};

export const IconJacket: FC<IconProps> = ({ size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19 3H5v18h14V3zm-7 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zM6 19V5h1v4h2V5h2v4h2V5h2v4h2V5h1v14H6z" />
    </svg>
  );
};

export const IconVest: FC<IconProps> = ({ size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M15 4l-4 4-4-4H3v16h18V4h-6zM7 18V6h2l3 3 3-3h2v12H7z" />
    </svg>
  );
};

export const IconPants: FC<IconProps> = ({ size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M8 2v18h3V8h2v12h3V2H8zm2 2h4v2h-4V4z" />
    </svg>
  );
};

export const IconShoes: FC<IconProps> = ({ size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M3 17c0 1.66 1.34 3 3 3h12c1.66 0 3-1.34 3-3v-3H3v3zM21 9V7h-2V5c0-1.66-1.34-3-3-3H8C6.34 2 5 3.34 5 5v2H3v2h2v1H3v2h18v-2h-2V9h2zM7 5c0-.55.45-1 1-1h8c.55 0 1 .45 1 1v2H7V5z" />
    </svg>
  );
};


