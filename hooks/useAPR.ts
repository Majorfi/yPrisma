import {useMemo} from 'react';
import {YPRISMA_STAKING_ABI} from 'utils/abi/stakingContract.abi';
import {DEFAULT_CHAIN_ID, PRISMA_ADDRESS, REWARD_TOKEN_ADDRESS, YPRISMA_STAKING_ADDRESS} from 'utils/actions';
import {useContractReads} from 'wagmi';
import {toBigInt, toNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import {yDaemonPricesSchema} from '@yearn-finance/web-lib/utils/schemas/yDaemonPricesSchema';

import {useFetch} from './useFetch';
import {useYDaemonBaseURI} from './useYDaemonBaseURI';

import type {TYDaemonPrices} from '@yearn-finance/web-lib/utils/schemas/yDaemonPricesSchema';

export function useAPR(): number {
	const {yDaemonBaseUri} = useYDaemonBaseURI({chainID: 1});
	const {data: prices} = useFetch<TYDaemonPrices>({
		endpoint: `${yDaemonBaseUri}/prices/some/${PRISMA_ADDRESS},${REWARD_TOKEN_ADDRESS}?humanized=true`,
		schema: yDaemonPricesSchema
	});

	const {data} = useContractReads({
		contracts: [
			{
				address: YPRISMA_STAKING_ADDRESS,
				abi: YPRISMA_STAKING_ABI,
				chainId: DEFAULT_CHAIN_ID,
				functionName: 'periodFinish'
			},
			{
				address: YPRISMA_STAKING_ADDRESS,
				abi: YPRISMA_STAKING_ABI,
				chainId: DEFAULT_CHAIN_ID,
				functionName: 'rewardRate'
			},
			{
				address: YPRISMA_STAKING_ADDRESS,
				abi: YPRISMA_STAKING_ABI,
				chainId: DEFAULT_CHAIN_ID,
				functionName: 'totalSupply'
			},
			{
				address: YPRISMA_STAKING_ADDRESS,
				abi: YPRISMA_STAKING_ABI,
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
		const tokenPrice = prices?.[PRISMA_ADDRESS];
		const rewardPrice = prices?.[REWARD_TOKEN_ADDRESS];
		const perStakingTokenRate = Number(rewardRate.normalized) / Number(totalSupply.normalized);
		const secondsPerYear = 31_556_952;
		const ratePerYear = perStakingTokenRate * secondsPerYear;
		const stakingRewardAPR = ((Number(ratePerYear) * Number(rewardPrice)) / Number(tokenPrice)) * 100;

		return stakingRewardAPR;
	}, [data, prices]);

	return calculatedAPR;
}
