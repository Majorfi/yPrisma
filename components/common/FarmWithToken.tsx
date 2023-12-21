import React, {useCallback, useEffect, useState} from 'react';
import {AmountInput} from 'components/common/AmountInput';
import {useFetch} from 'hooks/useFetch';
import {useYDaemonBaseURI} from 'hooks/useYDaemonBaseURI';
import {STAKING_ABI} from 'utils/abi/stakingContract.abi';
import {approveERC20, claimRewards, exit, stake, unstakeSome} from 'utils/actions';
import {DEFAULT_CHAIN_ID} from 'utils/constants';
import {yDaemonPricesSchema} from 'utils/yDaemonPricesSchema';
import {erc20ABI, useContractRead} from 'wagmi';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {MAX_UINT_256} from '@yearn-finance/web-lib/utils/constants';
import {toBigInt, toNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import {formatAmount} from '@yearn-finance/web-lib/utils/format.number';
import {handleInputChangeEventValue} from '@yearn-finance/web-lib/utils/handlers/handleInputChangeEventValue';
import {defaultTxStatus} from '@yearn-finance/web-lib/utils/web3/transaction';

import type {ReactElement} from 'react';
import type {TAddress} from '@yearn-finance/web-lib/types';
import type {TNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import type {TYDaemonPrices} from '@yearn-finance/web-lib/utils/schemas/yDaemonPricesSchema';

type TFarmDetails = {
	APR: number;
	stakingContract: TAddress;
	rewardToken: TAddress;
	stakingToken: TAddress;
	stakingTokenName: string;
	rewardTokenName: string;
	availableToStake: TNormalizedBN | undefined;
	staked: TNormalizedBN | undefined;
	earned: TNormalizedBN | undefined;
	prices: Partial<{[key: `0x${string}`]: string}> | undefined;
};
function Details({
	APR,
	rewardToken,
	stakingToken,
	stakingContract,
	stakingTokenName,
	rewardTokenName,
	availableToStake,
	staked,
	earned,
	prices
}: TFarmDetails): ReactElement {
	const {data: totalSupply} = useContractRead({
		address: stakingContract,
		abi: erc20ABI,
		chainId: DEFAULT_CHAIN_ID,
		functionName: 'totalSupply',
		select: (data): TNormalizedBN => toNormalizedBN(data)
	});

	return (
		<div className={'col-span-1 w-full items-center rounded-lg bg-neutral-100 pt-6 md:col-span-3'}>
			<dl className={'flex flex-col gap-4 rounded-lg bg-neutral-200 p-4 md:p-6'}>
				<div>
					<b className={'text-lg'}>{'Your position details'}</b>
				</div>

				<div className={'flex w-full items-baseline justify-between'}>
					<dt className={'text-xs text-neutral-900/60 md:text-base'}>{'Fancy APR'}</dt>
					<dd className={'font-number text-lg font-bold leading-6'}>
						<span
							suppressHydrationWarning
							className={'bg-clip-text text-transparent contrast-200'}
							style={{
								backgroundImage:
									'-webkit-linear-gradient(0deg, rgba(219,110,55,1) 20%, rgba(236,184,64,1) 40%, rgba(104,183,120,1) 60%, rgba(71,119,211,1) 80%, rgba(72,44,216,1) 100%)'
							}}>
							{`${formatAmount(APR || 0, 2, 2)} %`}
						</span>
					</dd>
				</div>

				<div className={'flex w-full items-baseline justify-between'}>
					<dt className={'text-xs text-neutral-900/60 md:text-base'}>
						{`Available to stake, ${stakingTokenName}`}
					</dt>
					<dd
						suppressHydrationWarning
						className={'font-number text-sm font-bold md:text-base'}>
						{formatAmount(availableToStake?.normalized || 0, 6, 6)}
					</dd>
				</div>

				<div className={'flex w-full items-baseline justify-between'}>
					<dt className={'text-xs text-neutral-900/60 md:text-base'}>
						{`Already staked, ${stakingTokenName}`}
					</dt>
					<dd
						suppressHydrationWarning
						className={'font-number text-sm font-bold md:text-base'}>
						{formatAmount(staked?.normalized || 0, 6, 6)}
					</dd>
				</div>

				<div className={'flex w-full items-baseline justify-between'}>
					<dt className={'text-xs text-neutral-900/60 md:text-base'}>
						{`Amount earned, ${rewardTokenName}`}
					</dt>
					<dd>
						<b
							suppressHydrationWarning
							className={'font-number block text-sm md:text-base'}>
							{formatAmount(earned?.normalized || 0, 6, 6)}
						</b>
						<small
							suppressHydrationWarning
							className={'font-number block text-right text-xs text-neutral-900/60'}>
							{`$ ${formatAmount(Number(earned?.normalized) * Number(prices?.[rewardToken]) || 0, 2, 2)}`}
						</small>
					</dd>
				</div>

				<div className={'h-[1px] w-full bg-neutral-600/20'} />
				<div className={'flex w-full items-baseline justify-between'}>
					<dt className={'text-xs text-neutral-900/60 md:text-base'}>
						{`Total Staked, ${stakingTokenName}`}
					</dt>
					<dd className={'text-right'}>
						<b
							suppressHydrationWarning
							className={'font-number block text-sm md:text-base'}>
							{formatAmount(totalSupply?.normalized || 0, 0, 0)}
						</b>
						<small
							suppressHydrationWarning
							className={'font-number block text-right text-xs text-neutral-900/60'}>
							{`$ ${formatAmount(
								Number(totalSupply?.normalized) * Number(prices?.[stakingToken]) || 0,
								2,
								2
							)}`}
						</small>
					</dd>
				</div>
			</dl>
		</div>
	);
}

type TFarmFactory = {
	APR: number;
	tab: string;
	stakingContract: TAddress;
	stakingToken: TAddress;
	rewardToken: TAddress;
	stakingTokenName: string;
	rewardTokenName: string;
	slug: string;
};
export function FarmWithToken({
	APR,
	stakingContract,
	stakingToken,
	rewardToken,
	stakingTokenName,
	rewardTokenName
}: TFarmFactory): ReactElement {
	const {provider, address, isActive} = useWeb3();
	const [txStatusApprove, set_txStatusApprove] = useState(defaultTxStatus);
	const [txStatusStake, set_txStatusStake] = useState(defaultTxStatus);
	const [txStatusExit, set_txStatusExit] = useState(defaultTxStatus);
	const [txStatusUnstakeSome, set_txStatusUnstakeSome] = useState(defaultTxStatus);
	const [txStatusClaim, set_txStatusClaim] = useState(defaultTxStatus);
	const [amountToStake, set_amountToStake] = useState<TNormalizedBN | undefined>(undefined);
	const [amountToWithdraw, set_amountToWithdraw] = useState<TNormalizedBN | undefined>(undefined);
	const {yDaemonBaseUri} = useYDaemonBaseURI({chainID: 1});
	
	let tempRewardToken = null
	if (rewardToken === 0x04AeBe2e4301CdF5E9c57B01eBdfe4Ac4B48DD13) {
	  tempRewardToken = 0x4591dbff62656e7859afe5e45f6f47d3669fbb28
	}

	const {data: prices} = useFetch<TYDaemonPrices>({
		endpoint: `${yDaemonBaseUri}/prices/some/${stakingToken},${tempRewardToken ? tempRewardToken : rewardToken}?humanized=true`,
		schema: yDaemonPricesSchema
	});

	const {data: availableToStake, refetch: refetchAvailable} = useContractRead({
		address: stakingToken,
		abi: erc20ABI,
		chainId: DEFAULT_CHAIN_ID,
		functionName: 'balanceOf',
		watch: true,
		args: [toAddress(address)],
		select: (data): TNormalizedBN => toNormalizedBN(data)
	});

	const {data: approvedAmount, refetch: refetchAllowance} = useContractRead({
		address: stakingToken,
		abi: erc20ABI,
		chainId: DEFAULT_CHAIN_ID,
		functionName: 'allowance',
		args: [toAddress(address), stakingContract],
		select: (data): TNormalizedBN => toNormalizedBN(data)
	});

	const {data: staked, refetch: refetchStacked} = useContractRead({
		address: stakingContract,
		abi: STAKING_ABI,
		chainId: DEFAULT_CHAIN_ID,
		functionName: 'balanceOf',
		args: [toAddress(address)],
		select: (data): TNormalizedBN => toNormalizedBN(data)
	});

	const {data: earned, refetch: refetchEarned} = useContractRead({
		address: stakingContract,
		abi: STAKING_ABI,
		chainId: DEFAULT_CHAIN_ID,
		watch: true,
		functionName: 'earned',
		args: [toAddress(address)],
		select: (data): TNormalizedBN => toNormalizedBN(data)
	});

	useEffect((): void => {
		if (toBigInt(staked?.raw) > 0n) {
			set_amountToWithdraw(staked);
		}
	}, [staked]);

	useEffect((): void => {
		if (toBigInt(availableToStake?.raw) > 0n) {
			set_amountToStake(availableToStake);
		}
	}, [availableToStake]);

	/**********************************************************************************************
	 * Actions to Approve, Stake, Unstake and Claim
	 *********************************************************************************************/
	const onApproveToken = useCallback(async (): Promise<void> => {
		const result = await approveERC20({
			connector: provider,
			chainID: DEFAULT_CHAIN_ID,
			contractAddress: stakingToken,
			spenderAddress: stakingContract,
			amount: MAX_UINT_256,
			statusHandler: set_txStatusApprove
		});
		if (result.isSuccessful) {
			refetchAllowance();
		}
	}, [provider, refetchAllowance, stakingContract, stakingToken]);

	const onStake = useCallback(async (): Promise<void> => {
		const result = await stake({
			connector: provider,
			chainID: DEFAULT_CHAIN_ID,
			contractAddress: stakingContract,
			amount: toBigInt(amountToStake?.raw),
			statusHandler: set_txStatusStake
		});
		if (result.isSuccessful) {
			await Promise.all([refetchAvailable(), refetchStacked(), refetchAllowance()]);
			set_amountToStake(undefined);
		}
	}, [provider, stakingContract, amountToStake?.raw, refetchAvailable, refetchStacked, refetchAllowance]);

	const onExit = useCallback(async (): Promise<void> => {
		const result = await exit({
			connector: provider,
			chainID: DEFAULT_CHAIN_ID,
			contractAddress: stakingContract,
			statusHandler: set_txStatusExit
		});
		if (result.isSuccessful) {
			await Promise.all([refetchAvailable(), refetchStacked(), refetchAllowance(), refetchEarned()]);
			set_amountToStake(undefined);
		}
	}, [provider, stakingContract, refetchAvailable, refetchStacked, refetchAllowance, refetchEarned]);

	const onUnstakeSome = useCallback(async (): Promise<void> => {
		const result = await unstakeSome({
			connector: provider,
			chainID: DEFAULT_CHAIN_ID,
			contractAddress: stakingContract,
			statusHandler: set_txStatusUnstakeSome,
			amount: toBigInt(amountToWithdraw?.raw)
		});
		if (result.isSuccessful) {
			await Promise.all([refetchAvailable(), refetchStacked(), refetchAllowance()]);
			set_amountToWithdraw(undefined);
		}
	}, [provider, stakingContract, amountToWithdraw?.raw, refetchAvailable, refetchStacked, refetchAllowance]);

	const onClaimRewards = useCallback(async (): Promise<void> => {
		const result = await claimRewards({
			connector: provider,
			chainID: DEFAULT_CHAIN_ID,
			contractAddress: stakingContract,
			statusHandler: set_txStatusClaim
		});
		if (result.isSuccessful) {
			await Promise.all([refetchAvailable(), refetchEarned()]);
		}
	}, [provider, refetchAvailable, refetchEarned, stakingContract]);

	/**********************************************************************************************
	 * Some render functions
	 *********************************************************************************************/
	function renderStakeView(): ReactElement {
		return (
			<div
				className={
					'col-span-1 flex flex-col items-start gap-2 rounded-lg bg-neutral-100 md:col-span-3 md:flex-row md:gap-6'
				}>
				<AmountInput
					amount={amountToStake}
					maxAmount={availableToStake}
					onAmountChange={(value): void => set_amountToStake(handleInputChangeEventValue(value, 18))}
					onLegendClick={(): void => set_amountToStake(availableToStake)}
					onMaxClick={(): void => set_amountToStake(availableToStake)}
					legend={
						<div className={'flex flex-row justify-between'}>
							<p
								suppressHydrationWarning
								className={'text-neutral-400'}>
								{`You have ${formatAmount(
									availableToStake?.normalized || 0,
									2,
									6
								)} ${stakingTokenName}`}
							</p>
							<p
								suppressHydrationWarning
								className={'text-neutral-400'}>
								{`$${formatAmount(
									Number(amountToStake?.normalized || 0) * Number(prices?.[stakingToken] || 0)
								)}`}
							</p>
						</div>
					}
				/>
				<div className={'mt-4 w-full md:mt-0 md:w-[316px]'}>
					<div className={'flex w-full gap-4'}>
						<Button
							isBusy={txStatusApprove.pending}
							className={'w-1/2 md:w-[150px]'}
							isDisabled={
								!isActive ||
								!amountToStake ||
								toBigInt(amountToStake?.raw) === 0n ||
								toBigInt(amountToStake?.raw) > toBigInt(availableToStake?.raw) ||
								toBigInt(approvedAmount?.raw) >= toBigInt(amountToStake?.raw)
							}
							onClick={onApproveToken}>
							{'Approve'}
						</Button>
						<Button
							isBusy={txStatusStake.pending}
							className={'w-1/2 md:w-[150px]'}
							isDisabled={
								!isActive ||
								!amountToStake ||
								toBigInt(amountToStake?.raw) === 0n ||
								toBigInt(approvedAmount?.raw) < toBigInt(amountToStake?.raw)
							}
							onClick={onStake}>
							{'Stake'}
						</Button>
					</div>
				</div>
			</div>
		);
	}

	function renderClaimView(): ReactElement {
		return (
			<div
				className={'col-span-3 flex flex-col items-start gap-0 rounded-lg bg-neutral-100 md:flex-row md:gap-6'}>
				<AmountInput
					// label={`Rewards, ${rewardTokenName}`}
					disabled
					amount={earned}
					legend={
						<div className={'flex flex-row justify-between'}>
							<p
								suppressHydrationWarning
								className={'text-neutral-400'}>
								{`You earned ${formatAmount(earned?.normalized || 0, 2, 6)} ${rewardTokenName}`}
							</p>
							<p
								suppressHydrationWarning
								className={'text-neutral-400'}>
								{`$${formatAmount(
									Number(earned?.normalized || 0) * Number(prices?.[rewardToken] || 0)
								)}`}
							</p>
						</div>
					}
				/>
				<div className={'mt-4 w-full md:mt-0 md:w-[316px]'}>
					<div className={'flex w-full gap-4'}>
						<Button
							isBusy={txStatusClaim.pending}
							className={'w-full md:w-[316px]'}
							isDisabled={!isActive || toBigInt(earned?.raw) === 0n}
							onClick={onClaimRewards}>
							{'Claim rewards'}
						</Button>
					</div>
				</div>
			</div>
		);
	}

	function renderUnstakeView(): ReactElement {
		return (
			<div
				className={
					'col-span-1 flex flex-col items-start gap-2 rounded-lg bg-neutral-100 md:col-span-3 md:flex-row md:gap-6'
				}>
				<AmountInput
					amount={amountToWithdraw}
					maxAmount={staked}
					onAmountChange={(value): void => set_amountToWithdraw(handleInputChangeEventValue(value, 18))}
					onLegendClick={(): void => set_amountToWithdraw(staked)}
					onMaxClick={(): void => set_amountToWithdraw(staked)}
					legend={
						<div className={'flex flex-row justify-between'}>
							<p
								suppressHydrationWarning
								className={'text-neutral-400'}>
								{`You have ${formatAmount(staked?.normalized || 0, 2, 6)} ${stakingTokenName} staked`}
							</p>
							<p
								suppressHydrationWarning
								className={'text-neutral-400'}>
								{`$${formatAmount(
									Number(staked?.normalized || 0) * Number(prices?.[stakingToken] || 0)
								)}`}
							</p>
						</div>
					}
				/>
				<div className={'mt-4 w-full md:mt-0 md:w-[316px]'}>
					<div className={'flex w-full gap-4'}>
						<Button
							isBusy={txStatusUnstakeSome.pending}
							className={'w-1/2 md:w-[150px]'}
							isDisabled={
								!isActive ||
								toBigInt(staked?.raw) === 0n ||
								toBigInt(amountToWithdraw?.raw) === toBigInt(staked?.raw)
							}
							onClick={onUnstakeSome}>
							{'Partial Exit'}
						</Button>
						<Button
							isBusy={txStatusExit.pending}
							className={'w-1/2 md:w-[150px]'}
							isDisabled={
								!isActive ||
								toBigInt(staked?.raw) === 0n ||
								toBigInt(amountToWithdraw?.raw) !== toBigInt(staked?.raw)
							}
							onClick={onExit}>
							{'Claim and Exit All'}
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<>
			<div className={'col-span-1 w-full items-center rounded-lg bg-neutral-100 md:col-span-3'}>
				<div>
					<div className={'pb-2'}>
						<b>{`Stake, ${stakingTokenName}`}</b>
					</div>
					{renderStakeView()}
				</div>
				<div className={'mt-6'}>
					<div className={'pb-2'}>
						<b>{`Unstake, ${stakingTokenName}`}</b>
					</div>
					{renderUnstakeView()}
				</div>
				<div className={'mt-6'}>
					<div className={'pb-2'}>
						<b>{`Rewards, ${rewardTokenName}`}</b>
					</div>
					{renderClaimView()}
				</div>
			</div>

			<Details
				APR={APR}
				rewardToken={rewardToken}
				stakingToken={stakingToken}
				stakingTokenName={stakingTokenName}
				stakingContract={stakingContract}
				rewardTokenName={rewardTokenName}
				availableToStake={availableToStake}
				staked={staked}
				earned={earned}
				prices={prices}
			/>
		</>
	);
}
