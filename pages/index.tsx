import React from 'react';

import type {ReactElement} from 'react';

function DetailBox(): ReactElement {
	return (
		<div className={'flex max-w-[787px] flex-row rounded-lg bg-[#010936] p-6'}>
			<div>
				<b className={'text-[#00A3FF]'}>{'APR'}</b>
				<b className={'block pt-2 text-5xl text-[#00A3FF]'}>{'137.91%'}</b>
			</div>
			<div className={'mx-8 h-auto w-px bg-[#0027B2]'} />
			<div>
				<b className={'uppercase text-neutral-900'}>{'Yearn total governance position'}</b>
				<div className={'grid grid-cols-2 gap-x-16 gap-y-2 pt-4'}>
					<div className={'flex items-center justify-between gap-x-4'}>
						<p className={'text-neutral-900/70'}>{'Price'}</p>
						<b className={'text-neutral-900'}>{'420.69'}</b>
					</div>
					<div className={'flex items-center justify-between gap-x-4'}>
						<p className={'text-neutral-900/70'}>{'TVL'}</p>
						<b className={'text-neutral-900'}>{'42 m'}</b>
					</div>
					<div className={'flex items-center justify-between gap-x-4'}>
						<p className={'text-neutral-900/70'}>{'Prisma Ratio'}</p>
						<b className={'text-neutral-900'}>{'69.420'}</b>
					</div>
					<div className={'flex items-center justify-between gap-x-4'}>
						<p className={'text-neutral-900/70'}>{'vePRISMA'}</p>
						<b className={'text-neutral-900'}>{'100%'}</b>
					</div>
				</div>
			</div>
		</div>
	);
}

function Index(): ReactElement {
	return (
		<div className={'mx-auto mb-0 flex w-full flex-col pt-[200px]'}>
			<div className={'relative mx-auto w-screen max-w-6xl'}>
				<div className={'pb-8'}>
					<h1 className={'whitespace-break-spaces text-6xl font-bold text-neutral-900'}>
						{'Put your\nyPRISMA to work'}
					</h1>
					<p className={'max-w-[647px] whitespace-break-spaces pt-8 text-neutral-900/60'}>
						{
							'Each week, Yearn’s vePRISMA position earns protocol revenue, bribes, and boosting fees.\nThis revenue is converted to mkUSD stablecoin and distributed to yPRISMA stakers at the start of the week.'
						}
					</p>
				</div>

				<div className={'flex flex-row items-center gap-x-6'}>
					<button className={'h-10 w-[184px] rounded-lg bg-[#00A3FF]'}>{'Launch App'}</button>
					<b className={'text-3xl text-[#00A3FF]'}>{'APR'}</b>
					<b className={'text-3xl text-[#00A3FF]'}>{'137.91%'}</b>
				</div>
			</div>
		</div>
	);
}

export {DetailBox};
export default Index;
