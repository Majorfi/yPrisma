import {Fragment, useState} from 'react';
import Confetti from 'react-dom-confetti';
import Link from 'next/link';
import {Dialog, Transition} from '@headlessui/react';
import {useUpdateEffect} from '@react-hookz/web';
import {Button} from '@yearn-finance/web-lib/components/Button';
import {cl} from '@yearn-finance/web-lib/utils/cl';

import type {ReactElement} from 'react';

function SuccessModal({isOpen, set_isOpen}: {isOpen: boolean; set_isOpen: (isOpen: boolean) => void}): ReactElement {
	const [shouldTriggerConfettis, set_shouldTriggerConfettis] = useState(false);

	useUpdateEffect((): void => {
		if (isOpen) {
			setTimeout((): void => set_shouldTriggerConfettis(true), 300);
		} else {
			set_shouldTriggerConfettis(false);
		}
	}, [isOpen]);

	return (
		<Transition.Root
			show={isOpen}
			as={Fragment}>
			<Dialog
				as={'div'}
				className={'relative z-[1000]'}
				onClose={set_isOpen}>
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

				<div className={'fixed inset-0 z-[1001] flex h-screen w-screen items-center justify-center'}>
					<Confetti
						active={shouldTriggerConfettis}
						config={{spread: 500}}
					/>
				</div>
				<div className={'fixed inset-0 z-[1001] w-screen overflow-y-auto'}>
					<div className={'flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0'}>
						<Transition.Child
							as={Fragment}
							enter={'ease-out duration-300'}
							enterFrom={'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'}
							enterTo={'opacity-100 translate-y-0 sm:scale-100'}
							leave={'ease-in duration-200'}
							leaveFrom={'opacity-100 translate-y-0 sm:scale-100'}
							leaveTo={'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'}>
							<Dialog.Panel
								className={cl(
									'relative overflow-hidden rounded-3xl !bg-neutral-200 !p-10 transition-all',
									'sm:my-8 sm:w-full sm:max-w-lg sm:p-6'
								)}>
								<div>
									<div className={'text-center'}>
										<Dialog.Title
											as={'h3'}
											className={'text-3xl font-semibold leading-6 text-neutral-900'}>
											{'You did it!'}
										</Dialog.Title>
										<div className={'mt-6'}>
											<p className={'text-neutral-900/80'}>
												{
													'Now that your wallet is heaving with new coins, you should check out great yield opportunities at Yearn. '
												}
											</p>

											<p className={'mt-2 font-bold'}>
												{'You can now stake it with Yearn to get even more tokens!'}
											</p>
										</div>
									</div>
								</div>
								<div className={'mt-10 flex items-center justify-center text-center'}>
									<Link
										href={'/?tab=stake'}
										passHref>
										<Button>{'Stake it for a fancy APR!'}</Button>
									</Link>
								</div>
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition.Root>
	);
}
export {SuccessModal};
