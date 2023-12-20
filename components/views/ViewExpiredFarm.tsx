import React from 'react';
import {ExpiredFarmWithToken} from 'components/common/FarmWithToken.expired';

import type {ReactElement} from 'react';
import type {TAvailableFarm} from 'utils/constants';

type TViewExpiredFarms = {
	currentTab: string;
	farmArgs: TAvailableFarm;
};
export function ViewExpiredFarm({currentTab, farmArgs}: TViewExpiredFarms): ReactElement {
	return (
		<section className={'p-6 pt-0 md:p-10 md:pt-4'}>
			<div className={'grid grid-cols-1 gap-y-20 md:grid-cols-3 md:gap-y-6'}>
				<ExpiredFarmWithToken
					tab={currentTab}
					{...farmArgs}
				/>
			</div>
		</section>
	);
}
