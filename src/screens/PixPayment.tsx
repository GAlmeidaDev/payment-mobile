import React, { useState } from "react";
import { View, Text, Button, ActivityIndicator, Image, StyleSheet, Alert } from "react-native";

export function PixPayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pixData, setPixData] = useState<any>(null);

  const handlePay = async () => {
    setLoading(true);
    setError(null); // Reset error state
    try {
      const response = await fetch("https://3430-2804-d45-c8ec-6200-2920-e078-dff6-bfce.ngrok-free.app/pix/imediate", {
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
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

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
        </View>
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
});

export default PixPayment;
