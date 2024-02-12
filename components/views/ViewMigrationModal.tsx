import React, {Fragment, useState} from 'react';
import {MigrateModal} from 'components/common/MigrateLegacyYPrismaModal';
import {DEFAULT_CHAIN_ID, YPRISMA_LEGACY_ADDRESS} from 'utils/constants';
import {erc20ABI, useContractRead} from 'wagmi';
import {useWeb3} from '@builtbymom/web3/contexts/useWeb3';
import {cl, toAddress, toBigInt, toNormalizedBN} from '@builtbymom/web3/utils';

import type {ReactElement} from 'react';
import type {TNormalizedBN} from '@builtbymom/web3/types';

export function ViewMigrationModal(): ReactElement {
	const {address} = useWeb3();
	const [shouldDisplayMigrateModal, set_shouldDisplayMigrateModal] = useState<boolean>(false);

	const {data: legacyBalance, refetch} = useContractRead({
		address: YPRISMA_LEGACY_ADDRESS,
		abi: erc20ABI,
		chainId: DEFAULT_CHAIN_ID,
		functionName: 'balanceOf',
		args: [toAddress(address)],
		select: (data): TNormalizedBN => toNormalizedBN(data, 18)
	});

	if (toBigInt(legacyBalance?.raw) === 0n) {
		return <Fragment />;
	}

	return (
		<>
			<div className={'relative'}>
				<span className={'absolute -right-1 -top-1 z-10 flex h-3 w-3'}>
					<span
						className={
							'absolute inline-flex h-full w-full animate-ping rounded-full bg-[rgb(236,184,64)] opacity-75'
						}
					/>
					<span className={'relative inline-flex h-3 w-3 rounded-full bg-[rgb(236,184,64)]'}></span>
				</span>
				<button
					onClick={(): void => set_shouldDisplayMigrateModal(true)}
					className={cl(
						'w-36 rounded-lg text-center transition-colors cursor-pointer p-1',
						'bg-neutral-200/0 hover:bg-neutral-200 border-2 border-neutral-200 h-10'
					)}>
					<p className={'whitespace-nowrap'}>{'Migrate'}</p>
				</button>
			</div>
			<MigrateModal
				isOpen={shouldDisplayMigrateModal}
				set_isOpen={set_shouldDisplayMigrateModal}
				balance={legacyBalance}
				refetchBalance={refetch}
			/>
		</>
	);
}
