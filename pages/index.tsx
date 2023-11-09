import React, {useEffect, useState} from 'react';
import Link from 'next/link';
import {useSearchParams} from 'next/navigation';
import {About, AboutCopy} from 'components/views/ViewAbout';
import {ViewClaimAirdrop} from 'components/views/ViewClaimAirdrop';
import {ViewFarm} from 'components/views/ViewFarm';
import {ViewMigrationModal} from 'components/views/ViewMigrationModal';
import {useAPRs} from 'hooks/useAPRs';
import {
	AVAILABLE_FARMS,
	YCRV_ADDRESS,
	YCRV_STAKING_ADDRESS,
	YPRISMA_ADDRESS,
	YPRISMA_REWARD_TOKEN_ADDRESS,
	YPRISMA_STAKING_ADDRESS
} from 'utils/constants';
import {cl} from '@yearn-finance/web-lib/utils/cl';
import {formatAmount} from '@yearn-finance/web-lib/utils/format.number';

import type {ReactElement} from 'react';

function Index(): ReactElement {
	const [selected, set_selected] = useState<number>(0);
	const pathname = useSearchParams();
	const [APRS, biggestAPR] = useAPRs([
		{
			stakingContract: YPRISMA_STAKING_ADDRESS,
			stakingToken: YPRISMA_ADDRESS,
			rewardToken: YPRISMA_REWARD_TOKEN_ADDRESS
		},
		{
			stakingContract: YCRV_STAKING_ADDRESS,
			stakingToken: YCRV_ADDRESS,
			rewardToken: YPRISMA_ADDRESS
		}
	]);

	useEffect((): void => {
		const currentTab = pathname.get('tab');
		for (const farm of AVAILABLE_FARMS) {
			if (currentTab?.includes(`-${farm.slug}`)) {
				set_selected(farm.tabIndex);
				return;
			}
		}
		set_selected(0);
	}, [pathname]);

	function renderAvailableFarms(): ReactElement {
		const allFarms = AVAILABLE_FARMS;
		const farmIndex = selected - 1;
		if (selected === 0 || !allFarms[farmIndex]) {
			return <ViewClaimAirdrop />;
		}

		const farmArgs = AVAILABLE_FARMS[selected - 1];
		return (
			<ViewFarm
				key={farmArgs.slug}
				APR={APRS[farmIndex]}
				currentTab={
					pathname.get('tab') === `unstake-${farmArgs.slug}`
						? `unstake-${farmArgs.slug}`
						: `stake-${farmArgs.slug}`
				}
				farmArgs={AVAILABLE_FARMS[selected - 1]}
			/>
		);
	}

	return (
		<div className={'relative mx-auto mb-0 flex w-full flex-col bg-neutral-0 pt-14 md:pt-20'}>
			<div className={'relative mx-auto mt-6 w-screen max-w-6xl pb-40 '}>
				<About APR={biggestAPR} />

				<div className={'mt-4 rounded-xl bg-neutral-100'}>
					<nav
						className={
							'mb-3 flex flex-row justify-between gap-6 border-b border-neutral-200/60 p-4 px-6 md:px-10'
						}>
						<div className={'flex w-full flex-row gap-6 md:hidden'}>
							<select
								value={selected}
								onChange={(e): void => set_selected(Number(e.target.value))}
								className={'w-full border-none bg-transparent'}>
								<option value={0}>{'Claim Airdrop'}</option>
								{AVAILABLE_FARMS.map(
									(farm): ReactElement => (
										<option
											key={farm.slug}
											value={farm.tabIndex}>{`Farm with ${farm.stakingTokenName}`}</option>
									)
								)}
							</select>
						</div>
						<div className={'hidden flex-row gap-6 md:flex'}>
							<Link
								href={'/'}
								scroll={false}
								replace
								shallow>
								<button
									onClick={(): void => set_selected(0)}
									className={cl(
										'w-36 rounded-lg p-2 text-center transition-colors cursor-pointer h-full',
										selected === 0 ? 'bg-neutral-200' : 'bg-neutral-200/0 hover:bg-neutral-200'
									)}>
									<p>{'Claim Airdrop'}</p>
								</button>
							</Link>
							{AVAILABLE_FARMS.map(
								(farm): ReactElement => (
									<Link
										key={farm.slug}
										href={`/?tab=stake-${farm.slug}`}
										scroll={false}
										replace
										shallow>
										<button
											onClick={(): void => set_selected(1)}
											className={cl(
												'px-4 rounded-lg text-center transition-colors cursor-pointer p-2 w-max',
												selected === farm.tabIndex
													? 'bg-neutral-200'
													: 'bg-neutral-200/0 hover:bg-neutral-200'
											)}>
											<p>{`Farm with ${farm.stakingTokenName}`}</p>
											<p className={'text-sm opacity-60'}>
												{`${formatAmount(APRS[farm.tabIndex - 1])}% APR`}
											</p>
										</button>
									</Link>
								)
							)}
						</div>
						<ViewMigrationModal />
					</nav>

					{renderAvailableFarms()}
				</div>

				<div className={'mt-6 block px-2 md:hidden'}>
					<AboutCopy APR={biggestAPR} />
				</div>
			</div>
		</div>
	);
}

export default Index;
