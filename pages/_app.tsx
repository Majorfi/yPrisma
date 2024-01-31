import React from 'react';
import {Toaster} from 'react-hot-toast';
import localFont from 'next/font/local';
import AppWrapper from 'components/common/AppWrapper';
import IconCheck from 'components/icons/IconCheck';
import IconCircleCross from 'components/icons/IconCircleCross';
import {mainnet} from 'viem/chains';
import {WalletContextApp} from '@builtbymom/web3/contexts/useWallet';
import {WithMom} from '@builtbymom/web3/contexts/WithMom';
import {cl} from '@builtbymom/web3/utils';
import {localhost} from '@builtbymom/web3/utils/wagmi';

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
				supportedChains={[mainnet, localhost]}
				tokenLists={['https://raw.githubusercontent.com/SmolDapp/tokenLists/main/lists/yearn.json']}>
				<WalletContextApp>
					<main className={cl('flex flex-col h-screen', aeonik.className)}>
						<AppWrapper {...props} />
					</main>
				</WalletContextApp>
			</WithMom>
			<Toaster
				toastOptions={{
					duration: 5000,
					className: 'toast',
					success: {
						icon: <IconCheck className={'size-5 min-h-5 min-w-5 -mr-1 pt-1.5'} />,
						iconTheme: {
							primary: 'black',
							secondary: '#F1EBD9'
						}
					},
					error: {
						icon: <IconCircleCross className={'size-5 min-h-5 min-w-5 -mr-1 pt-1.5'} />,
						iconTheme: {
							primary: 'black',
							secondary: '#F1EBD9'
						}
					}
				}}
				position={'top-left'}
			/>
		</>
	);
}

export default MyApp;
