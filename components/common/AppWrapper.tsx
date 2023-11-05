import React from 'react';
import Header from 'components/common/Header';
import Meta from 'components/common/Meta';

import type {AppProps} from 'next/app';
import type {ReactElement} from 'react';

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

export default AppWrapper;
