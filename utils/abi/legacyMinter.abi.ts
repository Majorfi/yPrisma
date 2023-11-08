export const LEGACY_MINTER_ABI = [
	{
		stateMutability: 'nonpayable',
		type: 'constructor',
		inputs: [
			{name: '_yprisma', type: 'address'},
			{name: '_legacy_token', type: 'address'}
		],
		outputs: []
	},
	{
		stateMutability: 'nonpayable',
		type: 'function',
		name: 'redeem',
		inputs: [],
		outputs: [{name: '', type: 'uint256'}]
	},
	{
		stateMutability: 'nonpayable',
		type: 'function',
		name: 'redeem',
		inputs: [{name: '_amount', type: 'uint256'}],
		outputs: [{name: '', type: 'uint256'}]
	},
	{
		stateMutability: 'nonpayable',
		type: 'function',
		name: 'redeem',
		inputs: [
			{name: '_amount', type: 'uint256'},
			{name: '_recipient', type: 'address'}
		],
		outputs: [{name: '', type: 'uint256'}]
	},
	{stateMutability: 'view', type: 'function', name: 'yprisma', inputs: [], outputs: [{name: '', type: 'address'}]},
	{
		stateMutability: 'view',
		type: 'function',
		name: 'legacy_token',
		inputs: [],
		outputs: [{name: '', type: 'address'}]
	}
] as const;
