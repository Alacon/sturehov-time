function withOpacityValue(variable) {
  return ({ opacityValue }) => {
    if (opacityValue === undefined) {
      return `rgb(var(${variable}))`;
    }
    return `rgb(var(${variable}) / ${opacityValue})`;
  };
}

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				primary: withOpacityValue('--color-primary'),
				'primary-scroll': 'rgb(var(--color-primary))',
				'primary-accent': withOpacityValue('--color-primary-accent'),
				'primary-accent-scroll': 'rgb(var(--color-primary-accent))',
				'primary-darkened': withOpacityValue('--color-primary-darkened'),
				secondary: withOpacityValue('--color-secondary'),
				'secondary-accent': withOpacityValue('--color-secondary-accent'),
				error: withOpacityValue('--color-error'),
				warning: withOpacityValue('--color-warning'),
				info: withOpacityValue('--color-info'),
				'default-text': withOpacityValue('--color-defaultText'),
				surface: withOpacityValue('--color-surface'),
				'surface-accent': withOpacityValue('--color-surfaceAccent'),
				'on-surface': withOpacityValue('--color-onSurface'),
				'on-surface-scroll': 'rgb(var(--color-onSurface))',
				'secondary-surface': withOpacityValue('--color-secondarySurface'),
				'on-secondary-surface': withOpacityValue('--color-onSecondarySurface'),
				background: withOpacityValue('--color-background'),
				'on-background': withOpacityValue('--color-onBackground'),
				'on-background-scroll': 'rgb(var(--color-onBackground))',
				'midnight-black': withOpacityValue('--color-midnightBlack'),
				'vortex-black': withOpacityValue('--color-vortexBlack'),
				'midnight-black-scroll': 'rgb(var(--color-midnightBlack))',
				'nightrider-black': withOpacityValue('--color-nightriderBlack'),
				'charcoal-black': withOpacityValue('--color-charcoalBlack'),
				'chrome-grey': withOpacityValue('--color-chromeGrey'),
				'tarmac-grey': withOpacityValue('--color-tarmacGrey'),
				'brushed-metal-grey': withOpacityValue('--color-brushedMetalGrey'),
				'space-black': withOpacityValue('--color-spaceBlack'),
				'sunray-yellow': withOpacityValue('--color-sunrayYellow'),
				'fusion-blue': withOpacityValue('--color-fusionBlue'),
				'electro-green': withOpacityValue('--color-electroGreen'),
				'lazy-purple': withOpacityValue('--color-lazyPurple'),
				'hazy-purple': withOpacityValue('--color-hazyPurple'),
				'wet-asphalt': withOpacityValue('--color-wetAsphalt'),
				'smurf-blue': withOpacityValue('--color-smurfBlue'),
				'hot-red': withOpacityValue('--color-hotRed')
			}
		}
	},
	plugins: []
};
