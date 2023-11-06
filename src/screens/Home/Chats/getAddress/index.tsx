// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { _AssetRef, _AssetType, _ChainAsset, _ChainInfo, _MultiChainAsset } from '@subwallet/chain-list/types';

import {
  _getAssetDecimals,
  _getOriginChainOfAsset,
  _isAssetFungibleToken,
  _isChainEvmCompatible,
  _isTokenTransferredByEvm,
} from '@subwallet/extension-base/services/chain-service/utils';
import { isSameAddress } from '@subwallet/extension-base/utils';
import React, { useCallback, useMemo, useState } from 'react';
import { isAddress, isEthereumAddress } from '@polkadot/util-crypto';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { findAccountByAddress } from 'utils/account';

import useGetChainPrefixBySlug from 'hooks/chain/useGetChainPrefixBySlug';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { TransactionFormValues, useTransaction } from 'hooks/screen/Transaction/useTransactionV2';
import { useWatch } from 'react-hook-form';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  View,
} from 'react-native';
import { ScreenContainer } from 'components/ScreenContainer';
import { Header } from 'components/Header';
import { SubHeader } from 'components/SubHeader';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'routes/index';
import i18n from 'utils/i18n/i18n';
import { InputAddress } from 'components/Input/InputAddressV2';
import { Button } from 'components/design-system-ui';
import { FormItem } from 'components/common/FormItem';
import { ValidateResult } from 'react-hook-form/dist/types/validator';
import { ChatText } from 'phosphor-react-native';
import { getButtonIcon } from 'utils/button';

import createStylesheet from './styles';

interface TransferFormValues extends TransactionFormValues {
  to: string;
  destChain: string;
  value: string;
}


export const GetAddress = () => {
  const theme = useSubWalletTheme().swThemes;
  const stylesheet = createStylesheet(theme);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { currentAccount } = useSelector((state: RootState) => state.accountState);
  const {
    title,
    form: {
      setValue,
      resetField,
      getValues,
      control,
      handleSubmit,
      trigger,
      setFocus,
      formState: { errors, dirtyFields },
    },

  } = useTransaction<TransferFormValues>('send-fund', {
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: {
      destChain: '',
      to: '',
    },
  });

  const {
    from: fromValue,
    to: toValue,
    destChain: destChainValue,
  } = {
    ...useWatch<TransferFormValues>({ control }),
    ...getValues(),
  };



  const { chainInfoMap } = useSelector((root: RootState) => root.chainStore);

  const { accounts } = useSelector((state: RootState) => state.accountState);


  const [loading, setLoading] = useState(false);
  const destChainNetworkPrefix = useGetChainPrefixBySlug(destChainValue);
  const destChainGenesisHash = chainInfoMap[destChainValue]?.substrateInfo?.genesisHash || '';


  const recipientAddressRules = useMemo(
    () => ({
      validate: (
        _recipientAddress: string,
        { chain, destChain, from }: TransactionFormValues,
      ): Promise<ValidateResult> => {
        if (!_recipientAddress) {
          return Promise.resolve('Recipient address is required');
        }

        if (!isAddress(_recipientAddress)) {
          return Promise.resolve('Invalid Recipient address');
        }

        if (!from || !chain || !destChain) {
          return Promise.resolve(undefined);
        }

        const isOnChain = chain === destChain;

        const account = findAccountByAddress(accounts, _recipientAddress);

        if (isOnChain) {
          if (isSameAddress(from, _recipientAddress)) {
            return Promise.resolve('The recipient address can not be the same as the sender address');
          }

          const isNotSameAddressType =
            (isEthereumAddress(from) && !!_recipientAddress && !isEthereumAddress(_recipientAddress)) ||
            (!isEthereumAddress(from) && !!_recipientAddress && isEthereumAddress(_recipientAddress));

          if (isNotSameAddressType) {
            return Promise.resolve('The recipient address must be same type as the current account address.');
          }
        } else {
          const isDestChainEvmCompatible = _isChainEvmCompatible(chainInfoMap[destChain]);

          if (isDestChainEvmCompatible !== isEthereumAddress(_recipientAddress)) {
            return Promise.resolve(
              `The recipient address must be ${isDestChainEvmCompatible ? 'EVM' : 'substrate'} type`,
            );
          }
        }

        if (account?.isHardware) {
          const destChainInfo = chainInfoMap[destChain];
          const availableGen: string[] = account.availableGenesisHashes || [];

          if (
            !isEthereumAddress(account.address) &&
            !availableGen.includes(destChainInfo?.substrateInfo?.genesisHash || '')
          ) {
            const destChainName = destChainInfo?.name || 'Unknown';

            return Promise.resolve(
              `'Wrong network. Your Ledger account is not supported by ${destChainName}. Please choose another receiving account and try again.'`,
            );
          }
        }

        return Promise.resolve(undefined);
      },
    }),
    [accounts, chainInfoMap],
  );



  const onSubheaderPressBack = useCallback(() => {
    navigation.goBack();
  }, [navigation, resetField]);

  const onSubmit = () => {
    navigation.navigate('Chat', {
      sender: currentAccount?.address || '',
      receiver: toValue
    })
    return

  }

  const isSubmitButtonDisable = (() => {
    return loading || !!errors.value;
  })();

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScreenContainer>
        <>
          <Header disabled={loading} />

          <View style={stylesheet.subheader}>
            <SubHeader
              title={'Chat Address'}
              onPressBack={onSubheaderPressBack}
              disabled={loading}
              titleTextAlign={'left'}
            />
          </View>

          <>
            <ScrollView
              style={stylesheet.scrollView}
              contentContainerStyle={stylesheet.scrollViewContentContainer}
              keyboardShouldPersistTaps={'handled'}>
              <>
                <FormItem
                  control={control}
                  rules={recipientAddressRules}
                  render={({ field: { value, ref, onChange, onBlur } }) => (
                    <InputAddress
                      ref={ref}
                      label={'Chat with'}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      onSideEffectChange={onBlur}
                      placeholder={i18n.placeholder.accountAddress}
                      disabled={loading}
                      addressPrefix={destChainNetworkPrefix}
                      networkGenesisHash={destChainGenesisHash}
                      showAddressBook
                      saveAddress
                    />
                  )}
                  name="to"
                />
              </>
            </ScrollView>
            <View style={stylesheet.footer}>
              <>
                <Button
                  disabled={isSubmitButtonDisable}
                  loading={loading}
                  onPress={handleSubmit(onSubmit)}
                  icon={getButtonIcon(ChatText)}>
                  {i18n.buttonTitles.startChat}
                </Button>
              </>
            </View>
            <SafeAreaView />
          </>
        </>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
};
