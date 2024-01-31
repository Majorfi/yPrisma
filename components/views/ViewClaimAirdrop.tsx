import React, {useCallback, useState} from 'react';
import {ClaimEarlyAirdrop} from 'components/ClaimEarlyAirdrop';
import {ClaimVECRVAirdrop} from 'components/ClaimVECRVAirdrop';
import {AddressChecker} from 'components/common/AddressChecker';
import {defaultInputAddressLike} from 'components/common/AddressInput';
import {SuccessModal} from 'components/common/SuccessClaimAIirdropModal';
import {type Hex} from 'viem';
import axios from 'axios';
import {cl, toAddress} from '@builtbymom/web3/utils';
import {useMountEffect} from '@react-hookz/web';

import type {TInputAddressLike} from 'components/common/AddressInput';
import type {ReactElement} from 'react';
import type {TDict} from '@yearn-finance/web-lib/types';

type TClaim = {
	amount: Hex;
	index: number;
	proof: [Hex[], Hex[]];
};

export function ViewClaimAirdrop(): ReactElement {
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
		<section className={'p-6 pt-0 md:p-10 md:pt-4'}>
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
