import React, {createContext, useContext} from 'react';
import {useAPRs} from 'hooks/useAPRs';
import {AVAILABLE_FARMS} from 'utils/constants';

import type {TUseAPRProps} from 'hooks/useAPRs';
import type {ReactElement} from 'react';

export type TYLockersContextApp = {
	APRs: number[];
	biggestAPR: {value: number; index: number};
};

const defaultProps: TYLockersContextApp = {
	APRs: [],
	biggestAPR: {value: 0, index: 0}
};

const YLockersContext = createContext<TYLockersContextApp>(defaultProps);
export const YLockersContextApp = ({children}: {children: ReactElement}): ReactElement => {
	const [APRs, biggestAPR] = useAPRs(
		AVAILABLE_FARMS.map(
			(farm): TUseAPRProps => ({
				stakingContract: farm.stakingContract,
				stakingToken: farm.stakingToken,
				rewardToken: farm.rewardToken
			})
		)
	);

	return <YLockersContext.Provider value={{APRs, biggestAPR}}>{children}</YLockersContext.Provider>;
};

export const useYLockers = (): TYLockersContextApp => useContext(YLockersContext);
