// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  View,
  TouchableOpacity
} from 'react-native';
import Text from 'components/Text';
import { ScreenContainer } from 'components/ScreenContainer';
import { Header } from 'components/Header';
import { SubHeader } from 'components/SubHeader';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'routes/index';

import { UserPlus, ChatCircleDots } from 'phosphor-react-native';
import createStylesheet from './styles';
import axios from 'axios'
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { toShort } from 'utils/index';
import { useIsFocused } from "@react-navigation/native";

import { CHAT_API_URL } from 'constants/index';
import { decrypt } from 'utils/encryptAndDecrypt'

const axiosInstance = axios.create({ baseURL: CHAT_API_URL });


export const ChatList = () => {
  const { currentAccount } = useSelector((state: RootState) => state.accountState);
  const isFocused = useIsFocused();
  const theme = useSubWalletTheme().swThemes;
  const stylesheet = createStylesheet(theme);

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [loading, setLoading] = useState(false);

  const [List, setChatsList] = useState<any>([])

  useEffect(() => {
    if (isFocused) {
      getInitialData();
    }
  }, [isFocused])


  const getInitialData = async () => {

    axiosInstance.get(`/chats/${currentAccount?.address}`).then((response) => {
      setChatsList(response.data.data)
    }).catch((err) => {
      console.log("error", err.response);
    });

  }

  const onSubheaderPressBack = useCallback(() => {

    navigation.goBack();

  }, [navigation]);

  const onPlusIconPress = useCallback(() => {

    navigation.navigate('GetAddress')

  }, [navigation]);

  const onPressChat = (id: string) => {

    navigation.navigate('Chat', {
      sender: currentAccount?.address || "",
      receiver: id
    })
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScreenContainer>
        <>
          {/* <Header disabled={loading} /> */}

          <View style={stylesheet.subheader}>
            <SubHeader
              title={"Chat List"}
              onPressBack={onSubheaderPressBack}
              disabled={loading}
              titleTextAlign={'center'}
              rightIcon={UserPlus}
              onPressRightIcon={onPlusIconPress}
            />

          </View>

          <>
            <ScrollView
              style={stylesheet.scrollView}
              contentContainerStyle={stylesheet.scrollViewContentContainer}
              keyboardShouldPersistTaps={'handled'}>
              {List.length !== 0 ? List.map((user: any, i: number) => {
                return (<>
                  <TouchableOpacity
                    key={i}
                    onPress={() => {
                      onPressChat(user.receiver)
                    }}>
                    <View
                      style={{
                        height: 70,
                        borderRadius: 10,
                        display: "flex",
                        flexDirection: "row",
                        padding: 10,
                        width: "100 %",
                      }}>
                      <View
                        style={{
                          borderRadius: 10,
                        }}
                      >
                        <ChatCircleDots size={35} color='white' />
                      </View>
                      <View>
                        <Text
                          numberOfLines={1}
                          style={{
                            marginRight: 20,
                            fontWeight: '900',
                            color: 'white',
                            paddingLeft: 20,
                            borderRadius: 5,
                          }}
                        >{toShort(user.receiver)}</Text>
                        <Text
                          style={{
                            paddingLeft: 20,
                            borderRadius: 5,
                          }}
                        >{decrypt(user.chats[user.chats.length - 1].chat)}</Text>
                      </View>
                    </View>
                    <View style={{ flex: 1, height: 1, backgroundColor: 'white' }} />
                  </TouchableOpacity>
                </>
                )
              }
              )
                :
                <View
                  style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
                >
                  <Text style={{ textAlignVertical: "center", textAlign: "center", }}>
                    No chats
                  </Text>
                </View>
              }
            </ScrollView>
            <SafeAreaView />
          </>
        </>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
};
