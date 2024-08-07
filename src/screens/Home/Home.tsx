import { useNavigation } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, View, TouchableOpacity } from "react-native";

type RootStackParamList = {
  Home: undefined;
  Wallet: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function Home({navigation}: Props) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Home</Text>
      <TouchableOpacity onPress={() => navigation.navigate('Wallet')}>
        <Text>Go to Wallet</Text>
      </TouchableOpacity>
    </View>
  );
}
