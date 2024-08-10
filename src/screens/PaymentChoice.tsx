import React from "react";
import { View, Button } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

// Definição dos tipos de navegação
type RootStackParamList = {
  PaymentChoice: undefined;
  CardPayment: undefined;
  PixPayment: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentChoice'>;

export function PaymentChoice({ navigation }: Props) {
  return (
    <View style={{ padding: 20 }}>
      <View style={{ marginBottom: 20 }}>
        <Button
          title="Pagar com Cartão"
          onPress={() => navigation.navigate('CardPayment')}
        />
      </View>
      <View>
        <Button
          title="Pagar com Pix"
          onPress={() => navigation.navigate('PixPayment')}
        />
      </View>
    </View>
  );
}

export default PaymentChoice;
