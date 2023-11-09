import React, {useCallback, useEffect, useState} from 'react';
import Link from 'next/link';
import {AmountInput} from 'components/common/AmountInput';
import {useFetch} from 'hooks/useFetch';
import {useYDaemonBaseURI} from 'hooks/useYDaemonBaseURI';
import {STAKING_ABI} from 'utils/abi/stakingContract.abi';
import {approveERC20, claimRewards, stake, unstake} from 'utils/actions';
import {DEFAULT_CHAIN_ID} from 'utils/constants';
import {yDaemonPricesSchema} from 'utils/yDaemonPricesSchema';
import {erc20ABI, useContractRead} from 'wagmi';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {cl} from '@yearn-finance/web-lib/utils/cl';
import {MAX_UINT_256} from '@yearn-finance/web-lib/utils/constants';
import {toBigInt, toNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import {formatAmount} from '@yearn-finance/web-lib/utils/format.number';
import {handleInputChangeEventValue} from '@yearn-finance/web-lib/utils/handlers/handleInputChangeEventValue';
import {defaultTxStatus} from '@yearn-finance/web-lib/utils/web3/transaction';

import type {ReactElement} from 'react';
import type {TAddress} from '@yearn-finance/web-lib/types';
import type {TNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import type {TYDaemonPrices} from '@yearn-finance/web-lib/utils/schemas/yDaemonPricesSchema';

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
	tab,
	stakingContract,
	stakingToken,
	rewardToken,
	stakingTokenName,
	rewardTokenName,
	slug
}: TFarmFactory): ReactElement {
	const {provider, address, isActive} = useWeb3();
	const [txStatusApprove, set_txStatusApprove] = useState(defaultTxStatus);
	const [txStatusStake, set_txStatusStake] = useState(defaultTxStatus);
	const [txStatusUnstake, set_txStatusUnstake] = useState(defaultTxStatus);
	const [txStatusClaim, set_txStatusClaim] = useState(defaultTxStatus);
	const [amountToUse, set_amountToUse] = useState<TNormalizedBN | undefined>(undefined);
	const {yDaemonBaseUri} = useYDaemonBaseURI({chainID: 1});
	const {data: prices} = useFetch<TYDaemonPrices>({
		endpoint: `${yDaemonBaseUri}/prices/some/${stakingToken},${rewardToken}?humanized=true`,
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

	const {data: earned} = useContractRead({
		address: stakingContract,
		abi: STAKING_ABI,
		chainId: DEFAULT_CHAIN_ID,
		watch: true,
		functionName: 'earned',
		args: [toAddress(address)],
		select: (data): TNormalizedBN => toNormalizedBN(data)
	});

	useEffect((): void => {
		if (toBigInt(availableToStake?.raw) > 0n) {
			set_amountToUse(availableToStake);
		}
	}, [availableToStake]);

	const onChangeInput = useCallback((value: string): void => {
		set_amountToUse(handleInputChangeEventValue(value, 18));
	}, []);

	/**********************************************************************************************
	 * Actions to Approve, Stake, Unstake and Claim
	 *********************************************************************************************/
	const approveToken = useCallback(async (): Promise<void> => {
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
			amount: toBigInt(amountToUse?.raw),
			statusHandler: set_txStatusStake
		});
		if (result.isSuccessful) {
			await Promise.all([refetchAvailable(), refetchStacked(), refetchAllowance()]);
			set_amountToUse(undefined);
		}
	}, [provider, stakingContract, amountToUse?.raw, refetchAvailable, refetchStacked, refetchAllowance]);

	const onUnstake = useCallback(async (): Promise<void> => {
		const result = await unstake({
			connector: provider,
			chainID: DEFAULT_CHAIN_ID,
			contractAddress: stakingContract,
			statusHandler: set_txStatusUnstake
		});
		if (result.isSuccessful) {
			await Promise.all([refetchAvailable(), refetchStacked(), refetchAllowance()]);
			set_amountToUse(undefined);
		}
	}, [provider, stakingContract, refetchAvailable, refetchStacked, refetchAllowance]);

	const onClaimRewards = useCallback(async (): Promise<void> => {
		const result = await claimRewards({
			connector: provider,
			chainID: DEFAULT_CHAIN_ID,
			contractAddress: stakingContract,
			statusHandler: set_txStatusClaim
		});
		if (result.isSuccessful) {
			refetchAvailable();
		}
	}, [provider, refetchAvailable, stakingContract]);

	/**********************************************************************************************
	 * Some render functions
	 *********************************************************************************************/
	function renderStakeView(): ReactElement {
		return (
			<div
				className={
					'col-span-1 flex flex-col items-center gap-2 rounded-lg bg-neutral-100 md:col-span-3 md:flex-row md:gap-6'
				}>
				<AmountInput
					label={`Available to stake, ${stakingTokenName}`}
					amount={amountToUse}
					maxAmount={availableToStake}
					onAmountChange={onChangeInput}
					onLegendClick={(): void => set_amountToUse(availableToStake)}
					onMaxClick={(): void => set_amountToUse(availableToStake)}
					legend={
						<div className={'flex flex-row justify-between'}>
							<p
								suppressHydrationWarning
								className={'text-neutral-400'}>
								{`You have: ${formatAmount(
									availableToStake?.normalized || 0,
									2,
									6
								)} ${stakingTokenName}`}
							</p>
							<p
								suppressHydrationWarning
								className={'text-neutral-400'}>
								{`$${formatAmount(
									Number(amountToUse?.normalized || 0) * Number(prices?.[stakingToken] || 0)
								)}`}
							</p>
						</div>
					}
				/>
				<div className={'-mx-2'}>
					<Link
						href={`/?tab=unstake-${slug}`}
						scroll={false}
						replace
						shallow>
						<button
							className={cl(
								'cursor-pointer rounded-lg p-2 text-xl leading-6',
								'bg-neutral-100 hover:bg-neutral-200 transition-colors',
								'rotate-90 md:rotate-0'
							)}>
							&#8646;
						</button>
					</Link>
				</div>
				<AmountInput
					label={'Future staked amount'}
					disabled
					amount={amountToUse}
					legend={
						<div className={'flex flex-row justify-end'}>
							<p
								suppressHydrationWarning
								className={'text-neutral-400'}>
								{`$${formatAmount(
									Number(amountToUse?.normalized || 0) * Number(prices?.[stakingToken] || 0)
								)}`}
							</p>
						</div>
					}
				/>
				<div className={'mt-4 w-full md:mt-[3px] md:w-[316px]'}>
					<div className={'flex w-full gap-4'}>
						<Button
							isBusy={txStatusApprove.pending}
							className={'w-1/2 md:w-[150px]'}
							isDisabled={
								!isActive ||
								!amountToUse ||
								toBigInt(amountToUse?.raw) === 0n ||
								toBigInt(amountToUse?.raw) > toBigInt(availableToStake?.raw) ||
								toBigInt(approvedAmount?.raw) >= toBigInt(amountToUse?.raw)
							}
							onClick={approveToken}>
							{'Approve'}
						</Button>
						<Button
							isBusy={txStatusStake.pending}
							className={'w-1/2 md:w-[150px]'}
							isDisabled={
								!isActive ||
								!amountToUse ||
								toBigInt(amountToUse?.raw) === 0n ||
								toBigInt(approvedAmount?.raw) < toBigInt(amountToUse?.raw)
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
				className={
					'col-span-3 flex flex-col items-center gap-0 rounded-lg bg-neutral-100 md:flex-row md:gap-6'
				}>
				<AmountInput
					label={`Rewards, ${rewardTokenName}`}
					disabled
					amount={earned}
					legend={
						<div className={'flex flex-row justify-end'}>
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
				<div className={'mt-4 w-full md:mt-[3px] md:w-[316px]'}>
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
					'col-span-1 flex flex-col items-center gap-2 rounded-lg bg-neutral-100 md:col-span-3 md:flex-row md:gap-6'
				}>
				<AmountInput
					label={'Staked amount'}
					amount={staked}
					disabled
					legend={
						<div className={'flex flex-row justify-end'}>
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
				<div className={'-mx-2'}>
					<Link
						href={`/?tab=stake-${slug}`}
						scroll={false}
						replace
						shallow>
						<button
							className={cl(
								'cursor-pointer rounded-lg p-2 text-xl leading-6',
								'bg-neutral-100 hover:bg-neutral-200 transition-colors',
								'rotate-90 md:rotate-0'
							)}>
							&#8646;
						</button>
					</Link>
				</div>
				<AmountInput
					label={`Amount to unstake, ${stakingTokenName}`}
					disabled
					amount={staked}
					legend={
						<div className={'flex flex-row justify-end'}>
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
				<div className={'mt-4 w-full md:mt-[3px] md:w-[316px]'}>
					<div className={'flex w-full gap-4'}>
						<Button
							key={'unstake button'}
							isBusy={txStatusUnstake.pending}
							className={'w-full md:w-[316px]'}
							isDisabled={!isActive || !amountToUse || toBigInt(staked?.raw) === 0n}
							onClick={onUnstake}>
							{'Unstake + Claim'}
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<>
			<div className={'col-span-1 w-full items-center rounded-lg bg-neutral-100 md:col-span-3'}>
				<div className={'mb-20 md:mb-10'}>
					{tab === `stake-${slug}` && renderStakeView()}
					{tab === `unstake-${slug}` && renderUnstakeView()}
				</div>

				<div>{renderClaimView()}</div>
			</div>

			<div className={'col-span-1 w-full items-center rounded-lg bg-neutral-100 md:col-span-3'}>
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
						<dd className={'font-number text-sm font-bold md:text-base'}>
							{formatAmount(availableToStake?.normalized || 0, 6, 6)}
						</dd>
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
								{`$ ${formatAmount(
									Number(earned?.normalized) * Number(prices?.[rewardToken]) || 0,
									2,
									2
								)}`}
							</small>
						</dd>
					</div>
				</dl>
			</div>
		</>
	);
}
