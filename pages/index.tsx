import React, {useEffect, useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {useSearchParams} from 'next/navigation';
import {Stake} from 'components/common/FarmWithToken';
import {ImageWithFallback} from 'components/common/ImageWithFallback';
import {StakeBanner} from 'components/common/StakeBanner';
import IconChevronBoth from 'components/icons/IconChevronBoth';
import {AboutCopy, AboutFarming, AboutHeading} from 'components/views/ViewAbout';
import {ViewFarm} from 'components/views/ViewFarm';
import {ViewMigrationModal} from 'components/views/ViewMigrationModal';
import {useYLockers} from 'contexts/useLockers';
import {AVAILABLE_FARMS} from 'utils/constants';
import {cl} from '@yearn-finance/web-lib/utils/cl';
import {formatAmount} from '@yearn-finance/web-lib/utils/format.number';

import type {ReactElement} from 'react';
import type {TAvailableFarm} from 'utils/constants';

function FarmCard({farmArgs, farmIndex}: {farmArgs: TAvailableFarm; farmIndex: number}): ReactElement {
	const pathname = useSearchParams();
	const {APRs} = useYLockers();
	const [tab, set_tab] = useState(0);

	return (
		<span>
			<section className={'flex overflow-hidden rounded-xl bg-neutral-100'}>
				<div className={'flex w-full flex-col'}>
					<div className={'flex w-full flex-row items-center justify-between p-4 md:p-6'}>
						<div className={'grid h-12 gap-2'}>
							<p className={'text-xs text-neutral-600/60'}>{'Staking token'}</p>
							<b className={'inline-flex items-center gap-2 text-lg text-neutral-900'}>
								<ImageWithFallback
									alt={farmArgs.stakingTokenName}
									src={`https://assets.smold.app/api/token/1/${farmArgs.stakingToken}/logo-128.png`}
									width={40}
									height={40}
									className={'h-8 w-8'}
								/>
								{`${farmArgs.stakingTokenName}`}
							</b>
						</div>
						<div className={'flex h-12 items-center justify-center pt-4 text-lg '}>&#8594;</div>
						<div className={'grid h-12 gap-2'}>
							<p className={'text-xs text-neutral-600/60'}>{'Earning token'}</p>
							<b className={'inline-flex items-center gap-2 text-lg text-neutral-900'}>
								<ImageWithFallback
									alt={farmArgs.rewardTokenName}
									src={`https://assets.smold.app/api/token/1/${farmArgs.rewardToken}/logo-128.png`}
									width={40}
									height={40}
									className={'h-8 w-8'}
								/>
								{`${farmArgs.rewardTokenName}`}
							</b>
						</div>
					</div>

					<div className={'flex w-full flex-col bg-neutral-100'}>
						<nav className={'grid grid-cols-3 justify-between gap-2 border-t border-neutral-200/60 p-4'}>
							<button
								onClick={(): void => set_tab(0)}
								className={cl(
									'px-4 rounded-lg text-center transition-colors cursor-pointer p-2 w-full',
									tab === 0 ? 'bg-neutral-200' : 'bg-neutral-200/0 hover:bg-neutral-200'
								)}>
								<p>{`Stake`}</p>
							</button>
							<button
								onClick={(): void => set_tab(1)}
								className={cl(
									'px-4 rounded-lg text-center transition-colors cursor-pointer p-2 w-full',
									tab === 1 ? 'bg-neutral-200' : 'bg-neutral-200/0 hover:bg-neutral-200'
								)}>
								<p>{`Claim`}</p>
							</button>
							<button
								onClick={(): void => set_tab(2)}
								className={cl(
									'px-4 rounded-lg text-center transition-colors cursor-pointer p-2 w-full',
									tab === 2 ? 'bg-neutral-200' : 'bg-neutral-200/0 hover:bg-neutral-200'
								)}>
								<p>{`Unstake`}</p>
							</button>
						</nav>

						<div className={'flex flex-col gap-2 p-4 md:p-6'}>
							<Stake
								APR={APRs[farmIndex]}
								tab={
									pathname.get('tab') === `unstake-${farmArgs.slug}`
										? `unstake-${farmArgs.slug}`
										: `stake-${farmArgs.slug}`
								}
								{...AVAILABLE_FARMS[farmIndex]}
							/>
						</div>
					</div>

					<details>
						<summary
							className={
								'group flex cursor-pointer flex-col gap-2 border-t border-neutral-200 bg-neutral-100 p-4 md:p-6'
							}>
							<div className={'flex w-full items-baseline justify-between'}>
								<p className={'text-xs text-neutral-900/60 md:text-base'}>{'Details'}</p>
								<div className={'font-number flex items-center text-lg font-bold leading-6'}>
									<IconChevronBoth
										className={
											'-mr-2 ml-2 h-4 w-4 text-neutral-900/40 transition-colors group-hover:text-neutral-900'
										}
									/>
								</div>
							</div>
						</summary>

						<dl className={'flex flex-col gap-2 bg-neutral-200/60 p-4'}>
							<div className={'flex w-full items-baseline justify-between'}>
								<dt className={'text-xs text-neutral-900/60 md:text-base'}>{`Fancy APR`}</dt>
								<dd
									suppressHydrationWarning
									className={'bg-clip-text text-lg font-bold text-transparent contrast-200'}
									style={{
										backgroundImage:
											'-webkit-linear-gradient(0deg, rgba(219,110,55,1) 20%, rgba(236,184,64,1) 40%, rgba(104,183,120,1) 60%, rgba(71,119,211,1) 80%, rgba(72,44,216,1) 100%)'
									}}>
									{`${formatAmount(APRs[farmIndex] || 0, 2, 2)} %`}
								</dd>
							</div>
							<div className={'flex w-full items-baseline justify-between'}>
								<dt className={'text-xs text-neutral-900/60 md:text-base'}>{`Available`}</dt>
								<dd className={'font-number text-sm font-bold md:text-base'}>
									{formatAmount(0 || 0, 6, 6)}
								</dd>
							</div>

							<div className={'flex w-full items-baseline justify-between'}>
								<dt className={'text-xs text-neutral-900/60 md:text-base'}>{`Staked`}</dt>
								<dd className={'font-number text-sm font-bold md:text-base'}>
									{formatAmount(75 || 0, 6, 6)}
								</dd>
							</div>

							<div className={'flex w-full items-baseline justify-between'}>
								<dt className={'text-xs text-neutral-900/60 md:text-base'}>{`Earned`}</dt>
								<dd>
									<b className={'font-number block text-sm md:text-base'}>
										{formatAmount(0.005 || 0, 6, 6)}
									</b>
									<small className={'font-number block text-right text-xs text-neutral-900/60'}>
										{`$ ${formatAmount(6, 2, 2)}`}
									</small>
								</dd>
							</div>
						</dl>
					</details>
				</div>
			</section>
		</span>
	);
}

function Index(): ReactElement {
	const [selected, set_selected] = useState<number>(0);
	const pathname = useSearchParams();
	const {APRs, biggestAPR} = useYLockers();

	useEffect((): void => {
		const currentTab = pathname.get('tab');
		for (const farm of AVAILABLE_FARMS) {
			if (currentTab?.includes(`-${farm.slug}`)) {
				set_selected(farm.tabIndex - 1);
				return;
			}
		}
	}, [pathname]);

	function renderAvailableFarms(): ReactElement {
		const allFarms = AVAILABLE_FARMS;
		let farmIndex = selected;
		if (!allFarms[farmIndex]) {
			farmIndex = 0;
		}
		const farmArgs = AVAILABLE_FARMS[farmIndex];

		return (
			<ViewFarm
				key={farmArgs.slug}
				APR={APRs[farmIndex]}
				currentTab={
					pathname.get('tab') === `unstake-${farmArgs.slug}`
						? `unstake-${farmArgs.slug}`
						: `stake-${farmArgs.slug}`
				}
				farmArgs={AVAILABLE_FARMS[farmIndex]}
			/>
		);
	}

	function renderAvailableFarms2(): ReactElement[] {
		return AVAILABLE_FARMS.map(
			(farmArgs, farmIndex): ReactElement => (
				<FarmCard
					key={farmArgs.slug}
					farmArgs={farmArgs}
					farmIndex={farmIndex}
				/>
			)
		);
	}

	return (
		<div className={'relative mx-auto mb-0 flex w-full flex-col bg-neutral-0 pt-6'}>
			<div className={'relative mx-auto mt-6 w-screen max-w-6xl pb-40 '}>
				<header>
					<div className={'grid grid-cols-1 gap-0 pb-6 md:hidden'}>
						<AboutHeading />
						<div className={'mt-6'}>
							<StakeBanner APR={biggestAPR} />
						</div>
					</div>
					<div className={'hidden grid-cols-12 gap-0 md:grid md:pt-12'}>
						<div className={'col-span-12 md:col-span-8 md:mb-0 md:pr-20'}>
							<div className={'mb-10 flex flex-col justify-center'}>
								<AboutHeading />
							</div>
							<div className={'mb-8 border-neutral-200 py-2 text-neutral-700 md:border-l-4 md:pl-6'}>
								{/* <AboutYPrisma /> */}
								<AboutFarming />
							</div>
							<div className={'mb-4 hidden md:block'}>
								<StakeBanner APR={biggestAPR} />
							</div>
						</div>

						<div className={'relative col-span-12 hidden flex-col items-center md:col-span-4 md:flex'}>
							<Image
								priority
								alt={''}
								src={'./prisma.svg'}
								width={400}
								height={400}
							/>
						</div>
					</div>
				</header>

				<div className={'grid grid-cols-3 gap-6'}>{renderAvailableFarms2()}</div>

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
								{AVAILABLE_FARMS.map(
									(farm): ReactElement => (
										<option
											key={farm.slug}
											value={farm.tabIndex - 1}>
											{`Farm with ${farm.stakingTokenName}`}
										</option>
									)
								)}
							</select>
						</div>
						<div className={'hidden flex-row gap-6 md:flex'}>
							{AVAILABLE_FARMS.map(
								(farm): ReactElement => (
									<Link
										key={farm.slug}
										href={`/?tab=stake-${farm.slug}`}
										scroll={false}
										replace
										shallow>
										<button
											onClick={(): void => set_selected(farm.tabIndex - 1)}
											className={cl(
												'px-4 rounded-lg text-center transition-colors cursor-pointer p-2 w-max',
												selected === farm.tabIndex - 1
													? 'bg-neutral-200'
													: 'bg-neutral-200/0 hover:bg-neutral-200'
											)}>
											<p>{`Farm with ${farm.stakingTokenName}`}</p>
											<p
												suppressHydrationWarning
												className={'text-sm opacity-60'}>
												{`${formatAmount(APRs[farm.tabIndex - 1])}% APR`}
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
