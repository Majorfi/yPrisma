import React, {useEffect, useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {useSearchParams} from 'next/navigation';
import {StakeBanner} from 'components/common/StakeBanner';
import {AboutHeading, AboutWhyYPrisma} from 'components/views/ViewAbout';
import {ViewClaimAirdrop} from 'components/views/ViewClaimAirdrop';
import {ViewMigrationModal} from 'components/views/ViewMigrationModal';
import {useAPRs} from 'hooks/useAPRs';
import {AVAILABLE_FARMS} from 'utils/constants';
import {cl} from '@yearn-finance/web-lib/utils/cl';

import type {TUseAPRProps} from 'hooks/useAPRs';
import type {ReactElement} from 'react';

function Airdrop(): ReactElement {
	const [selected, set_selected] = useState<number>(0);
	const pathname = useSearchParams();
	const [, biggestAPR] = useAPRs(
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
		if (currentTab?.includes('about')) {
			set_selected(1);
			return;
		}
		set_selected(0);
	}, [pathname]);

	return (
		<div className={'relative mx-auto mb-0 flex w-full flex-col bg-neutral-0 pt-14'}>
			<div className={'relative mx-auto mt-6 w-screen max-w-6xl pb-40 '}>
				<section className={'grid grid-cols-12 gap-0 md:pt-12'}>
					<div className={'col-span-12 md:col-span-8 md:mb-0 md:pr-20'}>
						<div className={'mb-10 flex flex-col justify-center'}>
							<AboutHeading />
						</div>
						<div className={'mb-8 border-neutral-200 py-2 text-neutral-700 md:border-l-4 md:pl-6'}>
							<div>
								<h3 className={'text-xl font-bold'}>{'Airdrops? Wut??'}</h3>
								<div className={'mt-2 flex flex-col space-y-2 text-neutral-900/80'}>
									<p>
										{
											"Check if you're eligible for either of the two Prisma airdrops below, and if you're eligible you can lock your airdrop to Yearn and instantly receive yPrisma at a 1:1 rate."
										}
									</p>
									<p className={'mt-2'}>
										{
											'Converting Prisma to yPrisma is a one way transaction. Exchanging yPrisma back to Prisma can be done on secondary markets. Learn more on '
										}
										<Link
											className={'underline'}
											target={'_blank'}
											href={
												'https://docs.prismafinance.com/governance/prisma-locking-and-lock-weight#withdrawing-early-from-locked-positions'
											}>
											{"Prisma's docs."}
										</Link>
									</p>
								</div>
							</div>
						</div>
						<div className={'mb-4 hidden md:block'}>
							<StakeBanner APR={biggestAPR} />
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
								<option value={0}>{'Claim Airdrop'}</option>
								<option value={1}>{'Why yPrisma?'}</option>
							</select>
						</div>
						<div className={'hidden flex-row flex-wrap gap-6 md:flex'}>
							<Link
								href={`/airdrop?tab=claim`}
								scroll={false}
								replace
								shallow>
								<button
									className={cl(
										'px-4 rounded-lg text-center transition-colors cursor-pointer p-2 w-max',
										selected === 0 ? 'bg-neutral-200' : 'bg-neutral-200/0 hover:bg-neutral-200'
									)}>
									<p className={'text-sm'}>{'Claim Prisma Airdrop'}</p>
								</button>
							</Link>
							<Link
								href={`/airdrop?tab=about`}
								scroll={false}
								replace
								shallow>
								<button
									className={cl(
										'px-4 rounded-lg text-center transition-colors cursor-pointer p-2 w-max',
										selected === 1 ? 'bg-neutral-200' : 'bg-neutral-200/0 hover:bg-neutral-200'
									)}>
									<p className={'text-sm'}>{'Why yPrisma?'}</p>
								</button>
							</Link>
						</div>
						<ViewMigrationModal />
					</nav>

					{selected === 0 && <ViewClaimAirdrop />}
					{selected === 1 && <AboutWhyYPrisma />}
				</div>
			</div>
		</div>
	);
}

export default Airdrop;
