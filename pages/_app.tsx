import React from 'react';
import localFont from 'next/font/local';
import Header from 'components/common/Header';
import Meta from 'components/common/Meta';
import {WalletContextApp} from '@builtbymom/web3/contexts/useWallet';
import {WithMom} from '@builtbymom/web3/contexts/WithMom';
import {cl} from '@builtbymom/web3/utils/cl';
import {localhost} from '@builtbymom/web3/utils/wagmi';
import {arbitrum, base, fantom, mainnet, optimism, polygon} from '@wagmi/chains';

import type {AppProps} from 'next/app';
import type {ReactElement} from 'react';

import '../style.css';

const aeonik = localFont({
	variable: '--font-aeonik',
	display: 'swap',
	src: [
		{
			path: '../public/fonts/Aeonik-Regular.woff2',
			weight: '400',
			style: 'normal'
		},
		{
			path: '../public/fonts/Aeonik-Bold.woff2',
			weight: '700',
			style: 'normal'
		},
		{
			path: '../public/fonts/Aeonik-Black.ttf',
			weight: '900',
			style: 'normal'
		}
	]
});

function AppWrapper(props: AppProps): ReactElement {
	const {Component, pageProps, router} = props;

	return (
		<React.Fragment>
			<Meta />
			<Header />
			<Component
				key={router.pathname}
				router={props.router}
				{...pageProps}
			/>
		</React.Fragment>
	);
}

function MyApp(props: AppProps): ReactElement {
	return (
		<>
			<style
				jsx
				global>{`
				html {
					font-family: ${aeonik.style.fontFamily};
				}
			`}</style>
			<WithMom
				supportedChains={[mainnet, optimism, polygon, fantom, base, arbitrum, localhost]}
				tokenLists={['https://raw.githubusercontent.com/SmolDapp/tokenLists/main/lists/yearn.json']}>
				<WalletContextApp>
					<main className={cl('flex flex-col h-screen', aeonik.className)}>
						<AppWrapper {...props} />
					</main>
				</WalletContextApp>
			</WithMom>
		</>
	);
}

export default MyApp;
