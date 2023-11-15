import assert from 'assert';
import {erc20ABI} from '@wagmi/core';
import {handleTx, toWagmiProvider} from '@yearn-finance/web-lib/utils/wagmi/provider';
import {assertAddress} from '@yearn-finance/web-lib/utils/wagmi/utils';

import {EARLY_AIRDROP_ADDRESS, LEGACY_MINTER_ADDRESS, VECRV_AIRDROP_ADDRESS, YEARN_VOTER_ADDRESS} from './constants';
import {PRISMA_AIRDROP_DISTRIBUTOR_ABI} from './abi/distributor.abi';
import {LEGACY_MINTER_ABI} from './abi/legacyMinter.abi';
import {STAKING_ABI} from './abi/stakingContract.abi';

import type {Hex} from 'viem';
import type {TAddress} from '@yearn-finance/web-lib/types';
import type {TWriteTransaction} from '@yearn-finance/web-lib/utils/wagmi/provider';
import type {TTxResponse} from '@yearn-finance/web-lib/utils/web3/transaction';

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

type TStake = TWriteTransaction & {
	amount: bigint;
};
export async function stake(props: TStake): Promise<TTxResponse> {
	assert(props.connector, 'No connector');
	assert(props.amount > 0n, 'Amount is 0');
	assertAddress(props.contractAddress, 'contractAddress');

	return await handleTx(props, {
		address: props.contractAddress,
		abi: STAKING_ABI,
		functionName: 'stake',
		args: [props.amount]
	});
}

type TExit = TWriteTransaction;
export async function exit(props: TExit): Promise<TTxResponse> {
	assert(props.connector, 'No connector');
	assertAddress(props.contractAddress, 'contractAddress');

	return await handleTx(props, {
		address: props.contractAddress,
		abi: STAKING_ABI,
		functionName: 'exit'
	});
}

type TUnstake = TWriteTransaction & {
	amount: bigint;
};
export async function unstakeSome(props: TUnstake): Promise<TTxResponse> {
	assert(props.connector, 'No connector');
	assert(props.amount > 0n, 'Amount is 0');
	assertAddress(props.contractAddress, 'contractAddress');

	return await handleTx(props, {
		address: props.contractAddress,
		abi: STAKING_ABI,
		functionName: 'withdraw',
		args: [props.amount]
	});
}

type TClaimRewards = TWriteTransaction;
export async function claimRewards(props: TClaimRewards): Promise<TTxResponse> {
	assert(props.connector, 'No connector');
	assertAddress(props.contractAddress, 'contractAddress');

	return await handleTx(props, {
		address: props.contractAddress,
		abi: STAKING_ABI,
		functionName: 'getReward'
	});
}
