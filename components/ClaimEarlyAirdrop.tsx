import React, {useCallback, useState} from 'react';
import {PRISMA_AIRDROP_DISTRIBUTOR_ABI} from 'utils/abi/distributor.abi';
import {claimEarlyAirdrop} from 'utils/actions';
import {DEFAULT_CHAIN_ID, EARLY_AIRDROP_ADDRESS} from 'utils/constants';
import {type Hex, hexToNumber} from 'viem';
import {useContractRead} from 'wagmi';
import {useWeb3} from '@builtbymom/web3/contexts/useWeb3';
import {toBigInt} from '@builtbymom/web3/utils';
import {defaultTxStatus} from '@builtbymom/web3/utils/wagmi';
import {Button} from '@yearn-finance/web-lib/components/Button';

import {Counter} from './common/AmountCounter';

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
		chainId: DEFAULT_CHAIN_ID,
		functionName: 'merkleRoot',
		select: (data): boolean => data !== `0x0000000000000000000000000000000000000000000000000000000000000000`,
		watch: true
	});

	const {data: isClaimed, refetch} = useContractRead({
		address: EARLY_AIRDROP_ADDRESS,
		abi: PRISMA_AIRDROP_DISTRIBUTOR_ABI,
		chainId: DEFAULT_CHAIN_ID,
		functionName: 'isClaimed',
		args: [toBigInt(props.claim?.index || 0n)],
		enabled: !!props.claim
	});

	const onClaimEarlyAirdrop = useCallback(async (): Promise<void> => {
		if (!provider) {
			return openLoginModal();
		}
		if (!props.claim) {
			return;
		}
		const result = await claimEarlyAirdrop({
			connector: provider,
			chainID: DEFAULT_CHAIN_ID,
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
		<div className={'flex flex-col items-center rounded-lg bg-neutral-100 p-2 md:p-6'}>
			<p className={'my-4 text-center md:my-10'}>
				<b className={'font-number text-xl text-neutral-900 md:text-6xl'}>
					<Counter value={Number(hexToNumber(props.claim?.amount || '0x0') || 0)} />
				</b>
				<span className={'block pt-2 text-xs text-neutral-900/60 md:text-base'}>
					{'yPrisma because you are an OG'}
				</span>
			</p>
			<div className={'flex flex-col gap-4 md:flex-row'}>
				<Button
					className={'min-w-[200px] border-none'}
					isBusy={txStatus.pending}
					isDisabled={!props.claim || !props.hasCheckedEligibility || isClaimed || !isAlive}
					onClick={onClaimEarlyAirdrop}>
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
	);
}

export {ClaimEarlyAirdrop};
