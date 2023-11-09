import React from 'react';
import {FarmWithToken} from 'components/common/FarmWithToken';
import {YPRISMA_ADDRESS, YPRISMA_REWARD_TOKEN_ADDRESS, YPRISMA_STAKING_ADDRESS} from 'utils/constants';

import type {ReactElement} from 'react';

type TSectionStake = {
	APR: number;
	currentTab: string;
};
export function SectionStakeYPrisma({APR, currentTab}: TSectionStake): ReactElement {
	return (
		<section className={'p-6 pt-0 md:p-10 md:pt-4'}>
			<div className={'grid grid-cols-1 gap-y-20 md:grid-cols-3 md:gap-y-6'}>
				<FarmWithToken
					APR={APR}
					tab={currentTab}
					stakingContract={YPRISMA_STAKING_ADDRESS}
					stakingToken={YPRISMA_ADDRESS}
					stakingTokenName={'yPrisma'}
					rewardToken={YPRISMA_REWARD_TOKEN_ADDRESS}
					rewardTokenName={'wstETH'}
					slug={'yprisma'}
				/>
			</div>
		</section>
	);
}
