/* eslint-disable @typescript-eslint/explicit-function-return-type */
const withPWA = require('next-pwa')({
	dest: 'public',
	disable: process.env.NODE_ENV !== 'production'
});
const {PHASE_EXPORT} = require('next/constants');

module.exports = phase =>
	withPWA({
		assetPrefix: process.env.IPFS_BUILD === 'true' || phase === PHASE_EXPORT ? './' : '/',
		images: {
			unoptimized: process.env.IPFS_BUILD === 'true' || phase === PHASE_EXPORT,
			domains: ['raw.githubusercontent.com', 'assets.smold.app']
		},
		redirects() {
			return [
				{
					source: '/favicon.ico',
					destination: 'https://yprisma.yearn.fi/favicons/favicon.ico',
					permanent: true
				}
			];
		},
		env: {
			JSON_RPC_URL: {
				1: process.env.RPC_URL_MAINNET
			},
			TELEGRAM_BOT: process.env.TELEGRAM_BOT,
			TELEGRAM_CHAT: process.env.TELEGRAM_CHAT,
			ALCHEMY_KEY: process.env.ALCHEMY_KEY,
			INFURA_PROJECT_ID: process.env.INFURA_PROJECT_ID,
			WALLETCONNECT_PROJECT_ID: process.env.WALLETCONNECT_PROJECT_ID,
			YDAEMON_BASE_URI: 'https://ydevmon.ycorpo.com'
		}
	});
