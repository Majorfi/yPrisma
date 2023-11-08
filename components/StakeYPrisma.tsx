import React, {useCallback, useEffect, useState} from 'react';
import Link from 'next/link';
import {useFetch} from 'hooks/useFetch';
import {useYDaemonBaseURI} from 'hooks/useYDaemonBaseURI';
import {YPRISMA_STAKING_ABI} from 'utils/abi/stakingContract.abi';
import {
	approveERC20,
	claimRewards,
	DEFAULT_CHAIN_ID,
	PRISMA_ADDRESS,
	REWARD_TOKEN_ADDRESS,
	stakeYPrisma,
	unstakeYPrisma,
	YPRISMA_ADDRESS,
	YPRISMA_STAKING_ADDRESS
} from 'utils/actions';
import {erc20ABI, useContractRead} from 'wagmi';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {cl} from '@yearn-finance/web-lib/utils/cl';
import {toBigInt, toNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import {formatAmount} from '@yearn-finance/web-lib/utils/format.number';
import {handleInputChangeEventValue} from '@yearn-finance/web-lib/utils/handlers/handleInputChangeEventValue';
import {yDaemonPricesSchema} from '@yearn-finance/web-lib/utils/schemas/yDaemonPricesSchema';
import {defaultTxStatus} from '@yearn-finance/web-lib/utils/web3/transaction';

import {AmountInput} from './common/AmountInput';

import type {ReactElement} from 'react';
import type {TNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import type {TYDaemonPrices} from '@yearn-finance/web-lib/utils/schemas/yDaemonPricesSchema';

function StakeYPrisma({APR, tab}: {APR: number; tab: 'stake' | 'unstake' | 'claim'}): ReactElement {
	const {provider, address, isActive} = useWeb3();
	const [txStatusApprove, set_txStatusApprove] = useState(defaultTxStatus);
	const [txStatusStake, set_txStatusStake] = useState(defaultTxStatus);
	const [txStatusUnstake, set_txStatusUnstake] = useState(defaultTxStatus);
	const [txStatusClaim, set_txStatusClaim] = useState(defaultTxStatus);
	const [amountToUse, set_amountToUse] = useState<TNormalizedBN | undefined>(undefined);
	const {yDaemonBaseUri} = useYDaemonBaseURI({chainID: 1});
	const {data: prices} = useFetch<TYDaemonPrices>({
		endpoint: `${yDaemonBaseUri}/prices/some/${PRISMA_ADDRESS},${REWARD_TOKEN_ADDRESS}?humanized=true`,
		schema: yDaemonPricesSchema
	});

	const {data: availableToStake, refetch: refetchAvailable} = useContractRead({
		address: YPRISMA_ADDRESS,
		abi: erc20ABI,
		chainId: DEFAULT_CHAIN_ID,
		functionName: 'balanceOf',
		watch: true,
		args: [toAddress(address)],
		select: (data): TNormalizedBN => toNormalizedBN(data)
	});

	const {data: approvedAmount, refetch: refetchAllowance} = useContractRead({
		address: YPRISMA_ADDRESS,
		abi: erc20ABI,
		chainId: DEFAULT_CHAIN_ID,
		functionName: 'allowance',
		args: [toAddress(address), YPRISMA_STAKING_ADDRESS],
		select: (data): TNormalizedBN => toNormalizedBN(data)
	});

	const {data: staked, refetch: refetchStacked} = useContractRead({
		address: YPRISMA_STAKING_ADDRESS,
		abi: YPRISMA_STAKING_ABI,
		chainId: DEFAULT_CHAIN_ID,
		functionName: 'balanceOf',
		args: [toAddress(address)],
		select: (data): TNormalizedBN => toNormalizedBN(data)
	});

	const {data: earned} = useContractRead({
		address: YPRISMA_STAKING_ADDRESS,
		abi: YPRISMA_STAKING_ABI,
		chainId: DEFAULT_CHAIN_ID,
		watch: true,
		functionName: 'earned',
		args: [toAddress(address)],
		select: (data): TNormalizedBN => toNormalizedBN(data)
	});

	useEffect((): void => {
		set_amountToUse(availableToStake);
	}, [availableToStake]);

	const onChangeInput = useCallback((value: string): void => {
		set_amountToUse(handleInputChangeEventValue(value, 18));
	}, []);

	/**********************************************************************************************
	 * Actions to Approve, Stake, Unstake and Claim
	 *********************************************************************************************/
	const onApproveYPrisma = useCallback(async (): Promise<void> => {
		const result = await approveERC20({
			connector: provider,
			chainID: DEFAULT_CHAIN_ID,
			contractAddress: YPRISMA_ADDRESS,
			spenderAddress: YPRISMA_STAKING_ADDRESS,
			amount: toBigInt(amountToUse?.raw),
			statusHandler: set_txStatusApprove
		});
		if (result.isSuccessful) {
			refetchAllowance();
		}
	}, [amountToUse?.raw, provider, refetchAllowance]);

	const onStakeYPrisma = useCallback(async (): Promise<void> => {
		const result = await stakeYPrisma({
			connector: provider,
			chainID: DEFAULT_CHAIN_ID,
			contractAddress: YPRISMA_STAKING_ADDRESS,
			amount: toBigInt(amountToUse?.raw),
			statusHandler: set_txStatusStake
		});
		if (result.isSuccessful) {
			await Promise.all([refetchAvailable(), refetchStacked(), refetchAllowance()]);
			set_amountToUse(undefined);
		}
	}, [amountToUse?.raw, provider, refetchStacked, refetchAllowance, refetchAvailable]);

	const onUnstakeYPrisma = useCallback(async (): Promise<void> => {
		const result = await unstakeYPrisma({
			connector: provider,
			chainID: DEFAULT_CHAIN_ID,
			contractAddress: YPRISMA_STAKING_ADDRESS,
			statusHandler: set_txStatusUnstake
		});
		if (result.isSuccessful) {
			await Promise.all([refetchAvailable(), refetchStacked(), refetchAllowance()]);
			set_amountToUse(undefined);
		}
	}, [provider, refetchAvailable, refetchStacked, refetchAllowance]);

	const onClaimRewards = useCallback(async (): Promise<void> => {
		const result = await claimRewards({
			connector: provider,
			chainID: DEFAULT_CHAIN_ID,
			contractAddress: YPRISMA_STAKING_ADDRESS,
			statusHandler: set_txStatusClaim
		});
		if (result.isSuccessful) {
			refetchAvailable();
		}
	}, [provider, refetchAvailable]);

	/**********************************************************************************************
	 * Some render functions
	 *********************************************************************************************/
	function renderStakeView(): ReactElement {
		return (
			<div className={'col-span-3 flex items-center gap-6 rounded-lg bg-neutral-100'}>
				<AmountInput
					label={'Available to stake, yPrisma'}
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
								{`You have: ${formatAmount(availableToStake?.normalized || 0, 2, 6)} yPrisma`}
							</p>
							<p
								suppressHydrationWarning
								className={'text-neutral-400'}>
								{`$${formatAmount(
									Number(amountToUse?.normalized || 0) * Number(prices?.[PRISMA_ADDRESS] || 0)
								)}`}
							</p>
						</div>
					}
				/>
				<div className={'-mx-2'}>
					<Link
						href={'/?tab=unstake'}
						scroll={false}
						replace
						shallow>
						<button
							className={cl(
								'cursor-pointer rounded-lg p-2 text-xl leading-6',
								'bg-neutral-100 hover:bg-neutral-200 transition-colors'
							)}>
							&#8646;
						</button>
					</Link>
				</div>
				<AmountInput
					label={'Staked amount'}
					disabled
					amount={amountToUse}
					legend={
						<div className={'flex flex-row justify-end'}>
							<p
								suppressHydrationWarning
								className={'text-neutral-400'}>
								{`$${formatAmount(
									Number(amountToUse?.normalized || 0) * Number(prices?.[PRISMA_ADDRESS] || 0)
								)}`}
							</p>
						</div>
					}
				/>
				<div className={'mt-[3px]'}>
					<div className={'flex gap-4'}>
						<Button
							isBusy={txStatusApprove.pending}
							className={'min-w-[150px]'}
							isDisabled={
								!isActive ||
								!amountToUse ||
								toBigInt(amountToUse?.raw) === 0n ||
								toBigInt(amountToUse?.raw) > toBigInt(availableToStake?.raw) ||
								toBigInt(approvedAmount?.raw) >= toBigInt(amountToUse?.raw)
							}
							onClick={onApproveYPrisma}>
							{'Approve'}
						</Button>
						<Button
							isBusy={txStatusStake.pending}
							className={'min-w-[150px]'}
							isDisabled={
								!isActive ||
								!amountToUse ||
								toBigInt(amountToUse?.raw) === 0n ||
								toBigInt(approvedAmount?.raw) < toBigInt(amountToUse?.raw)
							}
							onClick={onStakeYPrisma}>
							{'Stake'}
						</Button>
					</div>
				</div>
			</div>
		);
	}

	function renderClaimView(): ReactElement {
		return (
			<div className={'col-span-3 flex items-center gap-6 rounded-lg bg-neutral-100'}>
				<AmountInput
					label={'Earned amount, wstETH'}
					disabled
					amount={earned}
					legend={
						<div className={'flex flex-row justify-end'}>
							<p
								suppressHydrationWarning
								className={'text-neutral-400'}>
								{`$${formatAmount(
									Number(earned?.normalized || 0) * Number(prices?.[REWARD_TOKEN_ADDRESS] || 0)
								)}`}
							</p>
						</div>
					}
				/>
				<div className={'mt-[3px]'}>
					<div className={'flex gap-4'}>
						<Button
							isBusy={txStatusClaim.pending}
							className={'min-w-[316px]'}
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
			<div className={'col-span-3 flex items-center gap-6 rounded-lg bg-neutral-100'}>
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
									Number(staked?.normalized || 0) * Number(prices?.[PRISMA_ADDRESS] || 0)
								)}`}
							</p>
						</div>
					}
				/>
				<div className={'-mx-2'}>
					<Link
						href={'/?tab=stake'}
						scroll={false}
						replace
						shallow>
						<button
							className={cl(
								'cursor-pointer rounded-lg p-2 text-xl leading-6',
								'bg-neutral-100 hover:bg-neutral-200 transition-colors'
							)}>
							&#8646;
						</button>
					</Link>
				</div>
				<AmountInput
					label={'Amount to unstake, yPrisma'}
					disabled
					amount={staked}
					legend={
						<div className={'flex flex-row justify-end'}>
							<p
								suppressHydrationWarning
								className={'text-neutral-400'}>
								{`$${formatAmount(
									Number(staked?.normalized || 0) * Number(prices?.[PRISMA_ADDRESS] || 0)
								)}`}
							</p>
						</div>
					}
				/>
				<div className={'mt-[3px]'}>
					<div className={'flex gap-4'}>
						<Button
							key={'unstake button'}
							isBusy={txStatusUnstake.pending}
							className={'min-w-[316px]'}
							isDisabled={!isActive || !amountToUse || toBigInt(staked?.raw) === 0n}
							onClick={onUnstakeYPrisma}>
							{'Unstake + Claim'}
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<>
			<div className={cl('col-span-3 w-full items-center rounded-lg bg-neutral-100')}>
				<div className={'mb-10'}>
					{tab === 'stake' && renderStakeView()}
					{tab === 'unstake' && renderUnstakeView()}
				</div>

				<div>{renderClaimView()}</div>
			</div>

			<div className={cl('col-span-3 w-full items-center rounded-lg bg-neutral-100')}>
				<dl className={'flex flex-col gap-4 rounded-lg bg-neutral-200 p-4 md:p-6'}>
					<div>
						<b className={'text-lg'}>{'Your position details'}</b>
					</div>

					<div className={'flex w-full items-baseline justify-between'}>
						<dt className={'text-neutral-900/60'}>{'Fancy APR'}</dt>
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
						<dt className={'text-neutral-900/60'}>{'Available to stake'}</dt>
						<dd className={'font-number font-bold'}>
							{formatAmount(availableToStake?.normalized || 0, 6, 6)}
							<span className={'font-normal text-neutral-900/60'}>{' yPrisma'}</span>
						</dd>
					</div>

					<div className={'flex w-full items-baseline justify-between'}>
						<dt className={'text-neutral-900/60'}>{'Already staked'}</dt>
						<dd className={'font-number font-bold'}>
							{formatAmount(staked?.normalized || 0, 6, 6)}
							<span className={'font-normal text-neutral-900/60'}>{' yPrisma'}</span>
						</dd>
					</div>

					<div className={'flex w-full items-baseline justify-between'}>
						<dt className={'text-neutral-900/60'}>{'Amount earned'}</dt>
						<dd>
							<b className={'font-number block'}>
								{formatAmount(earned?.normalized || 0, 6, 6)}
								&nbsp;
								<span className={'font-normal text-neutral-900/60'}>{' wstETH'}</span>
							</b>
							<small className={'font-number block text-right text-xs text-neutral-900/60'}>
								{`$ ${formatAmount(
									Number(earned?.normalized) * Number(prices?.[REWARD_TOKEN_ADDRESS]) || 0,
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

export {StakeYPrisma};
