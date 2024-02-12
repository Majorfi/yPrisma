import React, {useCallback, useMemo, useRef, useState} from 'react';
import IconCheck from 'components/icons/IconCheck';
import IconCircleCross from 'components/icons/IconCircleCross';
import {checkENSValidity} from 'utils/tools.ens';
import {isZeroAddress, toAddress} from '@builtbymom/web3/utils';
import {IconLoader} from '@yearn-finance/web-lib/icons/IconLoader';
import {ZERO_ADDRESS} from '@yearn-finance/web-lib/utils/constants';

import type {ReactElement} from 'react';
import type {TAddress} from '@builtbymom/web3/types';

export type TInputAddressLike = {
	address: TAddress | undefined;
	label: string;
	isValid: boolean | 'undetermined';
};
export const defaultInputAddressLike: TInputAddressLike = {
	address: undefined,
	label: '',
	isValid: false
};

function AddressInput({
	value,
	onChangeValue
}: {
	value: TInputAddressLike;
	onChangeValue: (value: TInputAddressLike) => void;
}): ReactElement {
	const [isLoadingValidish, set_isLoadingValidish] = useState<boolean>(false);
	const currentLabel = useRef<string>(value.label);
	const isFocused = useRef<boolean>(false);
	const status = useMemo((): 'valid' | 'invalid' | 'warning' | 'pending' | 'none' => {
		if (value.isValid === true) {
			return 'valid';
		}
		if (value.isValid === false && value.label !== '' && value.address === ZERO_ADDRESS) {
			return 'invalid';
		}
		if (value.isValid === false && value.label !== '' && !isLoadingValidish && !isFocused.current) {
			return 'invalid';
		}
		if (isLoadingValidish) {
			return 'pending';
		}
		return 'none';
	}, [value, isLoadingValidish, isFocused]);

	const onChange = useCallback(
		async (label: string): Promise<void> => {
			currentLabel.current = label;

			if (label.endsWith('.eth') && label.length > 4) {
				onChangeValue({address: undefined, label, isValid: 'undetermined'});
				set_isLoadingValidish(true);
				const [address, isValid] = await checkENSValidity(label);
				if (currentLabel.current === label) {
					onChangeValue({address, label, isValid});
				}
				set_isLoadingValidish(false);
			} else if (!isZeroAddress(toAddress(label))) {
				onChangeValue({address: toAddress(label), label, isValid: true});
			} else {
				onChangeValue({address: undefined, label, isValid: false});
			}
		},
		[onChangeValue, currentLabel]
	);

	return (
		<>
			<div className={'flex h-10 w-full items-center rounded-md bg-neutral-200 p-2 transition-colors'}>
				<input
					aria-invalid={status === 'invalid'}
					onFocus={async (): Promise<void> => {
						isFocused.current = true;
						onChange(value.label);
					}}
					onBlur={(): void => {
						isFocused.current = false;
					}}
					onChange={async (e): Promise<void> => onChange(e.target.value)}
					required
					autoComplete={'off'}
					spellCheck={false}
					placeholder={'0x...'}
					type={'text'}
					value={value.label}
					className={
						'w-full overflow-x-scroll truncate border-none bg-transparent px-0 py-4 pr-2 font-mono text-sm font-bold outline-none scrollbar-none'
					}
				/>
				<label
					className={
						status === 'invalid' || status === 'warning'
							? 'relative pr-4'
							: 'pointer-events-none relative size-4 pr-4'
					}>
					<span className={status === 'invalid' || status === 'warning' ? 'tooltip' : 'pointer-events-none'}>
						<div className={'pointer-events-none relative size-4'}>
							<IconCheck
								className={`absolute size-4 text-[#16a34a] transition-opacity ${
									status === 'valid' ? 'opacity-100' : 'opacity-0'
								}`}
							/>
							<IconCircleCross
								className={`absolute size-4 text-[#e11d48] transition-opacity ${
									status === 'invalid' ? 'opacity-100' : 'opacity-0'
								}`}
							/>
							<div className={'absolute inset-0 flex items-center justify-center'}>
								<IconLoader
									className={`size-4 animate-spin text-neutral-900 transition-opacity ${
										status === 'pending' ? 'opacity-100' : 'opacity-0'
									}`}
								/>
							</div>
						</div>
						<span className={'tooltiptextsmall'}>
							{status === 'invalid' && 'This address is invalid'}
							{status === 'warning' && 'This address is already in use'}
						</span>
					</span>
				</label>
			</div>
			<legend className={`mt-1 pl-1 text-xs md:mr-0`}>&nbsp;</legend>
		</>
	);
}

export default AddressInput;
