import React, {useCallback, useState} from 'react';
import {PRISMA_AIRDROP_DISTRIBUTOR_ABI} from 'utils/abi/distributor.abi';
import {claimVECRVAirdrop} from 'utils/actions';
import {DEFAULT_CHAIN_ID, VECRV_AIRDROP_ADDRESS} from 'utils/constants';
import {type Hex, hexToNumber} from 'viem';
import {useContractRead} from 'wagmi';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {toBigInt} from '@yearn-finance/web-lib/utils/format.bigNumber';
import {defaultTxStatus} from '@yearn-finance/web-lib/utils/web3/transaction';

import {Counter} from './common/AmountCounter';

import type {ReactElement} from 'react';

type TClaim = {
	amount: Hex;
	index: number;
	proof: [Hex[], Hex[]];
};

function ClaimVECRVAirdrop(props: {
	hasCheckedEligibility: boolean;
	claim: TClaim | undefined;
	onSuccess: VoidFunction;
}): ReactElement {
	const {provider, openLoginModal} = useWeb3();
	const [txStatus, set_txStatus] = useState(defaultTxStatus);

	const {data: isClaimed, refetch} = useContractRead({
		address: VECRV_AIRDROP_ADDRESS,
		abi: PRISMA_AIRDROP_DISTRIBUTOR_ABI,
		chainId: DEFAULT_CHAIN_ID,
		functionName: 'isClaimed',
		args: [toBigInt(props.claim?.index || 0n)],
		enabled: !!props.claim
	});

	const onClaimVECRVAirdrop = useCallback(async (): Promise<void> => {
		if (!provider) {
			return openLoginModal();
		}
		if (!props.claim) {
			return;
		}
		set_txStatus({...defaultTxStatus, pending: true});

		const result = await claimVECRVAirdrop({
			connector: provider,
			chainID: DEFAULT_CHAIN_ID,
			contractAddress: VECRV_AIRDROP_ADDRESS,
			index: toBigInt(props.claim.index),
			amount: toBigInt(hexToNumber(props.claim.amount || '0x0')),
			merkleProof: props.claim.proof,
			statusHandler: set_txStatus
		});
		if (result.isSuccessful) {
			refetch();
			props.onSuccess();
		}
	}, [openLoginModal, props, provider, refetch]);

	return (
		<div className={'mb-6 flex flex-col items-center rounded-lg bg-neutral-100 p-2 md:mb-0 md:p-6'}>
			<p className={'my-4 text-center md:my-10'}>
				<b className={'font-number text-xl text-neutral-900 md:text-6xl'}>
					<Counter value={Number(hexToNumber(props.claim?.amount || '0x0') || 0)} />
				</b>
				<span className={'block pt-2 text-xs text-neutral-900/60 md:text-base'}>
					{'yPrisma from your veCRV votes'}
				</span>
			</p>
			<div>
				<Button
					className={'min-w-[200px]'}
					isBusy={txStatus.pending}
					isDisabled={!props.claim || !props.hasCheckedEligibility}
					onClick={onClaimVECRVAirdrop}>
					{!provider
						? 'Connect Wallet'
						: !props.hasCheckedEligibility
						? 'Check eligibility first bro.'
						: props.claim
						? isClaimed
							? 'Already claimed'
							: `Claim as yPRISMA`
						: 'Oh no! You have nothing to claim'}
				</Button>
			</div>
		</div>
	);
}

export {ClaimVECRVAirdrop};
