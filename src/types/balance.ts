// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BigN from 'bignumber.js';

export type BalanceValueInfo = {
  value: BigN;
  convertedValue: BigN;
  pastConvertedValue: BigN;
};

export type PriceChangeStatus = 'increase' | 'decrease';

export type TokenBalanceItemType = {
  slug: string;
  logoKey: string;
  symbol: string;
  chain?: string;
  chainDisplayName?: string;
  isTestnet: boolean;
  priceValue: number;
  price24hValue: number;
  priceChangeStatus?: PriceChangeStatus;
  free: BalanceValueInfo;
  locked: BalanceValueInfo;
  total: BalanceValueInfo;
  isReady: boolean;
};
