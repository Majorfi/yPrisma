import React, {useEffect} from 'react';
import {motion, useSpring, useTransform} from 'framer-motion';
import {formatAmount} from '@yearn-finance/web-lib/utils/format.number';

import type {ReactElement} from 'react';

function Counter({value}: {value: number}): ReactElement {
	const v = useSpring(value, {mass: 0.5, stiffness: 75, damping: 15});
	const display = useTransform(v, (current): string => `${formatAmount(current)}`);

	useEffect((): void => {
		v.set(value);
	}, [v, value]);

	return <motion.span suppressHydrationWarning>{display}</motion.span>;
}

export {Counter};
