import React, {useCallback, useState} from 'react';
import {PRISMA_AIRDROP_DISTRIBUTOR_ABI} from 'utils/abi/distributor.abi';
import {claimVECRVAirdrop, EARLY_AIRDROP_ADDRESS} from 'utils/actions';
import {type Hex, hexToNumber} from 'viem';
import {useContractRead} from 'wagmi';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {toBigInt} from '@yearn-finance/web-lib/utils/format.bigNumber';
import {defaultTxStatus} from '@yearn-finance/web-lib/utils/web3/transaction';

import {Counter} from './AmountCounter';

import type {ReactElement} from 'react';

type TClaim = {
	amount: Hex;
	index: number;
	proof: [Hex[], Hex[]];
};

function ClaimEarlyAirdrop(props: {
	hasCheckedEligibility: boolean;
	claim: TClaim | undefined;
	onSuccess: VoidFunction;
}): ReactElement {
	const {provider, openLoginModal} = useWeb3();
	const [txStatus, set_txStatus] = useState(defaultTxStatus);

	const {data: isAlive} = useContractRead({
		address: EARLY_AIRDROP_ADDRESS,
		abi: PRISMA_AIRDROP_DISTRIBUTOR_ABI,
		chainId: 1,
		functionName: 'merkleRoot',
		select: (data): boolean => data !== `0x0000000000000000000000000000000000000000000000000000000000000000`,
		watch: true
	});

	const {data: isClaimed, refetch} = useContractRead({
		address: EARLY_AIRDROP_ADDRESS,
		abi: PRISMA_AIRDROP_DISTRIBUTOR_ABI,
		chainId: 1,
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
		const result = await claimVECRVAirdrop({
			connector: provider,
			chainID: 1,
			contractAddress: EARLY_AIRDROP_ADDRESS,
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
		<div className={'pl-0 pt-2 md:pl-2 md:pt-0'}>
			<div className={'flex flex-col items-center rounded-lg bg-neutral-100 p-2 md:p-6'}>
				<p className={'my-4 text-center md:my-10'}>
					<b className={'font-number text-xl text-neutral-900 md:text-6xl'}>
						<Counter value={Number(hexToNumber(props.claim?.amount || '0x0') || 0)} />
					</b>
					<span className={'block pt-2 text-xs text-neutral-900/60 md:text-base'}>
						{'yPrisma because you are an OG'}
					</span>
				</p>
				<div>
					<Button
						className={'min-w-[200px]'}
						isBusy={txStatus.pending}
						isDisabled={!props.claim || !props.hasCheckedEligibility}
						onClick={onClaimVECRVAirdrop}>
						{!isAlive
							? 'OG Airdrop is not live yet'
							: !provider
							? 'Connect Wallet'
							: !props.hasCheckedEligibility
							? 'Check eligibility first bro.'
							: props.claim
							? isClaimed
								? 'Already claimed'
								: `Claim`
							: 'Oh no! You have nothing to claim'}
					</Button>
				</div>
			</div>
		</div>
	);
}

export {ClaimEarlyAirdrop};
