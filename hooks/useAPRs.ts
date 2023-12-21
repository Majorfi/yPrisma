import {useMemo} from 'react';
import {STAKING_ABI} from 'utils/abi/stakingContract.abi';
import {DEFAULT_CHAIN_ID} from 'utils/constants';
import {yDaemonPricesSchema} from 'utils/yDaemonPricesSchema';
import {useContractReads} from 'wagmi';
import {toBigInt, toNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';

import {useFetch} from './useFetch';
import {useYDaemonBaseURI} from './useYDaemonBaseURI';

import type {TAddress} from '@yearn-finance/web-lib/types';
import type {TYDaemonPrices} from '@yearn-finance/web-lib/utils/schemas/yDaemonPricesSchema';

export type TUseAPRProps = {
	stakingContract: TAddress;
	stakingToken: TAddress;
	rewardToken: TAddress;
};

export function useAPRs(props: TUseAPRProps[]): [number[], {value: number; index: number}] {
	const {yDaemonBaseUri} = useYDaemonBaseURI({chainID: 1});
	const allStakingTokens = props.map((contract): TAddress => contract.stakingToken);

	const {data: prices} = useFetch<TYDaemonPrices>({
		endpoint: `${yDaemonBaseUri}/prices/some/${allStakingTokens},${'0x4591dbff62656e7859afe5e45f6f47d3669fbb28'}?humanized=true`,
		schema: yDaemonPricesSchema
	});

	const {data} = useContractReads({
		contracts: [
			...props
				.map((item): any => {
					return [
						{
							address: item.stakingContract,
							abi: STAKING_ABI,
							chainId: DEFAULT_CHAIN_ID,
							functionName: 'periodFinish'
						},
						{
							address: item.stakingContract,
							abi: STAKING_ABI,
							chainId: DEFAULT_CHAIN_ID,
							functionName: 'rewardRate'
						},
						{
							address: item.stakingContract,
							abi: STAKING_ABI,
							chainId: DEFAULT_CHAIN_ID,
							functionName: 'totalSupply'
						}
					];
				})
				.flat()
		]
	});

	const calculatedAPRs = useMemo((): number[] => {
		if (!data || !prices) {
			return props.map((): number => 0);
		}

		let rIndex = 0;
		const APRs = [];
		const now = Date.now() / 1000;
		for (const item of props) {
			const periodFinish = Number(data?.[rIndex++].result);
			const rewardRate = toNormalizedBN(toBigInt(data?.[rIndex++].result as bigint), 18);
			const totalSupply = toNormalizedBN(toBigInt(data?.[rIndex++].result as bigint), 18);

			if (periodFinish < now) {
				APRs.push(0);
				continue;
			}

			if (totalSupply.raw === 0n) {
				APRs.push(0);
				continue;
			}

			const tokenPrice = Number(prices?.[item.stakingToken]);
			const rewardPrice = 1;
			const perStakingTokenRate = Number(rewardRate.normalized) / Number(totalSupply.normalized);
			const secondsPerYear = 31_556_952;
			const ratePerYear = perStakingTokenRate * secondsPerYear;
			const stakingRewardAPR = ((Number(ratePerYear) * Number(rewardPrice)) / Number(tokenPrice)) * 100;
			APRs.push(stakingRewardAPR);
		}

		return APRs;
	}, [data, prices, props]);

	const biggest = useMemo((): {value: number; index: number} => {
		let index = 0;
		let value = 0;
		for (let i = 0; i < calculatedAPRs.length; i++) {
			if (calculatedAPRs[i] > value) {
				value = calculatedAPRs[i];
				index = i;
			}
		}

		return {value, index};
	}, [calculatedAPRs]);

	return [calculatedAPRs, biggest];
}
