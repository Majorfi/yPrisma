import assert from 'assert';
import {handleTx, toWagmiProvider} from '@yearn-finance/web-lib/utils/wagmi/provider';
import {assertAddress} from '@yearn-finance/web-lib/utils/wagmi/utils';

import {PRISMA_AIRDROP_DISTRIBUTOR_ABI} from './abi/distributor.abi';

import type {Hex} from 'viem';
import type {TWriteTransaction} from '@yearn-finance/web-lib/utils/wagmi/provider';
import type {TTxResponse} from '@yearn-finance/web-lib/utils/web3/transaction';

export const YEARN_VOTER_ADDRESS = '0x90be6DFEa8C80c184C442a36e17cB2439AAE25a7';
export const VECRV_AIRDROP_ADDRESS = '0x3ea03249B4D68Be92a8eda027C5ac12e6E419BEE';
export const EARLY_AIRDROP_ADDRESS = '0x2C533357664d8750e5F851f39B2534147F5578af';

type TClaimAirdrop = TWriteTransaction & {
	index: bigint;
	amount: bigint;
	merkleProof: Hex[];
};
export async function claimVECRVAirdrop(props: TClaimAirdrop): Promise<TTxResponse> {
	assert(props.connector, 'No connector');
	assert(props.amount > 0n, 'Amount is 0');
	assertAddress(VECRV_AIRDROP_ADDRESS, 'VECRV_AIRDROP_ADDRESS');
	const wagmiProvider = await toWagmiProvider(props.connector);

	return await handleTx(props, {
		address: VECRV_AIRDROP_ADDRESS,
		abi: PRISMA_AIRDROP_DISTRIBUTOR_ABI,
		functionName: 'claim',
		args: [wagmiProvider.address, YEARN_VOTER_ADDRESS, props.index, props.amount, props.merkleProof]
	});
}

export async function claimEarlyAirdrop(props: TClaimAirdrop): Promise<TTxResponse> {
	assert(props.connector, 'No connector');
	assert(props.amount > 0n, 'Amount is 0');
	assertAddress(EARLY_AIRDROP_ADDRESS, 'EARLY_AIRDROP_ADDRESS');
	const wagmiProvider = await toWagmiProvider(props.connector);

	return await handleTx(props, {
		address: EARLY_AIRDROP_ADDRESS,
		abi: PRISMA_AIRDROP_DISTRIBUTOR_ABI,
		functionName: 'claim',
		args: [wagmiProvider.address, YEARN_VOTER_ADDRESS, props.index, props.amount, props.merkleProof]
	});
}
