import React from 'react';
import {FarmWithToken} from 'components/common/FarmWithToken';

import type {ReactElement} from 'react';
import type {TAvailableFarm} from 'utils/constants';

type TSectionStake = {
	currentTab: string;
	farmArgs: TAvailableFarm;
};
export function ViewFarm({currentTab, farmArgs}: TSectionStake): ReactElement {
	return (
		<section className={'p-6 pt-0 md:p-10 md:pt-4'}>
			<div className={'grid grid-cols-1 gap-y-20 md:grid-cols-3 md:gap-y-6'}>
				<FarmWithToken
					tab={currentTab}
					{...farmArgs}
				/>
			</div>
		</section>
	);
}
