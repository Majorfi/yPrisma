import {LogoYearn} from 'components/icons/LogoYearn';
import {YPRISMA_ADDRESS} from 'utils/constants';
import {YCRV_TOKEN_ADDRESS} from '@yearn-finance/web-lib/utils/constants';

import {ImageWithFallback} from './ImageWithFallback';

export const APPS = {
	Vaults: {
		name: 'Vaults',
		href: 'https://yearn.fi/vaults',
		icon: (
			<LogoYearn
				className={'h-8 w-8'}
				back={'text-[#f472b6]'}
				front={'text-white'}
			/>
		)
	},
	yCRV: {
		name: 'yCRV',
		href: 'https://yearn.fi/ycrv',
		icon: (
			<ImageWithFallback
				alt={'yCRV'}
				className={'h-8 w-8'}
				width={64}
				height={64}
				src={`${process.env.SMOL_ASSETS_URL}/token/1/${YCRV_TOKEN_ADDRESS}/logo-128.png`}
				loading={'eager'}
				priority
			/>
		)
	},
	veYFI: {
		name: 'veYFI',
		href: 'https://yearn.fi/veyfi',
		icon: (
			<LogoYearn
				className={'h-8 w-8'}
				back={'text-[#0657F9]'}
				front={'text-white'}
			/>
		)
	},
	yBribe: {
		name: 'yBribe',
		href: 'https://yearn.fi/ybribe',
		icon: (
			<LogoYearn
				className={'h-8 w-8'}
				back={'text-neutral-900'}
				front={'text-neutral-0'}
			/>
		)
	},
	yETH: {
		name: 'yETH',
		href: 'https://yeth.yearn.fi',
		icon: (
			<ImageWithFallback
				alt={'yETH'}
				className={'h-8 w-8'}
				width={64}
				height={64}
				src={`${process.env.SMOL_ASSETS_URL}/token/1/0x1BED97CBC3c24A4fb5C069C6E311a967386131f7/logo-128.png`}
				loading={'eager'}
				priority
			/>
		)
	},
	yPrisma: {
		name: 'yPrisma',
		href: '/',
		icon: (
			<ImageWithFallback
				priority
				src={`${process.env.SMOL_ASSETS_URL}/token/1/${YPRISMA_ADDRESS}/logo-128.png`}
				className={'h-8 w-8'}
				width={64}
				height={64}
				alt={'yPrisma'}
			/>
		)
	}
};
