import React, { useState, useEffect } from "react";
import { View, Text, Button, ActivityIndicator, Image, StyleSheet, Alert } from "react-native";

export function PixPayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pixData, setPixData] = useState<any>(null);
  const [txid, setTxid] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const handlePay = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:3333/pix/imediate", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          calendario: {
            expiracao: 3600,
          },
          devedor: {
            cpf: "12345678909",
            nome: "Francisco da Silva",
          },
          valor: {
            original: "124.45",
          },
          chave: "12616406675",
          solicitacaoPagador: "Informe o número ou identificador do pedido.",
        }),
      });

      if (!response.ok) {
        throw new Error("Erro na solicitação: " + response.statusText);
      }

      const data = await response.json();
      setPixData(data);
      setTxid(data.txid); 

      const id = setInterval(() => checkPaymentStatus(), 5000);
      setIntervalId(id);

    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!txid) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3333/pix/${txid}`);
      
      if (!response.ok) {
        throw new Error("Erro na solicitação: " + response.statusText);
      }

      const data = await response.json();
      setPaymentStatus(data.status);
      
      if (data.status === "CONCLUIDA") {
        Alert.alert("Pagamento Concluído", `Status: ${data.status}`);
        clearInterval(intervalId!);
        setIntervalId(null);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [intervalId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkout - Pagamento com Pix</Text>
      <View style={styles.checkoutInfo}>
        <Text style={styles.label}>Valor:</Text>
        <Text style={styles.value}>R$ 124,45</Text>
        <Text style={styles.label}>CPF:</Text>
        <Text style={styles.value}>123.456.789-09</Text>
        <Text style={styles.label}>Nome:</Text>
        <Text style={styles.value}>Francisco da Silva</Text>
      </View>
      <Button title="Pagar" onPress={handlePay} />
      {loading && <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />}
      {error && <Text style={styles.error}>Erro: {error}</Text>}
      {pixData && (
        <View style={styles.qrCodeContainer}>
          <Text style={styles.qrCodeLabel}>QR Code:</Text>
          <Image
            source={{ uri: `https://${pixData.location}` }}
            style={styles.qrCode}
          />
          <Button title="Verificar Status do Pagamento" onPress={checkPaymentStatus} />
        </View>
      )}
      {paymentStatus && (
        <Text style={styles.status}>Status do Pagamento: {paymentStatus}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  checkoutInfo: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 16,
    marginBottom: 10,
  },
  loading: {
    marginTop: 20,
  },
  error: {
    color: 'red',
    marginTop: 20,
  },
  qrCodeContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  qrCodeLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  qrCode: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  status: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PixPayment;
