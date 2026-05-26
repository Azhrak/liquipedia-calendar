import type { Config } from 'tailwindcss'

const config: Config = {
	darkMode: 'class',
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
				display: ['var(--font-display)', 'var(--font-sans)', 'sans-serif'],
				mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
			},
			colors: {
				/** Neutral slate-blue ramp for surfaces. */
				ink: {
					500: '#465173',
					600: '#2e3852',
					700: '#222a3a',
					750: '#1c2230',
					800: '#161a23',
					850: '#11141b',
					900: '#0c0e13',
					950: '#08090c',
				},
				accent: {
					DEFAULT: '#7cf6c2',
					soft: '#1f3a32',
				},
			},
			boxShadow: {
				glow: '0 0 0 1px rgba(124,246,194,0.35), 0 0 24px -4px rgba(124,246,194,0.35)',
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
			},
		},
	},
	plugins: [],
}

export default config
