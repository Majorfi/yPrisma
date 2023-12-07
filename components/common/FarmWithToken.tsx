import React, {useCallback, useEffect, useState} from 'react';
import {AmountInput} from 'components/common/AmountInput';
import {useFetch} from 'hooks/useFetch';
import {useYDaemonBaseURI} from 'hooks/useYDaemonBaseURI';
import {STAKING_ABI} from 'utils/abi/stakingContract.abi';
import {exit, unstakeSome} from 'utils/actions';
import {DEFAULT_CHAIN_ID} from 'utils/constants';
import {yDaemonPricesSchema} from 'utils/yDaemonPricesSchema';
import {erc20ABI, useContractRead} from 'wagmi';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {toBigInt, toNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import {formatAmount} from '@yearn-finance/web-lib/utils/format.number';
import {handleInputChangeEventValue} from '@yearn-finance/web-lib/utils/handlers/handleInputChangeEventValue';
import {defaultTxStatus} from '@yearn-finance/web-lib/utils/web3/transaction';

import type {ReactElement} from 'react';
import type {TAddress} from '@yearn-finance/web-lib/types';
import type {TNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import type {TYDaemonPrices} from '@yearn-finance/web-lib/utils/schemas/yDaemonPricesSchema';

type TFarmDetails = {
	stakingContract: TAddress;
	rewardToken: TAddress;
	stakingToken: TAddress;
	stakingTokenName: string;
	rewardTokenName: string;
	staked: TNormalizedBN | undefined;
	earned: TNormalizedBN | undefined;
	prices: Partial<{[key: `0x${string}`]: string}> | undefined;
};
function Details({
	rewardToken,
	stakingToken,
	stakingContract,
	stakingTokenName,
	rewardTokenName,

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
					<dt className={'text-xs text-neutral-900/60 md:text-base'}>
						{`Already staked, ${stakingTokenName}`}
					</dt>
					<dd className={'font-number text-sm font-bold md:text-base'}>
						{formatAmount(staked?.normalized || 0, 6, 6)}
					</dd>
				</div>

				<div className={'flex w-full items-baseline justify-between'}>
					<dt className={'text-xs text-neutral-900/60 md:text-base'}>
						{`Amount earned, ${rewardTokenName}`}
					</dt>
					<dd>
						<b className={'font-number block text-sm md:text-base'}>
							{formatAmount(earned?.normalized || 0, 6, 6)}
						</b>
						<small className={'font-number block text-right text-xs text-neutral-900/60'}>
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
						<b className={'font-number block text-sm md:text-base'}>
							{formatAmount(totalSupply?.normalized || 0, 0, 0)}
						</b>
						<small className={'font-number block text-right text-xs text-neutral-900/60'}>
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
	tab: string;
	stakingContract: TAddress;
	stakingToken: TAddress;
	rewardToken: TAddress;
	stakingTokenName: string;
	rewardTokenName: string;
	slug: string;
};
export function FarmWithToken({
	stakingContract,
	stakingToken,
	rewardToken,
	stakingTokenName,
	rewardTokenName
}: TFarmFactory): ReactElement {
	const {provider, address, isActive} = useWeb3();
	const [txStatusExit, set_txStatusExit] = useState(defaultTxStatus);
	const [txStatusUnstakeSome, set_txStatusUnstakeSome] = useState(defaultTxStatus);
	const [amountToWithdraw, set_amountToWithdraw] = useState<TNormalizedBN | undefined>(undefined);
	const {yDaemonBaseUri} = useYDaemonBaseURI({chainID: 1});
	const {data: prices} = useFetch<TYDaemonPrices>({
		endpoint: `${yDaemonBaseUri}/prices/some/${stakingToken},${rewardToken}?humanized=true`,
		schema: yDaemonPricesSchema
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

	/**********************************************************************************************
	 * Actions to Exit and Unstake
	 *********************************************************************************************/

	const onExit = useCallback(async (): Promise<void> => {
		const result = await exit({
			connector: provider,
			chainID: DEFAULT_CHAIN_ID,
			contractAddress: stakingContract,
			statusHandler: set_txStatusExit
		});
		if (result.isSuccessful) {
			await Promise.all([refetchStacked(), refetchEarned()]);
		}
	}, [provider, stakingContract, refetchStacked, refetchEarned]);

	const onUnstakeSome = useCallback(async (): Promise<void> => {
		const result = await unstakeSome({
			connector: provider,
			chainID: DEFAULT_CHAIN_ID,
			contractAddress: stakingContract,
			statusHandler: set_txStatusUnstakeSome,
			amount: toBigInt(amountToWithdraw?.raw)
		});
		if (result.isSuccessful) {
			await Promise.all([refetchStacked()]);
			set_amountToWithdraw(undefined);
		}
	}, [provider, stakingContract, amountToWithdraw?.raw, refetchStacked]);

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
				<div className={'mt-6'}>
					<div className={'pb-2'}>
						<b>{`Unstake, ${stakingTokenName}`}</b>
					</div>
					{renderUnstakeView()}
				</div>
			</div>

			<Details
				rewardToken={rewardToken}
				stakingToken={stakingToken}
				stakingTokenName={stakingTokenName}
				stakingContract={stakingContract}
				rewardTokenName={rewardTokenName}
				staked={staked}
				earned={earned}
				prices={prices}
			/>
		</>
	);
}
