import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ChatList } from '../Chats/chatList';
import { GetAddress } from '../Chats/getAddress';
import { Chat } from '../Chats/chat';

export const ChatScreen = () => {
  const Stack = createNativeStackNavigator<any>();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>
      <Stack.Screen name="ChatList" component={ChatList} />
      <Stack.Screen name="Chat" component={Chat} />
      <Stack.Screen name="GetAddress" component={GetAddress} />
    </Stack.Navigator>
  );
};

