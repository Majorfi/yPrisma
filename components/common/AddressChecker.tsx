import React from 'react';
import Link from 'next/link';
import AddressInput from 'components/common/AddressInput';
import {useUpdateEffect} from '@react-hookz/web';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {toAddress} from '@yearn-finance/web-lib/utils/address';

import type {TInputAddressLike} from 'components/common/AddressInput';
import type {Dispatch, ReactElement, SetStateAction} from 'react';

function AddressChecker(props: {
	receiver: TInputAddressLike;
	set_receiver: Dispatch<SetStateAction<TInputAddressLike>>;
	onCheckEligibility: () => void;
}): ReactElement {
	const {address} = useWeb3();

	useUpdateEffect((): void => {
		if (
			address &&
			(props.receiver.address !== address ||
				props.receiver.address === toAddress('') ||
				props.receiver.address === undefined)
		) {
			props.set_receiver({address, label: address, isValid: true});
		}
	}, [address]);

	return (
		<div className={'flex w-full flex-col space-x-0 md:flex-row md:space-x-4'}>
			<div className={'w-full'}>
				<small className={'block pb-1 text-neutral-900/60'}>{'Your address or ENS'}</small>
				<AddressInput
					value={props.receiver}
					onChangeValue={(e): void => props.set_receiver(e)}
				/>
			</div>

			<div className={'flex flex-row space-x-4 pt-4 md:pt-0'}>
				<div className={'w-1/2 md:w-max'}>
					<small className={'hidden pb-1 text-neutral-900/60 md:block'}>&nbsp;</small>
					<Button
						onClick={props.onCheckEligibility}
						className={'w-full whitespace-nowrap md:min-w-[150px]'}>
						{'Check Eligibility'}
					</Button>
				</div>
				<div className={'w-1/2 md:w-max'}>
					<small className={'hidden pb-1 text-neutral-900/60 md:block'}>&nbsp;</small>
					<Link
						href={'https://github.com/prisma-fi/airdrop-proofs/tree/main/proofs'}
						target={'_blank'}>
						<Button
							variant={'outlined'}
							className={'w-full cursor-alias whitespace-nowrap md:min-w-[150px]'}>
							{'Check Proofs'}
							<svg
								className={'ml-2 h-4 w-4'}
								viewBox={'0 0 98 96'}
								xmlns={'http://www.w3.org/2000/svg'}>
								<path
									fillRule={'evenodd'}
									clipRule={'evenodd'}
									d={
										'M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z'
									}
									fill={'currentColor'}
								/>
							</svg>
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}

export {AddressChecker};
