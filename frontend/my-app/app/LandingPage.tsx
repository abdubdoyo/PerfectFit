import {Text, View, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert, Modal, Image} from "react-native";
import {useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from "expo-router";
import * as ImagePicker from 'expo-image-picker'; 

export default function LandingPage() {
  const [shirtResult, setShirtResult] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false); 
  const [selectionModalVisible, setSelectionModalVisible] = useState(false); 
  const [selectedImage, setSelectedImage] = useState<string | null>(null); 
  const [selectedSize, setSelectedSize] = useState<string | null>(null); 
  const [finalResult, setFinalResult] = useState(false); 

  useEffect(() => { 
    // Only when selectionModalVisible is false 
    if (!selectionModalVisible && !finalResult) { 
      setSelectedImage(null); 
      setSelectedSize(null); 
    }
  }, [selectionModalVisible, finalResult])

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if(!token){
        router.replace('/');
      }
    };
    checkAuth();
  }, [])

  // handleImagePick allows us to handle image selection in React Native application 
  const handleImagePick = async (fromCamera: boolean) => {
    try {
      setModalVisible(false);
      if (Platform.OS === 'web') { 
        if (fromCamera) { 
          alert('📷 On web, "Take Photo" will open a file picker. Please upload a clear, chest-level, centered image.'); 
        }
        else { 
          alert('🖼️ Make sure your uploaded image is well-lit, centered, and shows the full upper body.'); 
        }
      }

      if (Platform.OS !== 'web') { 
        if (fromCamera) { 
          const {status} = await ImagePicker.requestCameraPermissionsAsync(); 
          if (status !== 'granted') { 
            Alert.alert('Permission required'); 
            return; 
          }
        }
        else { 
          const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync(); 
          if (status !== 'granted') { 
            Alert.alert('Permission required'); 
            return; 
          }
        }
      }

      const result = await (fromCamera
        ? ImagePicker.launchCameraAsync({
          allowsEditing: true, 
          aspect: [3, 4], 
          quality: 1, 
          base64: Platform.OS === 'web', 
        })
        : ImagePicker.launchImageLibraryAsync({
          allowsEditing: true, 
          aspect: [3,4], 
          quality: 1, 
          base64: Platform.OS === 'web', 
        })
      )

      if (!result.canceled && result.assets?.[0]?.uri) { 
        setSelectedImage(result.assets[0].uri); 
        setSelectionModalVisible(true); 
      }
    }
    catch (error) { 
      console.error('Image picker error:', error); 
      alert('Something went wrong while selecting the image'); 
    }
  };


  const handleSizeConfirm = async () => {
    if (!selectedImage || !selectedSize) { 
      alert('Please select both an image and size'); 
      return; 
    }

    try {
      const formData = new FormData(); 

      if (Platform.OS === 'web') { 
        const response = await fetch(selectedImage); 
        const blob = await response.blob(); 
        formData.append('photo', blob, 'photo.jpg'); 
      } else { 
        const fileName = selectedImage.split('/').pop() || 'photo.jpg'; 
        const match = /\.(\w+)$/.exec(fileName);
        const type = match ? `image/${match[1]}` : 'image/jpeg'; 

        formData.append('photo', { 
          uri: selectedImage, 
          name: fileName, 
          type, 
        } as any); 
      }
      formData.append('userSize', selectedSize); 

      const response = await fetch('http://localhost:3000/api/estimate-shirt-size', { 
        method: 'POST', 
        body: formData, 
      }); 

      const data = await response.json(); 
      if (!response.ok) { 
        window.alert(data.error || 'Something went wrong'); 
        return; 
      } 

      setShirtResult(data.message); 
      setSelectionModalVisible(false); 
      setFinalResult(true); 
    }
    catch (error) { 
      console.error('Upload error', error); 
      alert('Upload failed. Please try again.'); 
    }
  };


  return (
    <ScrollView style={{flex: 1, backgroundColor: "#f2f2f2"}}>
        <View style={styles.container}>
          <View style={styles.centerContent}>
            <Text style={styles.title}>Open The Camera and Take a Flick</Text>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText} onPress={() => setModalVisible(true)}>PRESS ME</Text>
            </TouchableOpacity>
          </View>
        </View>

        {finalResult && selectedImage && (
          <View style={{padding: 20}}>
            <Text style={{fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 10}}>Attire Predictor Result</Text>
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              {/* Left column first */}
              <View style={{flex: 1, paddingRight: 10}}>
                <Text style={{fontWeight: '600', marginBottom: 5}}>Attire Predictor Suggests:</Text>
                <Text>Size: {shirtResult}</Text>
                <Text>Location: </Text>
                <Text>Stock Availability: </Text>
                <Text>Colors Available: </Text>
                <Text>Price: </Text>

                
              </View>

              {/* Right column */}
              <View style={{flex: 1, paddingLeft: 10}}>
                <Text style={{fontWeight: '600', marginBottom: 5}}>User's Photo</Text>
                <Text>User's Size: {selectedSize}</Text>

                <Image source={{uri: selectedImage}} style={{width: '50%', aspectRatio: 3/4, marginTop: 50, borderRadius: 10}}></Image>
              </View>
            </View>
          </View>
        )}

        <Modal 
          transparent 
          visible={modalVisible} 
          animationType="fade" 
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
          <View style={styles.selectionModalContent}>
            <Text style={styles.modalTitle}>
              Choose an Option
            </Text>
      
          <TouchableOpacity 
            style={styles.imageOptionButton} 
            onPress={() => {if (Platform.OS === 'web') {handleImagePick(true)} else {router.push('/CameraScreen')}}}
           >
          <Text style={styles.imageOptionText}>📷 Take Photo</Text>
          </TouchableOpacity>
      
          <TouchableOpacity 
            style={styles.imageOptionButton} 
            onPress={() => {
            if (Platform.OS === 'web') {
              alert("📸 Make sure the photo is centered and your upper body is clearly visible.");
              setTimeout(() => handleImagePick(false), 100); 
            } else { 
              handleImagePick(false); 
            }
            }}
            >
              <Text style={styles.imageOptionText}>🖼️ Choose from Gallery</Text>
          </TouchableOpacity>
      
          <TouchableOpacity 
          style={[styles.imageOptionButton, styles.cancelButton]} 
          onPress={() => setModalVisible(false)}
          >
          <Text style={styles.imageOptionText}>Cancel</Text>
          </TouchableOpacity>
          </View>
          </View>
      </Modal>

      <Modal 
        transparent 
        visible={selectionModalVisible} 
        animationType="slide" 
        onRequestClose={() => setSelectionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
        <View style={styles.confirmationModalContent}>
        <Text style={styles.modalTitle}>Confirm Your Size</Text>
      
        <View style={styles.imageSizeContainer}>
          {/* Left side - Big image */}
          <View style={styles.imagePreviewContainer}>
            {selectedImage && (
              <Image 
                source={{uri: selectedImage}} 
                style={styles.largePreviewImage}
                resizeMode="contain"
              />
            )}
          </View>
        
          {/* Right side - Size selection */}
          <View style={styles.sizeSelectionContainer}>
            <Text style={styles.sizeTitle}>Select your size:</Text>
            {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                styles.sizeButton,
                selectedSize === size && styles.sizeButtonSelected
              ]}
              onPress={() => setSelectedSize(size)}
            >
              <Text style={styles.sizeButtonText}>{size}</Text>
            </TouchableOpacity>
          ))}
          </View>
          </View>

        {/* Action buttons */}
        <View style={styles.modalActions}>
          <TouchableOpacity 
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={() => setSelectionModalVisible(false)}
          >
            <Text style={styles.actionButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity 
          style={[styles.actionButton, styles.primaryButton]}
          onPress={handleSizeConfirm}
          disabled={!selectedSize}
        >
          <Text style={styles.actionButtonText}>Confirm</Text>
        </TouchableOpacity>
        </View>
        </View>
        </View>
      </Modal>

    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#11d5cf", 
  }, 
  centerContent: { 
    borderWidth: 2, 
    borderColor: "#7EC8E3", 
    borderRadius: 3, 
    alignItems: "center", 
    justifyContent: "center", 
    backgroundColor: "#7EC8E3", 
  }, 
  title: { 
    fontSize: 38, 
    fontWeight: "bold", 
    marginBottom: 10, 
    textAlign: 'center', 
    paddingTop: 20, 
  }, 
  button: { 
    backgroundColor: "#60A3D9", 
    borderRadius: 5, 
    paddingVertical: 10, 
    paddingHorizontal: 10, 
    marginBottom: 20, 
  }, 
  buttonText: { 
    fontSize: 30, 
    fontWeight: '500',
    color: "#222", 
  }, 
  storesSection: { 
    marginTop: 24, 
    marginHorizontal: 20, 
  }, 
  storesTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginBottom: 4, 
  }, 
  storesSubheading: { 
    fontSize: 15, 
    color: "#555", 
    marginBottom: 22, 
  }, 
  storesGrid: { 
    flexDirection: "row", 
    justifyContent: 'space-between', 
    flexWrap: 'wrap', 
  }, 
  storesCard: { 
    width: "45%", 
    marginBottom: 24, 
    flexDirection: "row", 
    alignItems: 'flex-start', 
    gap: 5, 
  }, 
  storesIcon: { 
    fontSize: 15, 
  }, 
  storesBody: { 
    fontSize: 13, 
    color: "#555", 
  }, 
  storesImage: { 
    textAlign: 'center', 
    justifyContent: 'center',
    marginTop: 44, 
  }, 
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#222',
  },
  
  // Image Selection Modal specific
  selectionModalContent: {
    width: '80%',
    maxWidth: 350,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
  },
  imageOptionButton: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#11f8f1',
    marginBottom: 12,
  },
  imageOptionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
    marginTop: 10,
  },
  
  // Size Confirmation Modal specific
  confirmationModalContent: {
    width: '35%',
    maxWidth: 600,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
  },
  imageSizeContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  imagePreviewContainer: {
    flex: 0.7,
    paddingRight: 15,
  },
  largePreviewImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 3/4,
    borderRadius: 15,
    borderWidth: 5,
    borderColor: '#f0f0f0',
  },
  sizeSelectionContainer: {
    flex: 0.3,
  },
  sizeTitle: {
    marginBottom: 15,
    fontWeight: 'bold',
    fontSize: 16,
  },
  sizeButton: {
    paddingVertical: 10,
    marginBottom: 7,
    borderRadius: 7,
    backgroundColor: 'grey',
    alignItems: 'center',
  },
  sizeButtonSelected: {
    backgroundColor: 'blue',
  },
  sizeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  sizeButtonSelectedText: {
    color: 'white',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#000',
  },
  secondaryButton: {
    backgroundColor: '#ccc',
    marginRight: 10,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
})