import React, {useMemo, useState} from 'react';
import Image from 'next/image';
import {AmountInput} from 'components/common/AmountInput';
import {CURVE_POOL_ABI} from 'utils/abi/curvePool.abi';
import {PRISMA_LOCKER_ABI} from 'utils/abi/prismaLocker.abi';
import {STAKING_ABI} from 'utils/abi/stakingContract.abi';
import {DEFAULT_CHAIN_ID, YPRISMA_ADDRESS, YPRISMA_CURVE_POOL_ADDRESS} from 'utils/constants';
import {erc20ABI, useContractReads} from 'wagmi';
import {useWeb3} from '@builtbymom/web3/contexts/useWeb3';
import {
	cl,
	decodeAsBigInt,
	formatAmount,
	formatPercent,
	formatUSD,
	formatWithUnit,
	handleInputChangeValue,
	isZeroAddress,
	toAddress,
	toBigInt,
	toNormalizedBN
} from '@builtbymom/web3/utils';
import {defaultTxStatus} from '@builtbymom/web3/utils/wagmi';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {useFetchYearnPrices} from '@yearn-finance/web-lib/hooks/useFetchYearnPrices';

import type {ReactElement} from 'react';
import type {TNormalizedBN} from '@builtbymom/web3/types';

type TYourPosition = {
	balanceOfYPrisma: TNormalizedBN;
	stakedOfYPrisma: TNormalizedBN;
	earnedOfYPrisma: TNormalizedBN;
	totalSupplyOfYPrisma: TNormalizedBN;
	priceRatio: TNormalizedBN;

	vePrismaTotalWeight: TNormalizedBN;
	vePrismaYearnWeight: TNormalizedBN;
};
const defaultYourPosition: TYourPosition = {
	balanceOfYPrisma: toNormalizedBN(0),
	stakedOfYPrisma: toNormalizedBN(0),
	earnedOfYPrisma: toNormalizedBN(0),
	totalSupplyOfYPrisma: toNormalizedBN(0),
	priceRatio: toNormalizedBN(0),
	vePrismaTotalWeight: toNormalizedBN(0),
	vePrismaYearnWeight: toNormalizedBN(0)
};

type TYearnPosition = TYourPosition & {
	price: TNormalizedBN;
};

function StakingAPRSection(): ReactElement {
	return (
		<div className={'border-b-2 border-[#33418D] pb-10'}>
			<b className={'text-base uppercase text-[#00A3FF]'}>{'Average staking APR'}</b>
			<b className={'block font-mono text-5xl text-[#00A3FF]'}>{'137.91%'}</b>
		</div>
	);
}

function YourPositionSection({data}: {data: TYourPosition}): ReactElement {
	return (
		<div className={'mt-4 border-b-2 border-[#33418D] pb-[30px]'}>
			<b className={'uppercase'}>{'Your Position'}</b>
			<dl className={'mt-4 grid gap-2'}>
				<div className={'flex justify-between'}>
					<dt className={'text-white/70'}>{'Your APR'}</dt>
					<dd
						className={'font-number font-bold'}
						suppressHydrationWarning>
						{'137.91%'}
					</dd>
				</div>
				<div className={'flex justify-between'}>
					<dt className={'text-white/70'}>{'Available to stake, yPRISMA'}</dt>
					<dd
						className={'font-number font-bold'}
						suppressHydrationWarning>
						{formatAmount(data.balanceOfYPrisma.normalized)}
					</dd>
				</div>
				<div className={'flex justify-between'}>
					<dt className={'text-white/70'}>{'Staked, yPRISMA'}</dt>
					<dd
						className={'font-number font-bold'}
						suppressHydrationWarning>
						{formatAmount(data.stakedOfYPrisma.normalized)}
					</dd>
				</div>
				<div className={'flex justify-between'}>
					<dt className={'text-white/70'}>{'Claimable, yvmkUSD-A'}</dt>
					<dd
						className={'font-number font-bold'}
						suppressHydrationWarning>
						{formatAmount(data.earnedOfYPrisma.normalized)}
					</dd>
				</div>
			</dl>
		</div>
	);
}

function YearnPositionSection({data}: {data: TYearnPosition}): ReactElement {
	console.warn(data);
	return (
		<div className={'mt-[38px]'}>
			<b className={'uppercase'}>{'yPRISMA Stats'}</b>
			<dl className={'mt-4 grid gap-2'}>
				<div className={'flex justify-between'}>
					<dt className={'text-white/70'}>{'TVL'}</dt>
					<div>
						<dd
							className={'font-number font-bold'}
							suppressHydrationWarning>
							{`$ ${formatWithUnit(data.totalSupplyOfYPrisma.normalized * data.price.normalized, 2, 4, {
								locales: ['en-US']
							})}`}
						</dd>
						<dd
							className={'font-number text-right text-xs text-white/60'}
							suppressHydrationWarning>
							{formatAmount(data.totalSupplyOfYPrisma.normalized)}
						</dd>
					</div>
				</div>
				<div className={'flex justify-between'}>
					<dt className={'text-white/70'}>{'Price'}</dt>
					<dd
						className={'font-number font-bold'}
						suppressHydrationWarning>
						{formatUSD(data.price.normalized)}
					</dd>
				</div>
				<div className={'flex justify-between'}>
					<dt className={'text-white/70'}>{'Prisma Ratio'}</dt>
					<dd
						className={'font-number font-bold'}
						suppressHydrationWarning>
						{formatAmount(data.priceRatio.normalized, 2, 2)}
					</dd>
				</div>
				<div className={'flex justify-between'}>
					<dt className={'text-white/70'}>{'Gov. Share'}</dt>
					<dd
						className={'font-number font-bold'}
						suppressHydrationWarning>
						{formatPercent(
							(data.vePrismaYearnWeight.normalized / data.vePrismaTotalWeight.normalized) * 100,
							2,
							2
						)}
					</dd>
				</div>
			</dl>
		</div>
	);
}

function TabSelector({data}: {data: TYourPosition}): ReactElement {
	const [selectedTab, set_selectedTab] = useState(1);

	return (
		<>
			<div className={'flex gap-6 border-b-2 border-[#111B53] px-8'}>
				<button
					onClick={(): void => set_selectedTab(0)}
					className={cl(
						selectedTab === 0
							? 'text-white border-white'
							: 'hover:text-white/70 hover:border-white/70 text-[#555D8D] border-transparent',
						'border-b-2 pb-4 transition-colors hidden'
					)}>
					{'Get yPRISMA'}
				</button>
				<button
					onClick={(): void => set_selectedTab(1)}
					className={cl(
						selectedTab === 1
							? 'text-white border-white'
							: 'hover:text-white/70 hover:border-white/70 text-[#555D8D] border-transparent',
						'border-b-2 pb-4 transition-colors'
					)}>
					{'Stake'}
				</button>
				<button
					onClick={(): void => set_selectedTab(2)}
					className={cl(
						selectedTab === 2
							? 'text-white border-white'
							: 'hover:text-white/70 hover:border-white/70 text-[#555D8D] border-transparent',
						'border-b-2 pb-4 transition-colors'
					)}>
					{'Unstake'}
				</button>
				<button
					onClick={(): void => set_selectedTab(3)}
					className={cl(
						selectedTab === 3
							? 'text-white border-white'
							: 'hover:text-white/70 hover:border-white/70 text-[#555D8D] border-transparent',
						'border-b-2 pb-4 transition-colors'
					)}>
					{'Claim rewards'}
				</button>
			</div>
			<div className={'px-8 pt-[30px]'}>
				{selectedTab === 1 && <TabStake data={data} />}
				{selectedTab === 2 && <TabUnStake data={data} />}
				{selectedTab === 3 && <TabRewards data={data} />}
			</div>
		</>
	);
}

function TabStake({data}: {data: TYourPosition}): ReactElement {
	const {address, isActive} = useWeb3();
	const [txStatusExit, set_txStatusExit] = useState(defaultTxStatus);
	const [amountToWithdraw, set_amountToWithdraw] = useState<TNormalizedBN | undefined>(undefined);

	return (
		<div>
			<div>
				<div className={'pb-2'}>
					<p className={'text-[#F4F4F4]'}>{`Stake, yPrisma`}</p>
				</div>
				<div className={'flex flex-col items-start gap-2 md:col-span-3 md:flex-row md:gap-6'}>
					<div className={'w-full max-w-[356px]'}>
						<AmountInput
							amount={amountToWithdraw}
							maxAmount={data.balanceOfYPrisma}
							onAmountChange={(value): void => set_amountToWithdraw(handleInputChangeValue(value, 18))}
							onLegendClick={(): void => set_amountToWithdraw(data.balanceOfYPrisma)}
							onMaxClick={(): void => set_amountToWithdraw(data.balanceOfYPrisma)}
							legend={
								<div className={'flex flex-row justify-between'}>
									<p
										suppressHydrationWarning
										className={'text-neutral-400'}>
										{`You have ${formatAmount(
											data.balanceOfYPrisma?.normalized || 0,
											2,
											6
										)} yPrisma`}
									</p>
								</div>
							}
						/>
					</div>
					<div className={'mt-4 w-full md:mt-0 md:w-[316px]'}>
						<div className={'flex w-full gap-4'}>
							<Button
								isBusy={txStatusExit.pending}
								className={'px-14 py-2'}
								isDisabled={
									false &&
									(!isActive ||
										toBigInt(data.balanceOfYPrisma?.raw) === 0n ||
										toBigInt(amountToWithdraw?.raw) !== toBigInt(data.balanceOfYPrisma?.raw))
								}>
								<b className={'text-base text-white'}>{'Stake'}</b>
							</Button>
						</div>
					</div>
				</div>
			</div>
			<div className={'max-w-[356px] pt-[60px]'}>
				<b className={'block pb-2 uppercase text-white'}>{'Charge your yield'}</b>
				<p className={'text-white/70'}>
					{
						'Draper please write copy here. Draper please write copy here. Draper please write copy here. Draper please write copy here. '
					}
				</p>
				<div className={'mt-7 rounded-2xl bg-[#001170]'}>
					<Image
						className={'w-full p-2 pt-[18px]'}
						src={'/chargeYourYield.svg'}
						width={129}
						height={34}
						alt={'Charge your yield'}
					/>
				</div>
			</div>
		</div>
	);
}

function TabUnStake({data}: {data: TYourPosition}): ReactElement {
	const {address, isActive} = useWeb3();
	const [txStatusExit, set_txStatusExit] = useState(defaultTxStatus);
	const [amountToWithdraw, set_amountToWithdraw] = useState<TNormalizedBN | undefined>(undefined);

	return (
		<div>
			<div>
				<div className={'pb-2'}>
					<p className={'text-[#F4F4F4]'}>{`Unstake, yPrisma`}</p>
				</div>
				<div className={'flex flex-col items-start gap-2 md:col-span-3 md:flex-row md:gap-6'}>
					<div className={'w-full max-w-[356px]'}>
						<AmountInput
							amount={amountToWithdraw}
							maxAmount={data.stakedOfYPrisma}
							onAmountChange={(value): void => set_amountToWithdraw(handleInputChangeValue(value, 18))}
							onLegendClick={(): void => set_amountToWithdraw(data.stakedOfYPrisma)}
							onMaxClick={(): void => set_amountToWithdraw(data.stakedOfYPrisma)}
							legend={
								<div className={'flex flex-row justify-between'}>
									<p
										suppressHydrationWarning
										className={'text-neutral-400'}>
										{`You have ${formatAmount(
											data.stakedOfYPrisma?.normalized || 0,
											2,
											6
										)} staked yPrisma`}
									</p>
								</div>
							}
						/>
					</div>
					<div className={'mt-4 w-full md:mt-0 md:w-[316px]'}>
						<div className={'flex w-full gap-4'}>
							<Button
								isBusy={txStatusExit.pending}
								className={'px-14 py-2'}
								isDisabled={
									false &&
									(!isActive ||
										toBigInt(data.stakedOfYPrisma?.raw) === 0n ||
										toBigInt(amountToWithdraw?.raw) !== toBigInt(data.stakedOfYPrisma?.raw))
								}>
								<b className={'text-base text-white'}>{'Unstake'}</b>
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function TabRewards({data}: {data: TYourPosition}): ReactElement {
	const {address, isActive} = useWeb3();
	const [txStatusExit, set_txStatusExit] = useState(defaultTxStatus);

	const rewards = [
		{name: 'yvmkUSD-A', amount: toNormalizedBN('1002000000000000000000')},
		{name: 'yvmkUSD-B', amount: toNormalizedBN('34000000000000000000')},
		{name: 'yvmkUSD-C', amount: toNormalizedBN('45738000000000000000000')}
	];

	return (
		<div className={'grid gap-7'}>
			<div className={'scrollbar-show grid gap-7 overflow-y-scroll md:max-h-[440px]'}>
				{rewards.map(reward => (
					<div>
						<div className={'pb-2'}>
							<p className={'text-[#F4F4F4]'}>{`You earned, ${reward.name}`}</p>
						</div>
						<div className={'flex flex-col items-start gap-2 md:col-span-3 md:flex-row md:gap-6'}>
							<div className={'w-full max-w-[356px]'}>
								<AmountInput
									amount={reward.amount}
									disabled
								/>
							</div>
							<div className={'mt-4 w-full md:mt-0 md:w-[316px]'}>
								<div className={'flex w-full gap-4'}>
									<Button
										isBusy={txStatusExit.pending}
										className={'px-14 py-2'}
										isDisabled={
											false &&
											(!isActive ||
												toBigInt(data.stakedOfYPrisma?.raw) === 0n ||
												toBigInt(reward.amount?.raw) !== toBigInt(data.stakedOfYPrisma?.raw))
										}>
										<b className={'text-base text-white'}>{'Claim'}</b>
									</Button>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
			<div className={'flex w-full gap-4'}>
				<Button
					isBusy={txStatusExit.pending}
					className={'px-14 py-2'}>
					<b className={'text-base text-white'}>{'Claim All'}</b>
				</Button>
			</div>
		</div>
	);
}

function Index(): ReactElement {
	const {address} = useWeb3();
	const prices = useFetchYearnPrices();
	const yPrismaPrice = useMemo(() => toNormalizedBN(prices?.[DEFAULT_CHAIN_ID]?.[YPRISMA_ADDRESS] || 0, 6), [prices]);

	// There are two important numbers for our locked position:
	// Amount locked
	// Weight

	const {data} = useContractReads({
		contracts: [
			{
				address: YPRISMA_ADDRESS,
				abi: erc20ABI,
				chainId: DEFAULT_CHAIN_ID,
				functionName: 'balanceOf',
				args: [toAddress(address)]
			},
			{
				address: YPRISMA_ADDRESS,
				abi: STAKING_ABI,
				chainId: DEFAULT_CHAIN_ID,
				functionName: 'balanceOf',
				args: [toAddress(address)]
			},
			{
				address: YPRISMA_ADDRESS,
				abi: STAKING_ABI,
				chainId: DEFAULT_CHAIN_ID,
				functionName: 'earned',
				args: [toAddress(address)]
			},
			{
				address: YPRISMA_ADDRESS,
				abi: erc20ABI,
				chainId: DEFAULT_CHAIN_ID,
				functionName: 'totalSupply'
			},
			{
				address: YPRISMA_CURVE_POOL_ADDRESS,
				abi: CURVE_POOL_ABI,
				chainId: DEFAULT_CHAIN_ID,
				functionName: 'price_oracle'
			},
			{
				address: toAddress(`0x3f78544364c3eCcDCe4d9C89a630AEa26122829d`),
				abi: PRISMA_LOCKER_ABI,
				chainId: DEFAULT_CHAIN_ID,
				functionName: 'getTotalWeight'
			},
			{
				address: toAddress(`0x3f78544364c3eCcDCe4d9C89a630AEa26122829d`),
				abi: PRISMA_LOCKER_ABI,
				chainId: DEFAULT_CHAIN_ID,
				functionName: 'getAccountWeight',
				args: [toAddress('0x90be6DFEa8C80c184C442a36e17cB2439AAE25a7')] //Yearn locker
			}
		],
		select: (data): TYourPosition => {
			const totalSupplyOfYPrisma = toNormalizedBN(decodeAsBigInt(data[3]));
			const priceRatio = toNormalizedBN(decodeAsBigInt(data[4]));
			const vePrismaTotalWeight = toNormalizedBN(decodeAsBigInt(data[5]));
			const vePrismaYearnWeight = toNormalizedBN(decodeAsBigInt(data[6]));
			if (isZeroAddress(address)) {
				return {
					...defaultYourPosition,
					totalSupplyOfYPrisma,
					priceRatio,
					vePrismaTotalWeight,
					vePrismaYearnWeight
				};
			}
			return {
				balanceOfYPrisma: toNormalizedBN(decodeAsBigInt(data[0])),
				stakedOfYPrisma: toNormalizedBN(decodeAsBigInt(data[1])),
				earnedOfYPrisma: toNormalizedBN(decodeAsBigInt(data[2])),
				vePrismaTotalWeight,
				vePrismaYearnWeight,
				totalSupplyOfYPrisma,
				priceRatio
			};
		}
	});

	return (
		<div className={'relative mx-auto w-screen max-w-6xl pt-52'}>
			<div className={'grid w-full max-w-[1200px] grid-cols-3 rounded-r-lg bg-[#000B49]'}>
				<div className={'col-span-1 rounded-l-lg bg-[#001170] p-10'}>
					<StakingAPRSection />
					<YourPositionSection data={data || defaultYourPosition} />
					<YearnPositionSection
						data={{
							...(data || defaultYourPosition),
							price: yPrismaPrice
						}}
					/>
				</div>
				<div className={'col-span-2 py-4'}>
					<TabSelector data={data || defaultYourPosition} />
				</div>
			</div>
		</div>
	);
}

export default Index;
