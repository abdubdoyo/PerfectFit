import { Stack, Slot} from "expo-router";
import { View } from "react-native";
import Navbar from "../components/Navbar";
import { NativeBaseProvider } from "native-base";

export default function layout() {
  return (
    <NativeBaseProvider>
      <View style={{ flex: 1 }}>
        <Navbar/>
        <View style={{ flex: 1 }}>
          <Slot screenOptions={{headerShown: false}}></Slot>
        </View>
      </View>
    </NativeBaseProvider>
  ); 
}