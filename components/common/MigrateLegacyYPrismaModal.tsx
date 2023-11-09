import {Fragment, useCallback, useState} from 'react';
import {approveERC20, migrateOGYPrisma} from 'utils/actions';
import {DEFAULT_CHAIN_ID, LEGACY_MINTER_ADDRESS, YPRISMA_LEGACY_ADDRESS} from 'utils/constants';
import {erc20ABI, useContractRead} from 'wagmi';
import {Dialog, Transition} from '@headlessui/react';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {useWeb3} from '@yearn-finance/web-lib/contexts/useWeb3';
import {toAddress} from '@yearn-finance/web-lib/utils/address';
import {cl} from '@yearn-finance/web-lib/utils/cl';
import {toBigInt, toNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';
import {defaultTxStatus} from '@yearn-finance/web-lib/utils/web3/transaction';

import {Counter} from './AmountCounter';

import type {ReactElement} from 'react';
import type {TNormalizedBN} from '@yearn-finance/web-lib/utils/format.bigNumber';

function ModalContent({
	balance,
	refetchBalance
}: {
	balance: TNormalizedBN | undefined;
	refetchBalance: VoidFunction;
}): ReactElement {
	const {provider, address, isActive} = useWeb3();
	const [txStatusApprove, set_txStatusApprove] = useState(defaultTxStatus);
	const [txStatusMigrate, set_txStatusMigrate] = useState(defaultTxStatus);

	const {data: approvedAmount, refetch: refetchAllowance} = useContractRead({
		address: YPRISMA_LEGACY_ADDRESS,
		abi: erc20ABI,
		chainId: DEFAULT_CHAIN_ID,
		functionName: 'allowance',
		args: [toAddress(address), LEGACY_MINTER_ADDRESS],
		select: (data): TNormalizedBN => toNormalizedBN(data)
	});

	const onApproveYPrisma = useCallback(async (): Promise<void> => {
		const result = await approveERC20({
			connector: provider,
			chainID: DEFAULT_CHAIN_ID,
			contractAddress: YPRISMA_LEGACY_ADDRESS,
			spenderAddress: LEGACY_MINTER_ADDRESS,
			amount: toBigInt(balance?.raw),
			statusHandler: set_txStatusApprove
		});
		if (result.isSuccessful) {
			refetchAllowance();
		}
	}, [balance?.raw, provider, refetchAllowance]);

	const onMigrateYPrisma = useCallback(async (): Promise<void> => {
		const result = await migrateOGYPrisma({
			connector: provider,
			chainID: DEFAULT_CHAIN_ID,
			contractAddress: LEGACY_MINTER_ADDRESS,
			statusHandler: set_txStatusMigrate
		});
		if (result.isSuccessful) {
			refetchBalance();
		}
	}, [provider, refetchBalance]);

	return (
		<div className={'text-left'}>
			<div className={'rounded bg-neutral-300 px-10 pb-4 pt-10'}>
				<h3 className={'text-center text-3xl font-semibold text-neutral-900'}>{'yPrisma OG user? Nice.'}</h3>
				<div className={'mt-6'}>
					<p className={'text-neutral-900/80'}>
						<b>{'- The Good:'}</b>
						{' you are an OG user and you have some yPrisma tokens.'}
					</p>
					<p className={'text-neutral-900/80'}>
						<b>{'- The Bad:'}</b>
						{' you need to migrate your yPrismaOG to the fancy new yPrisma tokens.'}
					</p>
					<p className={'text-neutral-900/80'}>
						<b>{'- The Ugly:'}</b>
						{' not you, you are beautiful.'}
					</p>
				</div>
			</div>
			<div className={'flex flex-col items-center py-10'}>
				<b className={'font-number text-xl text-neutral-900 md:text-6xl'}>
					<Counter value={Number(balance?.normalized || 0)} />
				</b>
				<span className={'block pt-2 text-xs text-neutral-900/60 md:text-base'}>
					{'yPrismaOG tokens to migrate'}
				</span>
			</div>
			<div className={'mb-10 flex items-center justify-center gap-6 text-center'}>
				<div className={'flex gap-4'}>
					<Button
						onClick={onApproveYPrisma}
						isBusy={txStatusApprove.pending}
						className={'min-w-[150px]'}
						isDisabled={
							!isActive ||
							!balance ||
							toBigInt(balance?.raw) === 0n ||
							toBigInt(approvedAmount?.raw) >= toBigInt(balance?.raw)
						}>
						{'Approve'}
					</Button>
					<Button
						onClick={onMigrateYPrisma}
						isBusy={txStatusMigrate.pending}
						className={'min-w-[150px]'}
						isDisabled={
							!isActive ||
							!balance ||
							toBigInt(balance?.raw) === 0n ||
							toBigInt(approvedAmount?.raw) < toBigInt(balance?.raw)
						}>
						{'Migrate'}
					</Button>
				</div>
			</div>
		</div>
	);
}
function MigrateModal(props: {
	isOpen: boolean;
	set_isOpen: (isOpen: boolean) => void;
	balance: TNormalizedBN | undefined;
	refetchBalance: VoidFunction;
}): ReactElement {
	return (
		<Transition.Root
			show={props.isOpen}
			as={Fragment}>
			<Dialog
				as={'div'}
				className={'relative z-[1000]'}
				onClose={props.set_isOpen}>
				<Transition.Child
					as={Fragment}
					enter={'ease-out duration-300'}
					enterFrom={'opacity-0'}
					enterTo={'opacity-100'}
					leave={'ease-in duration-200'}
					leaveFrom={'opacity-100'}
					leaveTo={'opacity-0'}>
					<div className={'fixed inset-0 bg-neutral-0/75 backdrop-blur-sm transition-opacity'} />
				</Transition.Child>

				<div className={'fixed inset-0 z-[1001] w-screen overflow-y-auto'}>
					<div className={'flex min-h-full items-end justify-center p-4 text-center md:items-center md:p-0'}>
						<Transition.Child
							as={Fragment}
							enter={'ease-out duration-300'}
							enterFrom={'opacity-0 translate-y-4 md:translate-y-0 md:scale-95'}
							enterTo={'opacity-100 translate-y-0 md:scale-100'}
							leave={'ease-in duration-200'}
							leaveFrom={'opacity-100 translate-y-0 md:scale-100'}
							leaveTo={'opacity-0 translate-y-4 md:translate-y-0 md:scale-95'}>
							<Dialog.Panel>
								<div
									className={cl(
										'relative overflow-hidden rounded-3xl !bg-neutral-200 transition-all',
										'md:w-full md:max-w-2xl !p-0'
									)}>
									<Dialog.Title className={'hidden'}>&nbsp;</Dialog.Title>
									<ModalContent
										balance={props.balance}
										refetchBalance={props.refetchBalance}
									/>
								</div>
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition.Root>
	);
}
export {MigrateModal};
