import {Text, View, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert, Modal} from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from "expo-router";
import * as ImagePicker from 'expo-image-picker'; 
import * as FileSystem from 'expo-file-system';
import { MediaTypeOptions } from 'expo-image-picker';

export default function LandingPage() {
  const [shirtResult, setShirtResult] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false); 


  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if(!token){
        router.replace('/');
      }
    };
    checkAuth();
  }, [])
  
  // Here we are handling with iOS app camera request
  const handleImagePick = async (fromCamera: boolean) => { 
    try { 
      setModalVisible(false); 
      let result; 
  
      if (fromCamera) { 
        const {status} = await ImagePicker.requestCameraPermissionsAsync(); 
        if (status !== 'granted') { 
          alert("Sorry, we need permissions to make this work"); 
          return; 
        }
  
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true, 
          quality: 1, 
          mediaTypes: MediaTypeOptions.Images, 
        }); 
      }
      else { 
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync(); 
        if (status !== "granted") { 
          alert("Media library permission is required to select a photo"); 
          return; 
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: MediaTypeOptions.Images, 
          quality: 1, 
          allowsEditing: true, 
        })
      }
  
      if (!result.canceled && result.assets && result.assets.length > 0) { 
        await handleImageUpload(result.assets[0].uri); 
      }
    }
    catch (error) { 
      console.error("Image picking failed: ", error); 
      alert("An unexpected error occured, please try again later"); 
    }
  }

  const handleImageUpload = async (imageUri: string) => { 
    try { 
      const fileInfo = await FileSystem.getInfoAsync(imageUri); 
      if (!fileInfo.exists) { 
        alert("File does not exist at: " + imageUri); 
        return; 
      }

      const formData = new FormData(); 
      formData.append('photo', {
        uri: imageUri, 
        type: 'image/jpeg', 
        name: 't-shirt.jpg', 
      } as any); 

      const response = await fetch('http://localhost:3000/api/analyze-image', { 
        method: 'POST', 
        headers: { 
          'Content-Type': 'multipart/form-data', 
        }, 
        body: formData,
      })

      if (!response.ok) { 
        const errorData = await response.json(); 
        console.error("Server Error: ", errorData); 
        alert("Upload failed: " + errorData.message); 
        return; 
      }

      const resultData = await response.json(); 
      console.log('Sucess: ', resultData); 
      setShirtResult(resultData.message); 

    }
    catch (error) { 
      console.error("Upload failed: ", error); 
      alert("An error occured while uploading the image. Please try again later"); 
    }
  }



  // This will then be the store names and availability for the clothes like sizes, price and location from the user
  const stores = [
    {title: 'Clothing store 1', body: "Body text bla bla bla", image: "PIC1"},
    {title: 'Clothing store 2', body: "Body text 2 bla bla bla", image: "PIC2"},
    {title: 'Clothing store 3', body: "Body text 3 bla bla bla", image: "PIC3"},
    {title: 'Clothing store 4', body: "Body text 4 bla bla bla", image: "PIC4"},
  ]; 

  return (
    <ScrollView style={{flex: 1, backgroundColor: "#f2f2f2"}}>
        <View style={styles.container}>
          <View style={styles.centerContent}>
            <Text style={styles.title}>Open The Camera and Take a Flick</Text>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText} onPress={() => setModalVisible(true)}>PRESS ME</Text>
            </TouchableOpacity>
            {shirtResult && (
              <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 10, textAlign: 'center' }}>
                {shirtResult}
                </Text>
            )}
          </View>
        </View>

        <Modal transparent visible={modalVisible} animationType="fade" onRequestClose={() => setModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  Choose an Option
                </Text>
                <TouchableOpacity style={styles.modalButton} onPress={() => handleImagePick(true)}>
                  <Text style={styles.modalButtonText}>📷 Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButton} onPress={() => handleImagePick(false)}>
                  <Text style={styles.modalButtonText}>🖼️ Choose from Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, {backgroundColor: '#ccc'}]} onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalButtonText}>❌ Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
        </Modal>


        <View style={styles.storesSection}> 
          <Text style={styles.storesTitle}>Perfect fitting t-shirts can be found below</Text>
          <Text style={styles.storesSubheading}>Based on your picture</Text>
          <View style={styles.storesGrid}>
            {stores.map((store, i) => (
              <View style={styles.storesCard} key={i}>
                <Text style={styles.storesIcon}>ⓘ</Text>
                <View>
                  <Text style={styles.storesTitle}>{store.title}</Text>
                  <Text style={styles.storesBody}>{store.body}</Text>
                  <Text style={styles.storesImage}>{store.image}</Text>
                </View>
              </View>
            ))} 
          </View>
        </View>
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
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 5,
    width: '100%',
  },
  modalButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
})