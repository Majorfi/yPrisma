import React, {useEffect, useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {useSearchParams} from 'next/navigation';
import {ImageWithFallback} from 'components/common/ImageWithFallback';
import {AboutFarmHeading} from 'components/views/ViewAbout';
import {ViewFarm} from 'components/views/ViewFarm';
import {ViewMigrationModal} from 'components/views/ViewMigrationModal';
import {useAPRs} from 'hooks/useAPRs';
import {AVAILABLE_FARMS} from 'utils/constants';
import {cl} from '@yearn-finance/web-lib/utils/cl';
import {formatAmount} from '@yearn-finance/web-lib/utils/format.number';

import type {TUseAPRProps} from 'hooks/useAPRs';
import type {ReactElement} from 'react';

function Index(): ReactElement {
	const [selected, set_selected] = useState<number>(0);
	const pathname = useSearchParams();
	const [APRS] = useAPRs(
		AVAILABLE_FARMS.map(
			(farm): TUseAPRProps => ({
				stakingContract: farm.stakingContract,
				stakingToken: farm.stakingToken,
				rewardToken: farm.rewardToken
			})
		)
	);

	useEffect((): void => {
		const currentTab = pathname.get('tab');
		for (const farm of AVAILABLE_FARMS) {
			if (currentTab?.includes(`-${farm.slug}`)) {
				set_selected(farm.tabIndex);
				return;
			}
		}
		set_selected(1);
	}, [pathname]);

	function renderAvailableFarms(): ReactElement {
		const allFarms = AVAILABLE_FARMS;
		let farmIndex = selected - 1;
		if (selected === 0 || !allFarms[farmIndex]) {
			farmIndex = 0;
		}

		const farmArgs = AVAILABLE_FARMS[farmIndex];
		return (
			<ViewFarm
				key={farmArgs.slug}
				APR={APRS[farmIndex]}
				currentTab={
					pathname.get('tab') === `unstake-${farmArgs.slug}`
						? `unstake-${farmArgs.slug}`
						: `stake-${farmArgs.slug}`
				}
				farmArgs={AVAILABLE_FARMS[farmIndex]}
			/>
		);
	}

	return (
		<div className={'relative mx-auto mb-0 flex w-full flex-col bg-neutral-0 pt-14'}>
			<div className={'relative mx-auto mt-6 w-screen max-w-6xl pb-40 '}>
				<section className={'grid grid-cols-12 gap-0 md:pt-12'}>
					<div className={'col-span-12 md:col-span-8 md:mb-0 md:pr-20'}>
						<div className={'mb-10 flex flex-col justify-center'}>
							<AboutFarmHeading />
						</div>
						<div className={'mb-8 border-neutral-200 py-2 text-neutral-700 md:border-l-4 md:pl-6'}>
							<div>
								<h3 className={'text-xl font-bold'}>{"Yearn's vePRISMA, your yield."}</h3>
								<div className={'mt-2 flex flex-col space-y-2 text-neutral-900/80'}>
									<p>
										{
											"Deposit yPRISMA to this staking contract to collect yield from Yearn's vePRISMA position. This includes protocol fees and bribe yield from incenvtive voting."
										}
									</p>
									<p>
										{
											"Note: this farm will eventually be superceeded by Yearn's permanant staking contract which is scheduled for audit. Find information "
										}
										<Link
											href={'https://medium.com/iearn/yprisma-roadmap-8fb3e2376594'}
											target={'_blank'}
											rel={'noopener noreferrer'}
											className={'underline'}>
											{'here'}
										</Link>
										{'.'}
									</p>
								</div>
							</div>
						</div>
					</div>
					<div className={'relative col-span-12 hidden items-start justify-center md:col-span-4 md:flex'}>
						<Image
							priority
							alt={''}
							src={'./prisma.svg'}
							width={300}
							height={300}
						/>
					</div>
				</section>

				<div className={'mt-6 rounded-xl bg-neutral-100'}>
					<nav
						className={
							'mb-3 flex flex-row justify-between gap-6 border-b border-neutral-200/60 p-4 px-6 md:px-10'
						}>
						<div className={'flex w-full flex-row gap-6 md:hidden'}>
							<select
								value={selected}
								onChange={(e): void => set_selected(Number(e.target.value))}
								className={'w-full border-none bg-transparent'}>
								{AVAILABLE_FARMS.map(
									(farm): ReactElement => (
										<option
											key={farm.slug}
											value={farm.tabIndex}>
											{`Farm ${farm.rewardTokenName} with ${farm.stakingTokenName}`}
										</option>
									)
								)}
							</select>
						</div>
						<div className={'hidden flex-row flex-wrap gap-6 md:flex'}>
							{AVAILABLE_FARMS.map(
								(farm): ReactElement => (
									<Link
										key={farm.slug}
										href={`/?tab=stake-${farm.slug}`}
										scroll={false}
										replace
										shallow>
										<button
											className={cl(
												'px-4 rounded-lg text-center transition-colors cursor-pointer p-2 w-max',
												selected === farm.tabIndex
													? 'bg-neutral-200'
													: 'bg-neutral-200/0 hover:bg-neutral-200'
											)}>
											<p className={'text-sm'}>
												<span className={'text-neutral-900/60'}>{'Stake '}</span>
												<b>{farm.stakingTokenName}</b>
												<span className={'text-neutral-900/60'}>{', earn '}</span>
												<b>{farm.rewardTokenName}</b>
											</p>
											<div className={'mt-2 flex items-center justify-between space-x-4'}>
												<div className={'flex gap-2'}>
													<ImageWithFallback
														alt={farm.stakingTokenName}
														className={'h-6 w-6'}
														width={24}
														height={24}
														src={`${process.env.SMOL_ASSETS_URL}/token/1/${farm.stakingToken}/logo-32.png`}
														loading={'eager'}
														priority
													/>
													&rarr;
													<ImageWithFallback
														alt={farm.rewardTokenName}
														className={'h-6 w-6'}
														width={24}
														height={24}
														src={`${process.env.SMOL_ASSETS_URL}/token/1/${
															'0x4591dbff62656e7859afe5e45f6f47d3669fbb28' ||
															farm.rewardToken
														}/logo-32.png`}
														loading={'eager'}
														priority
													/>
												</div>
												<p
													suppressHydrationWarning
													className={'text-sm opacity-60'}>
													{`${formatAmount(APRS[farm.tabIndex - 1])}% APR`}
												</p>
											</div>
										</button>
									</Link>
								)
							)}
						</div>
						<ViewMigrationModal />
					</nav>

					{renderAvailableFarms()}
				</div>
			</div>
		</div>
	);
}

export default Index;
