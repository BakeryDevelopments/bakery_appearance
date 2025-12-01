import { FC } from 'react';

interface IconProps {
	size?: number;
}

export const IconImport: FC<IconProps> = ({ size = 24 }) => {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="currentColor"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path d="M5 20h14v-2H5v2zm7-18v12l4-4h-3V4h-2v6H8l4 4z" />
		</svg>
	);
};
