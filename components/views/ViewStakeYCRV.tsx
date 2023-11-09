import React from 'react';
import {FarmWithToken} from 'components/common/FarmWithToken';
import {YCRV_ADDRESS, YCRV_STAKING_ADDRESS, YPRISMA_ADDRESS} from 'utils/constants';

import type {ReactElement} from 'react';

type TSectionStake = {
	APR: number;
	currentTab: string;
};
export function SectionStakeYCRV({APR, currentTab}: TSectionStake): ReactElement {
	return (
		<section
			id={'stake'}
			className={'p-6 pt-0 md:p-10 md:pt-4'}>
			<div className={'grid grid-cols-1 gap-y-20 md:grid-cols-3 md:gap-y-6'}>
				<FarmWithToken
					APR={APR}
					tab={currentTab}
					stakingContract={YCRV_STAKING_ADDRESS}
					stakingToken={YCRV_ADDRESS}
					stakingTokenName={'yCRV'}
					rewardToken={YPRISMA_ADDRESS}
					rewardTokenName={'yPrisma'}
					slug={'ycrv'}
				/>
			</div>
		</section>
	);
}
