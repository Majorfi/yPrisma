import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {StakeBanner} from 'components/common/StakeBanner';

import type {ReactElement} from 'react';

export function AboutFarmHeading(): ReactElement {
	return (
		<h1 className={'mt-6 block text-3xl font-black md:text-5xl'}>
			<span
				className={'bg-clip-text text-transparent'}
				style={{
					backgroundImage:
						'-webkit-linear-gradient(0deg, rgba(200,25,40,1) 0%, rgba(219,110,55,1) 20%, rgba(236,184,64,1) 40%, rgba(104,183,120,1) 60%, rgba(71,119,211,1) 80%, rgba(72,44,216,1) 100%)'
				}}>
				{'Farmin’'}
			</span>
			{' Season is Over'}
		</h1>
	);
}

export function AboutHeading(): ReactElement {
	return (
		<h1 className={'mt-6 block text-3xl font-black md:text-5xl'}>
			{"Prisma has been unleashed.\nNow let's get it "}
			<span
				className={'bg-clip-text text-transparent'}
				style={{
					backgroundImage:
						'-webkit-linear-gradient(0deg, rgba(200,25,40,1) 0%, rgba(219,110,55,1) 20%, rgba(236,184,64,1) 40%, rgba(104,183,120,1) 60%, rgba(71,119,211,1) 80%, rgba(72,44,216,1) 100%)'
				}}>
				{'unlocked'}
			</span>
			{'.'}
		</h1>
	);
}

export function AboutWhyYPrisma(): ReactElement {
	return (
		<div className={'p-6 pt-0 md:p-10 md:pt-4'}>
			<h3 className={'text-xl font-bold'}>{'Why would I claim my PRISMA as yPRISMA?'}</h3>
			<div className={'mt-2 flex flex-col space-y-2 text-neutral-900/80'}>
				<p>
					{
						'Good question anon. The Prisma airdrop comes as a locked position that cannot be transferred until the lock (of up to 1 year) expires.'
					}
				</p>
				<p>
					{
						"By claiming your airdrop using this page, you'll lock your full Prisma airdrop to Yearn in exchange for yPrisma which is (and will always be) transferrable and liquid."
					}
				</p>
				<p>{'yPrisma holders also receieve their share of Prisma protocol rewards. Noice.'}</p>
			</div>
		</div>
	);
}

export function AboutCopy({APR}: {APR: {value: number; index: number}}): ReactElement {
	return (
		<>
			<div className={'mb-8 border-neutral-200 py-2 text-neutral-700 md:border-l-4 md:pl-6'}>
				<div>
					<h3 className={'text-xl font-bold'}>{'Why would I claim my PRISMA as yPRISMA?'}</h3>
					<div className={'mt-2 flex flex-col space-y-2 text-neutral-900/80'}>
						<p>
							{
								'Good question anon. The Prisma airdrop comes as a locked position that cannot be transferred until the lock (of up to 1 year) expires.'
							}
						</p>
						<p>
							{
								"By claiming your airdrop using this page, you'll lock your full Prisma airdrop to Yearn in exchange for yPrisma which is (and will always be) transferrable and liquid."
							}
						</p>
						<p>{'yPrisma holders also receieve their share of Prisma protocol rewards. Noice.'}</p>
					</div>
				</div>

				<div className={'mt-10'}>
					<h3 className={'text-xl font-bold'}>{'Airdrops? Wut??'}</h3>
					<div className={'mt-2 text-neutral-900/80'}>
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
				<StakeBanner APR={APR} />
			</div>
		</>
	);
}

export function About({APR}: {APR: {value: number; index: number}}): ReactElement {
	return (
		<>
			<section className={'grid grid-cols-1 gap-0 pb-6 md:hidden'}>
				<AboutHeading />
				<div className={'mt-6'}>
					<StakeBanner APR={APR} />
				</div>
			</section>
			<section className={'hidden grid-cols-12 gap-0 md:grid md:pt-12'}>
				<div className={'col-span-12 md:col-span-8 md:mb-0 md:pr-20'}>
					<div className={'mb-10 flex flex-col justify-center'}>
						<AboutHeading />
					</div>
					<AboutCopy APR={APR} />
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
		</>
	);
}
