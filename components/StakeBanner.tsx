import React from 'react';
import Link from 'next/link';
import {Button} from '@yearn-finance/web-lib/components/Button';

import {PercentCounter} from './AmountCounter';

import type {ReactElement} from 'react';

function StakeBanner(props: {APR: number}): ReactElement {
	return (
		<div
			className={'rounded-xl p-1'}
			style={{
				backgroundImage:
					'-webkit-linear-gradient(0deg, rgba(200,25,40,1) 0%, rgba(219,110,55,1) 20%, rgba(236,184,64,1) 40%, rgba(104,183,120,1) 60%, rgba(71,119,211,1) 80%, rgba(72,44,216,1) 100%)'
			}}>
			<div className={'flex h-full flex-col rounded-xl bg-neutral-100 p-4 md:px-10 md:py-6'}>
				<div className={'flex w-full flex-col justify-between gap-6 md:flex-row md:items-center'}>
					<div>
						<p className={'w-full whitespace-break-spaces text-xl font-bold text-neutral-900 md:text-3xl'}>
							{'Every rainbow needs\na pot of gold.'}
						</p>
					</div>

					<div className={'flex flex-col items-center justify-center md:min-w-[260px]'}>
						<b
							suppressHydrationWarning
							className={'font-number w-full text-center text-3xl text-neutral-900'}>
							<PercentCounter value={props.APR} />
							{` APR`}
						</b>
						<Link
							className={'mt-2 w-full md:mt-0 md:w-fit'}
							href={'/?tab=stake'}
							scroll={false}
							replace
							shallow>
							<Button className={'mt-2 h-10 w-full md:w-[200px]'}>{'Stake now'}</Button>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}

export {StakeBanner};
