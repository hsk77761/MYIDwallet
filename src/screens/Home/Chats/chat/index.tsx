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
} from 'react-native';
import Text from 'components/Text';
import { ScreenContainer } from 'components/ScreenContainer';
import { Header } from 'components/Header';
import { SubHeader } from 'components/SubHeader';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'routes/index';
import { Button } from 'components/design-system-ui';
import { PaperPlaneRight, } from 'phosphor-react-native';
import { getButtonIcon } from 'utils/button';
import createStylesheet from './styles';
import Input from 'components/design-system-ui/input';
import axios from 'axios'
import { toShort } from 'utils/index';
import * as io from "socket.io-client";

import {
  CHAT_API_URL
} from 'constants/index';
const socket = io.connect(CHAT_API_URL);
const axiosInstance = axios.create({ baseURL: CHAT_API_URL });


export const Chat = (
  {
    route
  }: any
) => {
  const { sender, receiver } = route.params;
  const theme = useSubWalletTheme().swThemes;
  const stylesheet = createStylesheet(theme);

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [loading, setLoading] = useState(false);

  const [chats, setChats] = useState<any>([])
  const [text, setText] = useState('');

  let users = {
    user: sender,
    sender: sender,
    receiver: receiver
  }
  useEffect(() => {
    axiosInstance.get(`/chats/${users.sender}/${users.receiver}`).then((response) => {
      setChats(response.data.data.chats)
    }).catch((err) => {
      console.log("error", err);
    });

  }, [])

  useEffect(() => {
    socket.on(users.sender, (res: any) => {
      setChats((chat: []) => [...chat, res.chats[0]]);
    });

  }, [])

  const onSubheaderPressBack = useCallback(() => {

    navigation.goBack();

  }, [navigation]);
  // Submit Chat
  const onSubmit = useCallback(
    () => {
      const data = {
        user: users.user,
        sender: users.sender,
        receiver: users.receiver,
        chats: [
          {
            "sender": users.sender,
            "receiver": users.receiver,
            chat: text
          }
        ]
      }
      socket.emit("new_msg", data);
      setText('')
    },
    [text],
  );
  const scrollViewRef = useRef<ScrollView>(null);
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScreenContainer>
        <>
          {/* <Header disabled={loading} /> */}

          <View style={stylesheet.subheader}>
            <SubHeader
              title={toShort(users.user)}
              onPressBack={onSubheaderPressBack}
              disabled={loading}
              titleTextAlign={'left'}
            />
          </View>

          <>
            <ScrollView
              style={stylesheet.scrollView}
              ref={scrollViewRef}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
              contentContainerStyle={stylesheet.scrollViewContentContainer}
              keyboardShouldPersistTaps={'handled'}>
              {chats && chats.map((chat: any, i: number) => {
                if (chat.sender === users.sender) {
                  return (
                    <View
                      key={i}
                      style={{
                        flex: 1,
                        justifyContent: 'flex-end',
                        marginBottom: 16,
                        paddingTop: 10,
                        alignItems: 'flex-end',
                      }}>
                      <Text
                        style={{
                          color: 'white',
                          backgroundColor: "rgb(105, 41, 202)",
                          borderRadius: 5,
                          padding: 12
                        }}

                      >{chat.chat}</Text>
                    </View>
                  )
                } else {
                  return (
                    <View
                      key={i}
                      style={{
                        flex: 1,
                        justifyContent: 'flex-start',
                        marginBottom: 16,
                        paddingTop: 10,
                        alignItems: 'flex-start',
                      }}>

                      <Text style={{
                        backgroundColor: "#FAFAFF05",
                        borderRadius: 5,
                        padding: 12
                      }} >{chat.chat}</Text>
                    </View>
                  )
                }
              })}
            </ScrollView>
            <View style={stylesheet.footer}>
              <View style={{ flex: 0.8 }}>
                <Input
                  onChangeText={newText => setText(newText)}
                  defaultValue={text}
                  containerStyle={{
                    height: 50,
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0
                  }}
                  placeholder={'Chat here'}
                >

                </Input>
              </View>
              <View style={{ flex: 0.2 }}>
                <Button
                  size='lg'
                  style={{
                    height: 50,
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0
                  }}
                  onPress={onSubmit}
                  icon={getButtonIcon(PaperPlaneRight)}>
                </Button>
              </View>
            </View>
            <SafeAreaView />
          </>
        </>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
};
