import React, {Fragment, useCallback, useEffect, useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {useSearchParams} from 'next/navigation';
import {AddressChecker} from 'components/AddressChecker';
import {ClaimEarlyAirdrop} from 'components/ClaimEarlyAirdrop';
import {ClaimVECRVAirdrop} from 'components/ClaimVECRVAirdrop';
import {defaultInputAddressLike} from 'components/common/AddressInput';
import {SuccessModal} from 'components/Modal';
import {MigrateModal} from 'components/ModalMigrate';
import {StakeBanner} from 'components/StakeBanner';
import {StakeYPrisma} from 'components/StakeYPrisma';
import {useAPR} from 'hooks/useAPR';
import {DEFAULT_CHAIN_ID, YPRISMA_LEGACY_ADDRESS} from 'utils/actions';
import {type Hex} from 'viem';
import {erc20ABI, useContractRead} from 'wagmi';
import axios from 'axios';
import {useMountEffect} from '@react-hookz/web';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {cl} from '@yearn-finance/web-lib/utils/cl';
import {toBigInt, toNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';

import type {TInputAddressLike} from 'components/common/AddressInput';
import type {ReactElement} from 'react';
import type {TDict} from '@yearn-finance/web-lib/types';
import type {TNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';

type TClaim = {
	amount: Hex;
	index: number;
	proof: [Hex[], Hex[]];
};
function AboutHeading(): ReactElement {
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
function AboutCopy({APR}: {APR: number}): ReactElement {
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
function About({APR}: {APR: number}): ReactElement {
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

				<div className={'relative col-span-12 mb-16 hidden items-center justify-center md:col-span-4 md:flex'}>
					<Image
						priority
						alt={''}
						src={'./prisma.svg'}
						width={400}
						height={400}
					/>
				</div>
			</section>
		</>
	);
}

function SectionClaim(): ReactElement {
	const [receiver, set_receiver] = useState<TInputAddressLike>(defaultInputAddressLike);
	const [veCRVClaims, set_veCRVClaims] = useState<TDict<TClaim>>({});
	const [earlyClaims, set_earlyClaims] = useState<TDict<TClaim>>({});

	const [userVeCRVClaim, set_userVeCRVClaim] = useState<TClaim | undefined>(undefined);
	const [userEarlyClaim, set_userEarlyClaim] = useState<TClaim | undefined>(undefined);
	const [hasCheckedEligibility, set_hasCheckedEligibility] = useState<boolean>(false);
	const [isSuccessModalOpen, set_isSuccessModalOpen] = useState<boolean>(false);

	useMountEffect(async (): Promise<void> => {
		const veCRVProofsCall = axios.get(
			'https://raw.githubusercontent.com/prisma-fi/airdrop-proofs/airdrop-proxy/proofs/proof-0x3ea03249b4d68be92a8eda027c5ac12e6e419bee.json'
		);
		const earlyProofsCall = axios.get(
			'https://raw.githubusercontent.com/prisma-fi/airdrop-proofs/main/proofs/proof-0x2c533357664d8750e5f851f39b2534147f5578af.json'
		);

		try {
			const [veCRVProofs, earlyProofs] = await Promise.allSettled([veCRVProofsCall, earlyProofsCall]);
			if (veCRVProofs.status === 'fulfilled') {
				set_veCRVClaims(veCRVProofs.value.data.claims as TDict<TClaim>);
			}
			if (earlyProofs.status === 'fulfilled') {
				set_earlyClaims(earlyProofs.value.data.claims as TDict<TClaim>);
			}
		} catch (e) {
			console.error(e);
		}
	});

	const onCheckEligibility = useCallback((): void => {
		const veCRVProof = Object.entries(veCRVClaims).find(
			([address]): boolean => toAddress(address) === toAddress(receiver.address)
		);
		const earlyProof = Object.entries(earlyClaims).find(
			([address]): boolean => toAddress(address) === toAddress(receiver.address)
		);
		if (veCRVProof) {
			set_userVeCRVClaim(veCRVProof[1]);
		} else {
			set_userVeCRVClaim(undefined);
		}
		if (earlyProof) {
			set_userEarlyClaim(earlyProof[1]);
		} else {
			set_userEarlyClaim(undefined);
		}
		set_hasCheckedEligibility(true);
	}, [earlyClaims, veCRVClaims, receiver]);

	return (
		<section
			id={'stake'}
			className={'p-6 pt-0 md:p-10 md:pt-4'}>
			<AddressChecker
				onCheckEligibility={onCheckEligibility}
				receiver={receiver}
				set_receiver={(newReceiver): void => {
					set_receiver(newReceiver);
					set_hasCheckedEligibility(false);
				}}
			/>
			<div
				className={cl(
					'grid grid-cols-1 md:mt-10 md:grid-cols-2',
					'divide-y divide-neutral-300 md:divide-x md:divide-y-0'
				)}>
				<ClaimVECRVAirdrop
					hasCheckedEligibility={hasCheckedEligibility}
					claim={userVeCRVClaim}
					onSuccess={(): void => set_isSuccessModalOpen(true)}
				/>

				<ClaimEarlyAirdrop
					hasCheckedEligibility={hasCheckedEligibility}
					claim={userEarlyClaim}
					onSuccess={(): void => set_isSuccessModalOpen(true)}
				/>
			</div>
			<SuccessModal
				isOpen={isSuccessModalOpen}
				set_isOpen={set_isSuccessModalOpen}
			/>
		</section>
	);
}

function SectionStake({APR, currentTab}: {APR: number; currentTab: 'stake' | 'unstake' | 'claim'}): ReactElement {
	return (
		<section
			id={'stake'}
			className={'p-6 pt-0 md:p-10 md:pt-4'}>
			<div className={'grid grid-cols-1 gap-y-20 md:grid-cols-3 md:gap-y-6'}>
				<StakeYPrisma
					APR={APR}
					tab={currentTab}
				/>
			</div>
		</section>
	);
}

function MigrateLegacyPrisma(): ReactElement {
	const {address} = useWeb3();
	const [shouldDisplayMigrateModal, set_shouldDisplayMigrateModal] = useState<boolean>(false);

	const {data: legacyBalance, refetch} = useContractRead({
		address: YPRISMA_LEGACY_ADDRESS,
		abi: erc20ABI,
		chainId: DEFAULT_CHAIN_ID,
		functionName: 'balanceOf',
		args: [toAddress(address)],
		select: (data): TNormalizedBN => toNormalizedBN(data)
	});

	if (toBigInt(legacyBalance?.raw) === 0n) {
		return <Fragment />;
	}

	return (
		<>
			<div className={'relative'}>
				<span className={'absolute -right-1 -top-1 z-10 flex h-3 w-3'}>
					<span
						className={
							'absolute inline-flex h-full w-full animate-ping rounded-full bg-[rgb(236,184,64)] opacity-75'
						}
					/>
					<span className={'relative inline-flex h-3 w-3 rounded-full bg-[rgb(236,184,64)]'}></span>
				</span>
				<button
					onClick={(): void => set_shouldDisplayMigrateModal(true)}
					className={cl(
						'w-36 rounded-lg text-center transition-colors cursor-pointer p-1',
						'bg-neutral-200/0 hover:bg-neutral-200 border-2 border-neutral-200 h-10'
					)}>
					<p className={'whitespace-nowrap'}>{'Migrate'}</p>
				</button>
			</div>
			<MigrateModal
				isOpen={shouldDisplayMigrateModal}
				set_isOpen={set_shouldDisplayMigrateModal}
				balance={legacyBalance}
				refetchBalance={refetch}
			/>
		</>
	);
}

function Index(): ReactElement {
	const [selected, set_selected] = useState<number>(0);
	const pathname = useSearchParams();
	const APR = useAPR();

	useEffect((): void => {
		if (pathname.get('tab') === 'stake' || pathname.get('tab') === 'unstake' || pathname.get('tab') === 'claim') {
			set_selected(1);
		} else {
			set_selected(0);
		}
	}, [pathname]);

	return (
		<div className={'relative mx-auto mb-0 flex w-full flex-col bg-neutral-0 pt-14 md:pt-20'}>
			<div className={'relative mx-auto mt-6 w-screen max-w-6xl pb-40 '}>
				<About APR={APR} />

				<div className={'mt-4 rounded-xl bg-neutral-100'}>
					<nav
						className={
							'mb-3 flex flex-row justify-between gap-6 border-b border-neutral-200/60 p-4 px-6 md:px-10'
						}>
						<div className={'flex flex-row gap-6'}>
							<Link
								href={'/'}
								scroll={false}
								replace
								shallow>
								<button
									onClick={(): void => set_selected(0)}
									className={cl(
										'w-36 rounded-lg p-2 text-center transition-colors cursor-pointer',
										selected === 0 ? 'bg-neutral-200' : 'bg-neutral-200/0 hover:bg-neutral-200'
									)}>
									<p>{'Claim Airdrop'}</p>
								</button>
							</Link>
							<Link
								href={'/?tab=stake'}
								scroll={false}
								replace
								shallow>
								<button
									onClick={(): void => set_selected(1)}
									className={cl(
										'px-4 rounded-lg text-center transition-colors cursor-pointer p-2',
										selected === 1 ? 'bg-neutral-200' : 'bg-neutral-200/0 hover:bg-neutral-200'
									)}>
									<p>{'Farm with yPRISMA'}</p>
								</button>
							</Link>
						</div>
						<MigrateLegacyPrisma />
					</nav>

					{selected === 0 && <SectionClaim />}
					{selected === 1 && (
						<SectionStake
							APR={APR}
							currentTab={pathname.get('tab') === 'unstake' ? 'unstake' : 'stake'}
						/>
					)}
				</div>

				<div className={'mt-6 block px-2 md:hidden'}>
					<AboutCopy APR={APR} />
				</div>
			</div>
		</div>
	);
}

export default Index;
