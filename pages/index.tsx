import React, {useCallback, useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {AddressChecker} from 'components/AddressChecker';
import {ClaimEarlyAirdrop} from 'components/ClaimEarlyAirdrop';
import {ClaimVECRVAirdrop} from 'components/ClaimVECRVAirdrop';
import {defaultInputAddressLike} from 'components/common/AddressInput';
import {SuccessModal} from 'components/Modal';
import {type Hex} from 'viem';
import axios from 'axios';
import {useMountEffect} from '@react-hookz/web';
import {toAddress} from '@yearn-finance/web-lib/utils/address';

import type {TInputAddressLike} from 'components/common/AddressInput';
import type {ReactElement} from 'react';
import type {TDict} from '@yearn-finance/web-lib/types';

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
function AboutCopy(): ReactElement {
	return (
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
	);
}
function About(): ReactElement {
	return (
		<>
			<section className={'grid grid-cols-1 gap-0 pb-6 md:hidden'}>
				<AboutHeading />
			</section>
			<section className={'hidden grid-cols-12 gap-0 md:grid md:pt-12'}>
				<div className={'col-span-12 md:col-span-8 md:mb-0 md:pr-20'}>
					<div className={'mb-10 flex flex-col justify-center'}>
						<AboutHeading />
					</div>

					<AboutCopy />
				</div>

				<div className={'relative col-span-12 mb-16 hidden items-center justify-center md:col-span-4 md:flex'}>
					<Image
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

function Index(): ReactElement {
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
		<div className={'relative mx-auto mb-0 flex min-h-screen w-full flex-col pt-14 md:pt-20'}>
			<div className={'relative mx-auto mt-6 w-screen max-w-6xl pb-40'}>
				<About />

				<section className={'mt-4 rounded-3xl bg-neutral-100 p-6 md:p-10'}>
					<AddressChecker
						onCheckEligibility={onCheckEligibility}
						receiver={receiver}
						set_receiver={(newReceiver): void => {
							set_receiver(newReceiver);
							set_hasCheckedEligibility(false);
						}}
					/>
					<div
						className={
							'mt-6 grid grid-cols-1 divide-y divide-neutral-300 md:mt-10 md:grid-cols-2 md:divide-x md:divide-y-0'
						}>
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
					<div className={'mt-4 hidden text-center'}>
						<small className={'block text-neutral-800/60'}>
							{
								'Converting PRISMA to yPRISMA is irreversible. You may stake, transfer, swap your yPRISMA tokens, but not convert them back to PRISMA. Secondary markets exist to allow the exchange of yPRISMA for PRISMA at market rates.'
							}
						</small>
					</div>
				</section>

				<div className={'mt-6 block px-2 md:hidden'}>
					<AboutCopy />
				</div>
			</div>
			<SuccessModal
				isOpen={isSuccessModalOpen}
				set_isOpen={set_isSuccessModalOpen}
			/>
		</div>
	);
}

export default Index;
