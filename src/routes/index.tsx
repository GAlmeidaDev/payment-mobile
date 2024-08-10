import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PaymentChoice from '../screens/PaymentChoice';
import CardPayment from '../screens/CardPayment';
import PixPayment from '../screens/PixPayment';


type RootStackParamList = {
  PaymentChoice: undefined;
  CardPayment: undefined;
  PixPayment: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="PaymentChoice">
        <Stack.Screen name="PaymentChoice" component={PaymentChoice} />
        <Stack.Screen name="CardPayment" component={CardPayment} />
        <Stack.Screen name="PixPayment" component={PixPayment} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
