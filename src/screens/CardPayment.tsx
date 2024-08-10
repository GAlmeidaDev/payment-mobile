import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import EfiPay from "payment-token-efi";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type RootStackParamList = {
  CardPayment: undefined;
  Wallet: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'CardPayment'>;

export function CardPayment({ navigation }: Props) {
  const [brand, setBrand] = useState("");
  const [number, setNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [expirationMonth, setExpirationMonth] = useState("");
  const [expirationYear, setExpirationYear] = useState("");
  const [reuse, setReuse] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chargeId, setChargeId] = useState<number | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const identifyBrand = async () => {
    try {
      const identifiedBrand = await EfiPay.CreditCard.setCardNumber(number).verifyCardBrand();
      setBrand(identifiedBrand);
      Alert.alert("Bandeira Identificada", `Bandeira: ${identifiedBrand}`);
    } catch (error: any) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível identificar a bandeira.");
    }
  };

  const generatePaymentToken = async (): Promise<string> => {
    try {
      const accountIdentifier = "f9047b9264d973a564856ab1c20f553e";
      const response = await EfiPay.CreditCard
        .setAccount(accountIdentifier)
        .setEnvironment('sandbox')
        .setCreditCardData({
          brand,
          number,
          cvv,
          expirationMonth,
          expirationYear,
          reuse,
        })
        .getPaymentToken();

      if ('payment_token' in response) {
        return response.payment_token;
      } else {
        throw new Error('Erro ao obter o token de pagamento.');
      }
    } catch (error: any) {
      throw new Error(error.error_description || 'Erro ao obter o token de pagamento.');
    }
  };

  const createCharge = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:3333/efipay/charge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [
            {
              name: "item",
              value: 500,
              amount: 1,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar a cobrança: " + response.statusText);
      }

      const result = await response.json();
      setChargeId(result.data.charge_id);
      Alert.alert("Cobrança Criada", `ID da Cobrança: ${result.data.charge_id}`);

      const id = setInterval(() => checkChargeStatus(), 5000);
      setIntervalId(id);

    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const payCharge = async (paymentToken: string) => {
    setLoading(true);
    setError(null);
    try {
      if (!chargeId) {
        throw new Error('ID da cobrança não encontrado.');
      }
      
      const response = await fetch(`http://localhost:3333/efipay/charge/${chargeId}/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payment: {
            credit_card: {
              customer: {
                name: "Gorbadoc Oldbuck",
                cpf: "94271564656",
                email: "email_do_cliente@servidor.com.br",
                birth: "1990-08-29",
                phone_number: "5144916523",
              },
              installments: 1,
              payment_token: paymentToken,
              billing_address: {
                street: "Avenida Juscelino Kubitschek",
                number: "909",
                neighborhood: "Bauxita",
                zipcode: "35400000",
                city: "Ouro Preto",
                complement: "",
                state: "MG",
              },
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao pagar a cobrança: " + response.statusText);
      }

      Alert.alert("Pagamento Realizado", "O pagamento foi realizado com sucesso.");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const checkChargeStatus = async () => {
    if (!chargeId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3333/efipay/charge/${chargeId}`);
      
      if (!response.ok) {
        throw new Error("Erro ao verificar o status: " + response.statusText);
      }

      const data = await response.json();
      setPaymentStatus(data.data.status);

      if (data.data.status === "paid") {
        Alert.alert("Pagamento Confirmado", `Status: ${data.data.status}`);
        clearInterval(intervalId!);
        setIntervalId(null);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      const paymentToken = await generatePaymentToken();
      await createCharge();
      if (chargeId) {
        await payCharge(paymentToken);
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [intervalId]);

  return (
    <View style={{ padding: 20 }}>
      <Text>Número do Cartão:</Text>
      <TextInput
        style={styles.input}
        value={number}
        onChangeText={setNumber}
        placeholder="Número do cartão"
        keyboardType="numeric"
      />
      <Button title="Identificar Bandeira" onPress={identifyBrand} />

      {brand ? (
        <Text style={{ marginTop: 10 }}>Bandeira Identificada: {brand}</Text>
      ) : null}

      <Text>CVV:</Text>
      <TextInput
        style={styles.input}
        value={cvv}
        onChangeText={setCvv}
        placeholder="CVV"
        keyboardType="numeric"
        secureTextEntry
      />

      <Text>Mês de Expiração:</Text>
      <TextInput
        style={styles.input}
        value={expirationMonth}
        onChangeText={setExpirationMonth}
        placeholder="MM"
        keyboardType="numeric"
      />

      <Text>Ano de Expiração:</Text>
      <TextInput
        style={styles.input}
        value={expirationYear}
        onChangeText={setExpirationYear}
        placeholder="AAAA"
        keyboardType="numeric"
      />

      <Button title="Processar Pagamento" onPress={handlePayment} />

      {loading && <Text>Processando...</Text>}
      {error && <Text style={{ color: 'red' }}>Erro: {error}</Text>}
      {paymentStatus && (
        <Text style={{ marginTop: 10 }}>Status da Cobrança: {paymentStatus}</Text>
      )}
    </View>
  );
}

const styles = {
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
  },
};

export default CardPayment;
