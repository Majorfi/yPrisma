import React from 'react';
import Header from 'components/common/Header';
import Meta from 'components/common/Meta';
import Rainbow from 'components/icons/Rainbow';

import type {AppProps} from 'next/app';
import type {ReactElement} from 'react';

function AppWrapper(props: AppProps): ReactElement {
	const {Component, pageProps, router} = props;

	return (
		<React.Fragment>
			<Meta />
			<Header />
			<div className={'fixed inset-0 -top-16 left-10 h-full w-full'}>
				<Rainbow className={'w-full'} />
			</div>

			<Component
				className={'z-10'}
				key={router.pathname}
				router={props.router}
				{...pageProps}
			/>
		</React.Fragment>
	);
}

export default AppWrapper;
