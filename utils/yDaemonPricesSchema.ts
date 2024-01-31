import {z} from 'zod';

import type {TAddress} from '@builtbymom/web3/types';

export const ADDRESS_REGEX = new RegExp(/^0x[0-9a-f]{40}$/i);

export const addressSchema = z.custom<TAddress>((val): boolean => {
	return ADDRESS_REGEX.test(val as TAddress);
});

export const yDaemonPriceSchema = z.number();

export const yDaemonPricesSchema = z.record(addressSchema, yDaemonPriceSchema);

export type TYDaemonPrice = z.infer<typeof yDaemonPriceSchema>;

export type TYDaemonPrices = z.infer<typeof yDaemonPricesSchema>;
