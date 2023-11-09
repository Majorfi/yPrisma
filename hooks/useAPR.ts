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

type TUseAPRProps = {
	stakingContract: TAddress;
	stakingToken: TAddress;
	rewardToken: TAddress;
};
export function useAPR(props: TUseAPRProps): number {
	const {yDaemonBaseUri} = useYDaemonBaseURI({chainID: 1});
	const {data: prices} = useFetch<TYDaemonPrices>({
		endpoint: `${yDaemonBaseUri}/prices/some/${props.stakingToken},${props.rewardToken}?humanized=true`,
		schema: yDaemonPricesSchema
	});

	const {data} = useContractReads({
		contracts: [
			{
				address: props.stakingContract,
				abi: STAKING_ABI,
				chainId: DEFAULT_CHAIN_ID,
				functionName: 'periodFinish'
			},
			{
				address: props.stakingContract,
				abi: STAKING_ABI,
				chainId: DEFAULT_CHAIN_ID,
				functionName: 'rewardRate'
			},
			{
				address: props.stakingContract,
				abi: STAKING_ABI,
				chainId: DEFAULT_CHAIN_ID,
				functionName: 'totalSupply'
			},
			{
				address: props.stakingContract,
				abi: STAKING_ABI,
				chainId: DEFAULT_CHAIN_ID,
				functionName: 'rewardPerToken'
			}
		]
	});

	const calculatedAPR = useMemo((): number => {
		if (!data || !prices) {
			return 0;
		}
		const now = Date.now() / 1000;
		const periodFinish = Number(data?.[0].result);
		if (periodFinish < now) {
			return 0;
		}

		const totalSupply = toNormalizedBN(toBigInt(data?.[2].result), 18);
		if (totalSupply.raw === 0n) {
			return 0;
		}

		const rewardRate = toNormalizedBN(toBigInt(data?.[1].result), 18);
		const tokenPrice = Number(prices?.[props.stakingToken]);
		const rewardPrice = Number(prices?.[props.rewardToken]);
		const perStakingTokenRate = Number(rewardRate.normalized) / Number(totalSupply.normalized);
		const secondsPerYear = 31_556_952;
		const ratePerYear = perStakingTokenRate * secondsPerYear;
		const stakingRewardAPR = ((Number(ratePerYear) * Number(rewardPrice)) / Number(tokenPrice)) * 100;

		return stakingRewardAPR;
	}, [data, prices, props.rewardToken, props.stakingToken]);

	return calculatedAPR;
}
