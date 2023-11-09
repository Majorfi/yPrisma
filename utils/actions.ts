import assert from 'assert';
import {erc20ABI} from '@wagmi/core';
import {handleTx, toWagmiProvider} from '@yearn-finance/web-lib/utils/wagmi/provider';
import {assertAddress} from '@yearn-finance/web-lib/utils/wagmi/utils';

import {PRISMA_AIRDROP_DISTRIBUTOR_ABI} from './abi/distributor.abi';
import {LEGACY_MINTER_ABI} from './abi/legacyMinter.abi';
import {YPRISMA_STAKING_ABI} from './abi/stakingContract.abi';

import type {Hex} from 'viem';
import type {TAddress} from '@yearn-finance/web-lib/types';
import type {TWriteTransaction} from '@yearn-finance/web-lib/utils/wagmi/provider';
import type {TTxResponse} from '@yearn-finance/web-lib/utils/web3/transaction';

export const DEFAULT_CHAIN_ID = 1;
export const YEARN_VOTER_ADDRESS = '0x90be6DFEa8C80c184C442a36e17cB2439AAE25a7';
export const VECRV_AIRDROP_ADDRESS = '0x3ea03249B4D68Be92a8eda027C5ac12e6E419BEE';
export const EARLY_AIRDROP_ADDRESS = '0x2C533357664d8750e5F851f39B2534147F5578af';
export const PRISMA_ADDRESS = '0xdA47862a83dac0c112BA89c6abC2159b95afd71C';
export const YPRISMA_LEGACY_ADDRESS = '0xfd37356c1a62288b32Fa58188c77Ab0D694a0f4E';
export const YPRISMA_ADDRESS = '0xe3668873d944e4a949da05fc8bde419eff543882';
export const YPRISMA_STAKING_ADDRESS = '0x774a55C3Eeb79929fD445Ae97191228Ab39c4d0f';
export const REWARD_TOKEN_ADDRESS = `0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0`;
export const LEGACY_MINTER_ADDRESS = `0x04EcFdb67b00Fd70007570342887390ebf934C28`;

//Because USDT do not return a boolean on approve, we need to use this ABI
const ALTERNATE_ERC20_APPROVE_ABI = [
	{
		constant: false,
		inputs: [
			{name: '_spender', type: 'address'},
			{name: '_value', type: 'uint256'}
		],
		name: 'approve',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function'
	}
] as const;

type TApproveERC20 = TWriteTransaction & {
	spenderAddress: TAddress | undefined;
	amount: bigint;
};
export async function approveERC20(props: TApproveERC20): Promise<TTxResponse> {
	assertAddress(props.spenderAddress, 'spenderAddress');
	assertAddress(props.contractAddress);

	props.onTrySomethingElse = async (): Promise<TTxResponse> => {
		assertAddress(props.spenderAddress, 'spenderAddress');
		return await handleTx(props, {
			address: props.contractAddress,
			abi: ALTERNATE_ERC20_APPROVE_ABI,
			functionName: 'approve',
			args: [props.spenderAddress, props.amount]
		});
	};

	return await handleTx(props, {
		address: props.contractAddress,
		abi: erc20ABI,
		functionName: 'approve',
		args: [props.spenderAddress, props.amount]
	});
}

type TClaimAirdrop = TWriteTransaction & {
	index: bigint;
	amount: bigint;
	merkleProof: [Hex[], Hex[]];
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

type TStakeYPrisma = TWriteTransaction & {
	amount: bigint;
};
export async function stakeYPrisma(props: TStakeYPrisma): Promise<TTxResponse> {
	assert(props.connector, 'No connector');
	assert(props.amount > 0n, 'Amount is 0');
	assertAddress(YPRISMA_STAKING_ADDRESS, 'YPRISMA_STAKING_ADDRESS');

	return await handleTx(props, {
		address: YPRISMA_STAKING_ADDRESS,
		abi: YPRISMA_STAKING_ABI,
		functionName: 'stake',
		args: [props.amount]
	});
}

type TUnstakeYPrisma = TWriteTransaction;
export async function unstakeYPrisma(props: TUnstakeYPrisma): Promise<TTxResponse> {
	assert(props.connector, 'No connector');
	assertAddress(YPRISMA_STAKING_ADDRESS, 'YPRISMA_STAKING_ADDRESS');

	return await handleTx(props, {
		address: YPRISMA_STAKING_ADDRESS,
		abi: YPRISMA_STAKING_ABI,
		functionName: 'exit'
	});
}

type TClaimRewards = TWriteTransaction;
export async function claimRewards(props: TClaimRewards): Promise<TTxResponse> {
	assert(props.connector, 'No connector');
	assertAddress(YPRISMA_STAKING_ADDRESS, 'YPRISMA_STAKING_ADDRESS');

	return await handleTx(props, {
		address: YPRISMA_STAKING_ADDRESS,
		abi: YPRISMA_STAKING_ABI,
		functionName: 'getReward'
	});
}

type TMigrateOGYPrisma = TWriteTransaction;
export async function migrateOGYPrisma(props: TMigrateOGYPrisma): Promise<TTxResponse> {
	assert(props.connector, 'No connector');
	assertAddress(LEGACY_MINTER_ADDRESS, 'LEGACY_MINTER_ADDRESS');

	return await handleTx(props, {
		address: LEGACY_MINTER_ADDRESS,
		abi: LEGACY_MINTER_ABI,
		functionName: 'redeem'
	});
}
