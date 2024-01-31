export const CURVE_POOL_ABI = [
	{
		name: 'Transfer',
		inputs: [
			{name: 'sender', type: 'address', indexed: true},
			{name: 'receiver', type: 'address', indexed: true},
			{name: 'value', type: 'uint256', indexed: false}
		],
		anonymous: false,
		type: 'event'
	},
	{
		name: 'Approval',
		inputs: [
			{name: 'owner', type: 'address', indexed: true},
			{name: 'spender', type: 'address', indexed: true},
			{name: 'value', type: 'uint256', indexed: false}
		],
		anonymous: false,
		type: 'event'
	},
	{
		name: 'TokenExchange',
		inputs: [
			{name: 'buyer', type: 'address', indexed: true},
			{name: 'sold_id', type: 'int128', indexed: false},
			{name: 'tokens_sold', type: 'uint256', indexed: false},
			{name: 'bought_id', type: 'int128', indexed: false},
			{name: 'tokens_bought', type: 'uint256', indexed: false}
		],
		anonymous: false,
		type: 'event'
	},
	{
		name: 'AddLiquidity',
		inputs: [
			{name: 'provider', type: 'address', indexed: true},
			{name: 'token_amounts', type: 'uint256[2]', indexed: false},
			{name: 'fees', type: 'uint256[2]', indexed: false},
			{name: 'invariant', type: 'uint256', indexed: false},
			{name: 'token_supply', type: 'uint256', indexed: false}
		],
		anonymous: false,
		type: 'event'
	},
	{
		name: 'RemoveLiquidity',
		inputs: [
			{name: 'provider', type: 'address', indexed: true},
			{name: 'token_amounts', type: 'uint256[2]', indexed: false},
			{name: 'fees', type: 'uint256[2]', indexed: false},
			{name: 'token_supply', type: 'uint256', indexed: false}
		],
		anonymous: false,
		type: 'event'
	},
	{
		name: 'RemoveLiquidityOne',
		inputs: [
			{name: 'provider', type: 'address', indexed: true},
			{name: 'token_amount', type: 'uint256', indexed: false},
			{name: 'coin_amount', type: 'uint256', indexed: false},
			{name: 'token_supply', type: 'uint256', indexed: false}
		],
		anonymous: false,
		type: 'event'
	},
	{
		name: 'RemoveLiquidityImbalance',
		inputs: [
			{name: 'provider', type: 'address', indexed: true},
			{name: 'token_amounts', type: 'uint256[2]', indexed: false},
			{name: 'fees', type: 'uint256[2]', indexed: false},
			{name: 'invariant', type: 'uint256', indexed: false},
			{name: 'token_supply', type: 'uint256', indexed: false}
		],
		anonymous: false,
		type: 'event'
	},
	{
		name: 'RampA',
		inputs: [
			{name: 'old_A', type: 'uint256', indexed: false},
			{name: 'new_A', type: 'uint256', indexed: false},
			{name: 'initial_time', type: 'uint256', indexed: false},
			{name: 'future_time', type: 'uint256', indexed: false}
		],
		anonymous: false,
		type: 'event'
	},
	{
		name: 'StopRampA',
		inputs: [
			{name: 'A', type: 'uint256', indexed: false},
			{name: 't', type: 'uint256', indexed: false}
		],
		anonymous: false,
		type: 'event'
	},
	{
		name: 'CommitNewFee',
		inputs: [{name: 'new_fee', type: 'uint256', indexed: false}],
		anonymous: false,
		type: 'event'
	},
	{name: 'ApplyNewFee', inputs: [{name: 'fee', type: 'uint256', indexed: false}], anonymous: false, type: 'event'},
	{stateMutability: 'nonpayable', type: 'constructor', inputs: [], outputs: []},
	{
		stateMutability: 'nonpayable',
		type: 'function',
		name: 'initialize',
		inputs: [
			{name: '_name', type: 'string'},
			{name: '_symbol', type: 'string'},
			{name: '_coins', type: 'address[4]'},
			{name: '_rate_multipliers', type: 'uint256[4]'},
			{name: '_A', type: 'uint256'},
			{name: '_fee', type: 'uint256'}
		],
		outputs: []
	},
	{stateMutability: 'view', type: 'function', name: 'decimals', inputs: [], outputs: [{name: '', type: 'uint8'}]},
	{
		stateMutability: 'nonpayable',
		type: 'function',
		name: 'transfer',
		inputs: [
			{name: '_to', type: 'address'},
			{name: '_value', type: 'uint256'}
		],
		outputs: [{name: '', type: 'bool'}]
	},
	{
		stateMutability: 'nonpayable',
		type: 'function',
		name: 'transferFrom',
		inputs: [
			{name: '_from', type: 'address'},
			{name: '_to', type: 'address'},
			{name: '_value', type: 'uint256'}
		],
		outputs: [{name: '', type: 'bool'}]
	},
	{
		stateMutability: 'nonpayable',
		type: 'function',
		name: 'approve',
		inputs: [
			{name: '_spender', type: 'address'},
			{name: '_value', type: 'uint256'}
		],
		outputs: [{name: '', type: 'bool'}]
	},
	{
		stateMutability: 'nonpayable',
		type: 'function',
		name: 'permit',
		inputs: [
			{name: '_owner', type: 'address'},
			{name: '_spender', type: 'address'},
			{name: '_value', type: 'uint256'},
			{name: '_deadline', type: 'uint256'},
			{name: '_v', type: 'uint8'},
			{name: '_r', type: 'bytes32'},
			{name: '_s', type: 'bytes32'}
		],
		outputs: [{name: '', type: 'bool'}]
	},
	{stateMutability: 'view', type: 'function', name: 'last_price', inputs: [], outputs: [{name: '', type: 'uint256'}]},
	{stateMutability: 'view', type: 'function', name: 'ema_price', inputs: [], outputs: [{name: '', type: 'uint256'}]},
	{
		stateMutability: 'view',
		type: 'function',
		name: 'get_balances',
		inputs: [],
		outputs: [{name: '', type: 'uint256[2]'}]
	},
	{stateMutability: 'view', type: 'function', name: 'admin_fee', inputs: [], outputs: [{name: '', type: 'uint256'}]},
	{stateMutability: 'view', type: 'function', name: 'A', inputs: [], outputs: [{name: '', type: 'uint256'}]},
	{stateMutability: 'view', type: 'function', name: 'A_precise', inputs: [], outputs: [{name: '', type: 'uint256'}]},
	{stateMutability: 'view', type: 'function', name: 'get_p', inputs: [], outputs: [{name: '', type: 'uint256'}]},
	{
		stateMutability: 'view',
		type: 'function',
		name: 'price_oracle',
		inputs: [],
		outputs: [{name: '', type: 'uint256'}]
	},
	{
		stateMutability: 'view',
		type: 'function',
		name: 'get_virtual_price',
		inputs: [],
		outputs: [{name: '', type: 'uint256'}]
	},
	{
		stateMutability: 'view',
		type: 'function',
		name: 'calc_token_amount',
		inputs: [
			{name: '_amounts', type: 'uint256[2]'},
			{name: '_is_deposit', type: 'bool'}
		],
		outputs: [{name: '', type: 'uint256'}]
	},
	{
		stateMutability: 'nonpayable',
		type: 'function',
		name: 'add_liquidity',
		inputs: [
			{name: '_amounts', type: 'uint256[2]'},
			{name: '_min_mint_amount', type: 'uint256'}
		],
		outputs: [{name: '', type: 'uint256'}]
	},
	{
		stateMutability: 'nonpayable',
		type: 'function',
		name: 'add_liquidity',
		inputs: [
			{name: '_amounts', type: 'uint256[2]'},
			{name: '_min_mint_amount', type: 'uint256'},
			{name: '_receiver', type: 'address'}
		],
		outputs: [{name: '', type: 'uint256'}]
	},
	{
		stateMutability: 'view',
		type: 'function',
		name: 'get_dy',
		inputs: [
			{name: 'i', type: 'int128'},
			{name: 'j', type: 'int128'},
			{name: 'dx', type: 'uint256'}
		],
		outputs: [{name: '', type: 'uint256'}]
	},
	{
		stateMutability: 'nonpayable',
		type: 'function',
		name: 'exchange',
		inputs: [
			{name: 'i', type: 'int128'},
			{name: 'j', type: 'int128'},
			{name: '_dx', type: 'uint256'},
			{name: '_min_dy', type: 'uint256'}
		],
		outputs: [{name: '', type: 'uint256'}]
	},
	{
		stateMutability: 'nonpayable',
		type: 'function',
		name: 'exchange',
		inputs: [
			{name: 'i', type: 'int128'},
			{name: 'j', type: 'int128'},
			{name: '_dx', type: 'uint256'},
			{name: '_min_dy', type: 'uint256'},
			{name: '_receiver', type: 'address'}
		],
		outputs: [{name: '', type: 'uint256'}]
	},
	{
		stateMutability: 'nonpayable',
		type: 'function',
		name: 'remove_liquidity',
		inputs: [
			{name: '_burn_amount', type: 'uint256'},
			{name: '_min_amounts', type: 'uint256[2]'}
		],
		outputs: [{name: '', type: 'uint256[2]'}]
	},
	{
		stateMutability: 'nonpayable',
		type: 'function',
		name: 'remove_liquidity',
		inputs: [
			{name: '_burn_amount', type: 'uint256'},
			{name: '_min_amounts', type: 'uint256[2]'},
			{name: '_receiver', type: 'address'}
		],
		outputs: [{name: '', type: 'uint256[2]'}]
	},
	{
		stateMutability: 'nonpayable',
		type: 'function',
		name: 'remove_liquidity_imbalance',
		inputs: [
			{name: '_amounts', type: 'uint256[2]'},
			{name: '_max_burn_amount', type: 'uint256'}
		],
		outputs: [{name: '', type: 'uint256'}]
	},
	{
		stateMutability: 'nonpayable',
		type: 'function',
		name: 'remove_liquidity_imbalance',
		inputs: [
			{name: '_amounts', type: 'uint256[2]'},
			{name: '_max_burn_amount', type: 'uint256'},
			{name: '_receiver', type: 'address'}
		],
		outputs: [{name: '', type: 'uint256'}]
	},
	{
		stateMutability: 'view',
		type: 'function',
		name: 'calc_withdraw_one_coin',
		inputs: [
			{name: '_burn_amount', type: 'uint256'},
			{name: 'i', type: 'int128'}
		],
		outputs: [{name: '', type: 'uint256'}]
	},
	{
		stateMutability: 'nonpayable',
		type: 'function',
		name: 'remove_liquidity_one_coin',
		inputs: [
			{name: '_burn_amount', type: 'uint256'},
			{name: 'i', type: 'int128'},
			{name: '_min_received', type: 'uint256'}
		],
		outputs: [{name: '', type: 'uint256'}]
	},
	{
		stateMutability: 'nonpayable',
		type: 'function',
		name: 'remove_liquidity_one_coin',
		inputs: [
			{name: '_burn_amount', type: 'uint256'},
			{name: 'i', type: 'int128'},
			{name: '_min_received', type: 'uint256'},
			{name: '_receiver', type: 'address'}
		],
		outputs: [{name: '', type: 'uint256'}]
	},
	{
		stateMutability: 'nonpayable',
		type: 'function',
		name: 'ramp_A',
		inputs: [
			{name: '_future_A', type: 'uint256'},
			{name: '_future_time', type: 'uint256'}
		],
		outputs: []
	},
	{stateMutability: 'nonpayable', type: 'function', name: 'stop_ramp_A', inputs: [], outputs: []},
	{
		stateMutability: 'nonpayable',
		type: 'function',
		name: 'set_ma_exp_time',
		inputs: [{name: '_ma_exp_time', type: 'uint256'}],
		outputs: []
	},
	{
		stateMutability: 'view',
		type: 'function',
		name: 'admin_balances',
		inputs: [{name: 'i', type: 'uint256'}],
		outputs: [{name: '', type: 'uint256'}]
	},
	{
		stateMutability: 'nonpayable',
		type: 'function',
		name: 'commit_new_fee',
		inputs: [{name: '_new_fee', type: 'uint256'}],
		outputs: []
	},
	{stateMutability: 'nonpayable', type: 'function', name: 'apply_new_fee', inputs: [], outputs: []},
	{stateMutability: 'nonpayable', type: 'function', name: 'withdraw_admin_fees', inputs: [], outputs: []},
	{stateMutability: 'pure', type: 'function', name: 'version', inputs: [], outputs: [{name: '', type: 'string'}]},
	{
		stateMutability: 'view',
		type: 'function',
		name: 'coins',
		inputs: [{name: 'arg0', type: 'uint256'}],
		outputs: [{name: '', type: 'address'}]
	},
	{
		stateMutability: 'view',
		type: 'function',
		name: 'balances',
		inputs: [{name: 'arg0', type: 'uint256'}],
		outputs: [{name: '', type: 'uint256'}]
	},
	{stateMutability: 'view', type: 'function', name: 'fee', inputs: [], outputs: [{name: '', type: 'uint256'}]},
	{stateMutability: 'view', type: 'function', name: 'future_fee', inputs: [], outputs: [{name: '', type: 'uint256'}]},
	{
		stateMutability: 'view',
		type: 'function',
		name: 'admin_action_deadline',
		inputs: [],
		outputs: [{name: '', type: 'uint256'}]
	},
	{stateMutability: 'view', type: 'function', name: 'initial_A', inputs: [], outputs: [{name: '', type: 'uint256'}]},
	{stateMutability: 'view', type: 'function', name: 'future_A', inputs: [], outputs: [{name: '', type: 'uint256'}]},
	{
		stateMutability: 'view',
		type: 'function',
		name: 'initial_A_time',
		inputs: [],
		outputs: [{name: '', type: 'uint256'}]
	},
	{
		stateMutability: 'view',
		type: 'function',
		name: 'future_A_time',
		inputs: [],
		outputs: [{name: '', type: 'uint256'}]
	},
	{stateMutability: 'view', type: 'function', name: 'name', inputs: [], outputs: [{name: '', type: 'string'}]},
	{stateMutability: 'view', type: 'function', name: 'symbol', inputs: [], outputs: [{name: '', type: 'string'}]},
	{
		stateMutability: 'view',
		type: 'function',
		name: 'balanceOf',
		inputs: [{name: 'arg0', type: 'address'}],
		outputs: [{name: '', type: 'uint256'}]
	},
	{
		stateMutability: 'view',
		type: 'function',
		name: 'allowance',
		inputs: [
			{name: 'arg0', type: 'address'},
			{name: 'arg1', type: 'address'}
		],
		outputs: [{name: '', type: 'uint256'}]
	},
	{
		stateMutability: 'view',
		type: 'function',
		name: 'totalSupply',
		inputs: [],
		outputs: [{name: '', type: 'uint256'}]
	},
	{
		stateMutability: 'view',
		type: 'function',
		name: 'DOMAIN_SEPARATOR',
		inputs: [],
		outputs: [{name: '', type: 'bytes32'}]
	},
	{
		stateMutability: 'view',
		type: 'function',
		name: 'nonces',
		inputs: [{name: 'arg0', type: 'address'}],
		outputs: [{name: '', type: 'uint256'}]
	},
	{
		stateMutability: 'view',
		type: 'function',
		name: 'ma_exp_time',
		inputs: [],
		outputs: [{name: '', type: 'uint256'}]
	},
	{
		stateMutability: 'view',
		type: 'function',
		name: 'ma_last_time',
		inputs: [],
		outputs: [{name: '', type: 'uint256'}]
	}
] as const;
