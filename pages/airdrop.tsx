import React from 'react';
import Image from 'next/image';
import {SmallStakeBanner} from 'components/common/StakeBanner';
import {AboutAirdrop, AboutHeading, AboutYPrisma} from 'components/views/ViewAbout';
import {ViewClaimAirdrop} from 'components/views/ViewClaimAirdrop';
import {useYLockers} from 'contexts/useLockers';

import type {ReactElement} from 'react';

function Airdrop(): ReactElement {
	const {biggestAPR} = useYLockers();

	function renderHeading(): ReactElement {
		return (
			<header className={'grid-cols-12 gap-0 md:grid md:pt-12'}>
				<div className={'col-span-12 md:col-span-8 md:mb-0 md:pr-20'}>
					<div className={'mb-10 flex flex-col justify-center'}>
						<AboutHeading />
					</div>
					<div className={'mb-8 border-neutral-200 py-2 text-neutral-700 md:border-l-4 md:pl-6'}>
						<AboutYPrisma />
						<AboutAirdrop />
					</div>
				</div>

				<div className={'relative col-span-12 hidden flex-col items-center md:col-span-4 md:flex'}>
					<Image
						priority
						alt={''}
						src={'./prisma.svg'}
						width={400}
						height={400}
					/>
					<SmallStakeBanner APR={biggestAPR} />
				</div>
			</header>
		);
	}

	return (
		<div className={'relative mx-auto mb-0 flex w-full flex-col bg-neutral-0 pt-6'}>
			<div className={'relative mx-auto mt-6 w-screen max-w-6xl pb-40 '}>
				{renderHeading()}

				<div className={'mt-4 rounded-xl bg-neutral-100'}>
					<ViewClaimAirdrop />
				</div>
			</div>
		</div>
	);
}

export default Airdrop;
