import {Text, View, StyleSheet, TouchableOpacity, ScrollView, Platform} from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from "expo-router";
import * as ImagePicker from 'expo-image-picker'; 
import {MediaTypeOptions} from 'expo-image-picker'; 
import * as FileSystem from 'expo-file-system';

export default function LandingPage() {
  const [shirtResult, setShirtResult] = useState<string | null>(null);
  // This u
  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if(!token){
        router.replace('/');
      }
    };
    checkAuth();
  }, [])
  

  const handlePressMe = async () => { 
    if (Platform.OS === 'web') { 
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: MediaTypeOptions.Images, 
        allowsEditing: true, 
        quality: 1, 
      }); 

      if (!result.canceled) { 
        alert('Image selected: ' + result.assets[0].uri); 
      }

    }
    else { 
      const {status} = await ImagePicker.requestCameraPermissionsAsync(); 
      if (status !== 'granted') { 
        alert('Sorry, we need camera permissions to make this work'); 
        return; 
      }
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true, 
        quality: 1, 
      })

      if (!result.canceled) { 
        alert('Image captured: ' + result.assets[0].uri); 
        const imageUri = result.assets[0].uri;
        const fileInfo = await FileSystem.getInfoAsync(imageUri);

        const formData = new FormData();
        formData.append('photo', {
          uri: fileInfo.uri,
          type: 'image/jpeg',
          name: 'tshirt.jpg',
        } as any);
      const response = await fetch('http://localhost:3000/api/analyze-image',{
        method: 'POST',
        body: formData,
        
      });

      if(!response.ok){
        const errorData = await response.json();
        console.error('Error:', errorData.message );
        alert("Error: " + errorData.message);
        return;
      }

      const resultData = await response.json();
      console.log(resultData);
      setShirtResult(resultData.message);
      }
      
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
              <Text style={styles.buttonText} onPress={handlePressMe}>PRESS ME</Text>
            </TouchableOpacity>
            {shirtResult && (
              <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 10, textAlign: 'center' }}>
                {shirtResult}
                </Text>
            )}
          </View>
        </View>

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
})