import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function PreviewScreen() {
  const { uri } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  if (!uri) return <Text>No image found</Text>;

  const handleCancel = () => {
    router.back(); // Go back to CameraScreen
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);

      const formData = new FormData();

      if (Platform.OS === 'web') {
        const response = await fetch(uri as string);
        const blob = await response.blob();
        formData.append('photo', blob, 'photo.jpg');
      } else {
        const fileName = (uri as string).split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(fileName);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('photo', {
          uri: uri as string,
          name: fileName,
          type,
        } as any);
      }

      const response = await fetch('http://localhost:3000/api/estimate-shirt-size', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json(); 

      if (!data.ok) { 
        setResult(`❌ ${data.error || 'Failed to estimate size. Please try again.'}`) 
        return;
      }

      setResult(`✅ Estimated Size: ${data.size} (${data.shoulderWidthCm} cm)`);
    } catch (error) {
      console.error('Upload error:', error);
      setResult('❌ Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: uri as string }} style={styles.image} resizeMode="contain" />

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginVertical: 20 }} />
      ) : (
        <>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={handleConfirm}>
              <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
          </View>

          {result && (
            <Text style={styles.resultText}>{result}</Text>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '90%',
    height: '60%',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 20,
    marginVertical: 10,
  },
  button: {
    padding: 14,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  resultText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
});