import React, { useEffect, useRef, useState } from 'react';
import { Camera } from 'expo-camera'; 
import { Dimensions, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { View } from 'native-base';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const overlayHeight = width * 4 / 3;

export default function CameraScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const router = useRouter();
  const cameraRef = useRef<Camera>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePhoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      router.push({ pathname: '/PreviewScreen', params: { uri: photo.uri } }); // fixed typo: "PreviewScreem"
    }
  };

  if (hasPermission === null) return <View />;
  if (hasPermission === false) return <Text>No access to camera</Text>;

  return (
    <View style={styles.Container}>
      <Camera
        ref={(ref) => (cameraRef.current = ref)}
        style={styles.Camera}
        type={Camera.Constants.Type.back}
      >
        <View style={styles.OverlayBoxContainer}>
          <View style={styles.OverlayBox}></View>
        </View>
        <TouchableOpacity style={styles.CaptureButton} onPress={takePhoto}>
          <Text style={styles.CaptureText}>Take Photo</Text>
        </TouchableOpacity>
      </Camera>
    </View>
  );
}


const styles = StyleSheet.create({
    Container: { 
        flex: 1, 
        backgroundColor: 'black', 
    }, 
    Camera: { 
        flex: 1, 
        justifyContent: 'flex-end', 
    }, 
    OverlayBoxContainer: { 
        position: 'absolute', 
        top: '15%', 
        left: '10%', 
        width: '80%', 
        height: '50%', 
        borderColor: '#00ff88', 
        borderWidth: 2, 
        backgroundColor: 'rgba(0, 255, 136, 0.05)', 
        zIndex: 1, 
        borderRadius: 8, 
    }, 
    OverlayBox: { 
        flex: 1, 
    },
    CaptureButton: { 
        backgroundColor: '#00ff88', 
        padding: 16, 
        margin: 20, 
        borderRadius: 10, 
        alignSelf: 'center', 
    }, 
    CaptureText: { 
        fontWeight: 'bold', 
        color: 'black', 
        fontSize: 16, 
    }, 
}); 