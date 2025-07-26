import React, { useEffect, useState } from "react";
import {
  View,
  Linking,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Pressable,
  Modal,
  Platform,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

// ────────────────────────────────────────────────────────────────
// 1. DESIGN TOKENS  ──────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────
export const colors = {
  primary: "#11d5cf",
  primaryDark: "#0fbdbc",
  greyBg: "#f2f2f2",
  text: "#222",
  card: "#fff",
};

export const radii = {
  card: 16,
  button: 8,
};

export const shadow = {
  elevation: 3, // Android
  shadowColor: "#000", // iOS
  shadowOpacity: 0.1,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 3 },
};

// ────────────────────────────────────────────────────────────────
// 2. REUSABLE BUTTONS  ───────────────────────────────────────────
// ────────────────────────────────────────────────────────────────
interface BtnProps {
  label: string;
  disabled?: boolean;
  onPress: () => void;
  style?: object;
}

function PrimaryButton({ label, disabled, onPress, style }: BtnProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.btnBase,
        {
          backgroundColor: disabled ? "#aaa" : colors.primaryDark,
          opacity: pressed ? 0.8 : 1,
        },
        style,
      ]}
      disabled={disabled}
      onPress={onPress}
    >
      <Text style={styles.btnLabel}>{label}</Text>
    </Pressable>
  );
}

function SecondaryButton({ label, onPress, style }: BtnProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.btnSecondary,
        pressed && { opacity: 0.8 },
        style,
      ]}
      onPress={onPress}
    >
      <Text style={[styles.btnLabel, { color: colors.primaryDark }]}>
        {label}
      </Text>
    </Pressable>
  );
}

// ────────────────────────────────────────────────────────────────
// 3. HERO CARD  ─────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────
function HeroCard({ onTakePhoto, onUploadPhoto, disabled }: {
  onTakePhoto: () => void;
  onUploadPhoto: () => void;
  disabled: boolean;
}) {
  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[hero.card, shadow]}
    >
      <Ionicons name="camera-outline" size={64} color="#fff" />

      <Text style={hero.headline}>Open the camera and take a flick</Text>

      <PrimaryButton label="Take photo" disabled={disabled} onPress={onTakePhoto} style={{ marginTop: 8 }} />
      <SecondaryButton label="Upload photo" onPress={onUploadPhoto} style={{ marginTop: 8 }} />
    </LinearGradient>
  );
}

// ────────────────────────────────────────────────────────────────
// 4. UTILS  ─────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────
async function getCoords() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") throw new Error("Location permission denied");
  const { coords } = await Location.getCurrentPositionAsync({});
  return { lat: coords.latitude, lng: coords.longitude };
}

// ────────────────────────────────────────────────────────────────
// 5. MAIN COMPONENT  ────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  // photo + size flow
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [shirtResult, setShirtResult] = useState<string | null>(null);
  const [storeResults, setStoreResults] = useState<any[]>([]);

  // modal visibility
  const [pickModal, setPickModal] = useState(false);
  const [sizeModal, setSizeModal] = useState(false);
  const [resultModal, setResultModal] = useState(false);

  // loading states
  const [loadingSize, setLoadingSize] = useState(false);
  const [loadingStores, setLoadingStores] = useState(false);

  // location ready flag
  const [locationReady, setLocationReady] = useState(false);

  // show stores flag
  const [showStores, setShowStores] = useState(false);

  // Abort finding stores 
  const [cancelToken, setCancelToken] = useState<AbortController | null>(null); 

  // Abort size finder 
  const [sizeCancelToken, setSizeCancelToken] = useState<AbortController | null>(null); 

  // auth check
  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) router.replace("/");
    })();
  }, []);

  // location permission pre‑check
  useEffect(() => {
    (async () => {
      try {
        const serviceEnabled = await Location.hasServicesEnabledAsync();
        if (!serviceEnabled) {
          Alert.alert(
            "Turn On Location Services",
            "Please enable GPS or Location Services in your phone settings so we can show nearby stores."
          );
          return;
        }
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") setLocationReady(true);
      } catch (e) {
        console.warn("Location check error", e);
      }
    })();
  }, []);

  // handle pick photo — camera or gallery
  const handleImagePick = async (fromCamera: boolean) => {
    try {
      setPickModal(false);

      // permissions on native
      if (Platform.OS !== "web") {
        if (fromCamera) {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== "granted") {
            Alert.alert("Camera access denied");
            return;
          }
        } else {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== "granted") {
            Alert.alert("Media library access denied");
            return;
          }
        }
      }

      const result = await (fromCamera
        ? ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [3, 4],
            quality: 1,
            base64: Platform.OS === "web",
          })
        : ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [3, 4],
            quality: 1,
            base64: Platform.OS === "web",
          }));

      if (!result.canceled && result.assets?.[0]?.uri) {
        setSelectedImage(result.assets[0].uri);
        setSizeModal(true);
      }
    } catch (e) {
      console.error("Image pick error", e);
      Alert.alert("Something went wrong while selecting the image");
    }
  };

  // confirm size → call backend
  const handleSizeConfirm = async () => {
    if (!selectedImage || !selectedSize) return;
    try {
      setLoadingSize(true);
      const controller = new AbortController(); 
      setSizeCancelToken(controller); 

      const formData = new FormData();
      if (Platform.OS === "web") {
        const resp = await fetch(selectedImage);
        const blob = await resp.blob();
        formData.append("photo", blob, "photo.jpg");
      } else {
        const fileName = selectedImage.split("/").pop() || "photo.jpg";
        const extMatch = /\.(\w+)$/.exec(fileName);
        const type = extMatch ? `image/${extMatch[1]}` : "image/jpeg";
        formData.append("photo", {
          uri: selectedImage,
          name: fileName,
          type,
        } as any);
      }
      formData.append("userSize", selectedSize);

      const res = await fetch("http://localhost:3000/api/estimate-shirt-size", {
        method: "POST",
        body: formData,
        signal: controller.signal, 
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to estimate size. Try retaking the photo.");

      setShirtResult(data.message);
      setSizeModal(false);
      setResultModal(true);
    } catch (e: any) {
      if (e.name !== 'AbortError') { 
        Alert.alert(e.message || 'Upload Failed'); 
      }
    } finally {
      setLoadingSize(false);
      setSizeCancelToken(null); 
    }
  };

  const handleCancelSizeEstimation = () => { 
    if (sizeCancelToken) { 
      sizeCancelToken.abort(); 
    }
    setLoadingSize(false); 
    setSelectedSize(null); 
    setSizeModal(false); 
  }

  // fetch nearby stores
  const handleFindStores = async () => {
    if (!shirtResult || !selectedImage) return;
    
    try {
      setLoadingStores(true);
      const controller = new AbortController(); 
      setCancelToken(controller); 
  
      // 1. Get coordinates
      const { lat, lng } = await getCoords();
  
      // 2. Prepare form data with image
      const formData = new FormData(); 
      if (Platform.OS === 'web') { 
        const resp = await fetch(selectedImage); 
        const blob = await resp.blob(); 
        formData.append("image", blob, "outfit.jpg"); 
      } else { 
        const fileName = selectedImage.split("/").pop() || "outfit.jpg"; 
        const type = fileName.endsWith(".png") ? "image/png" : "image/jpeg"; 
        formData.append("image", { 
          uri: selectedImage, 
          name: fileName, 
          type, 
        } as any); 
      }
  
      // 3. IMPROVED SIZE EXTRACTION
      let sizeLetter = '';
      
      // Option 1: If shirtResult is an object with size property
      if (typeof shirtResult === 'object' && shirtResult.size) {
        sizeLetter = shirtResult.size;
      } 
      // Option 2: If it's a string with JSON
      else if (typeof shirtResult === 'string' && shirtResult.includes('{')) {
        try {
          const parsed = JSON.parse(shirtResult);
          sizeLetter = parsed.size || parsed.finalSize || '';
        } catch (e) {
          console.warn('Could not parse shirtResult as JSON');
        }
      }
      // Option 3: Fallback to regex
      if (!sizeLetter) {
        const sizeMatch = shirtResult.toString().match(/(?:size|finalSize)[: ]*(\w+)/i);
        sizeLetter = sizeMatch?.[1] || '';
      }
  
      if (!sizeLetter) {
        throw new Error('Could not determine clothing size');
      }
  
      // 4. Add all data to form
      formData.append("size", sizeLetter); 
      formData.append("lat", lat.toString());
      formData.append("lng", lng.toString());
  
      // 5. Make the API call
      const res = await fetch("http://localhost:3000/api/recommendations", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
  
      // 6. Handle response
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Store fetch failed");
      
      const enhancedStores = data.recommendations.map((store: any) => ({
        ...store.store, 
        displayDistance: store.store.distanceMeters > 1000 
          ? `${(store.store.distanceMeters * 0.001).toFixed(1)} km` 
          : `${store.store.distanceMeters} m`, 
        matchQuality: store.matchConfidence > 0.8 ? 'High' : 
                    store.matchConfidence > 0.5 ? 'Medium' : 'Low'
      })); 
  
      setStoreResults(enhancedStores);
      setShowStores(true);
      setResultModal(false);
    } catch (e: any) { 
      if (e.name !== 'AbortError') { 
        Alert.alert('Error', e.message); 
      }
    } finally { 
      setLoadingStores(false); 
      setCancelToken(null); 
    }
  };
  

  const handleCancelFindStores = () => { 
    if (cancelToken) { 
      cancelToken.abort(); 
    }
    setLoadingStores(false); 
    setResultModal(false); 
  }; 

  // ──────────────────────────────────────────────────────────────
  // 6. RENDER  ──────────────────────────────────────────────────
  // ──────────────────────────────────────────────────────────────
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.greyBg }}
      contentContainerStyle={{ alignItems: "center", paddingVertical: 32 }}
    >
      {/* HERO */}
      <HeroCard
        disabled={!locationReady}
        onTakePhoto={() => setPickModal(true)}
        onUploadPhoto={() => handleImagePick(false)}
      />

      {/* STORES SECTION */}
      {showStores && (
        <View style={storesSection.container}>
          <Text style={storesSection.title}>Recommended Stores</Text>
          {shirtResult && (
            <Text style={storesSection.subtitle}>{shirtResult}</Text>
          )}
          <ScrollView style={storesSection.storesList}>
            {storeResults.map((store, i) => (
              <StoreCard key={i} store={store} />
            ))}
          </ScrollView>
          <SecondaryButton 
            label="Start Over" 
            onPress={() => {
              setShowStores(false);
              setStoreResults([]);
              setSelectedImage(null);
              setSelectedSize(null);
              setShirtResult(null);
            }} 
            style={{ marginTop: 16 }}
          />
        </View>
      )}

      {/* PICK OPTION MODAL */}
      <Modal transparent visible={pickModal} animationType="fade">
        <View style={modal.overlay}>
          <View style={modal.pickCard}>
            <Text style={modal.title}>Choose an option</Text>
            <PrimaryButton
              label="📷 Take photo"
              onPress={() => handleImagePick(true)}
            />
            <SecondaryButton
              label="🖼️ Choose from gallery"
              onPress={() => handleImagePick(false)}
              style={{ marginTop: 12 }}
            />
            <Pressable onPress={() => setPickModal(false)} style={{ marginTop: 20 }}>
              <Text style={{ textAlign: "center", color: colors.text }}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* SIZE CONFIRMATION MODAL */}
      <Modal transparent visible={sizeModal} animationType="slide">
        <View style={modal.overlay}>
          <View style={modal.sizeCard}>
            <Text style={modal.title}>Confirm your size</Text>
            <SizeChooser
              imageUri={selectedImage}
              selected={selectedSize}
              onSelect={setSelectedSize}
            />

            {loadingSize ? (
              <View style={{ flexDirection: "row", marginTop: 16 }}>
                <SecondaryButton 
                  label="Cancel" 
                  onPress={handleCancelSizeEstimation} 
                  style={{ flex: 1, marginRight: 8 }} 
                />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              </View>
            ) : (
              <View style={{ flexDirection: "row", marginTop: 16 }}>
              <SecondaryButton 
                label="Back" 
                onPress={() => setSizeModal(false)} 
                style={{ flex: 1, marginRight: 8 }} 
              />
              <PrimaryButton
                label="Confirm"
                disabled={!selectedSize}
                onPress={handleSizeConfirm}
                style={{ flex: 1 }}
              />
            </View>
            )}
          </View>
        </View>
      </Modal>

      {/* RESULT MODAL */}
      <Modal transparent visible={resultModal} animationType="slide">
        <View style={modal.overlay}>
          <View style={modal.resultCard}>
            <Text style={modal.title}>Your size results</Text>
            {shirtResult && <Text style={modal.resultText}>{shirtResult}</Text>}
            {loadingStores ? (
              <View style={{ alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.primary} />
                <PrimaryButton
                  label="Cancel"
                  onPress={handleCancelFindStores}
                  style={{ marginTop: 16 }}
                />
              </View>
            ) : (
              <>
                <PrimaryButton
                  label="Find nearby stores"
                  onPress={handleFindStores}
                  style={{ marginBottom: 16 }}
                />
                <SecondaryButton 
                  label="Close" 
                  onPress={() => setResultModal(false)} 
                />
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// ────────────────────────────────────────────────────────────────
// 7. Size Chooser Component  ────────────────────────────────────
// ────────────────────────────────────────────────────────────────
function SizeChooser({
  imageUri,
  selected,
  onSelect,
}: {
  imageUri: string | null;
  selected: string | null;
  onSelect: (s: string) => void;
}) {
  const { width } = Dimensions.get("window");
  const isSmall = width < 600;

  return (
    <View style={[size.container, { flexDirection: isSmall ? "column" : "row" }]}>
      <View style={[size.imageWrap, isSmall && { marginBottom: 16 }]}>
        {imageUri && (
          <Image
            source={{ uri: imageUri }}
            style={size.image}
            resizeMode="contain"
          />
        )}
      </View>
      <View style={size.pickerWrap}>
        <Text style={size.subtitle}>Select your size</Text>
        {['XS', 'S', 'M', 'L', 'XL'].map((sz) => (
          <Pressable
            key={sz}
            style={[size.pickBtn, selected === sz && size.pickBtnActive]}
            onPress={() => onSelect(sz)}
          >
            <Text style={[size.pickText, selected === sz && { color: "#fff" }]}>{sz}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ────────────────────────────────────────────────────────────────
// 8. Store Card Component  ──────────────────────────────────────
// ────────────────────────────────────────────────────────────────
function StoreCard({ store }: { store: any }) {
  return (
    <View style={storeStyles.card}>
      <Text style={storeStyles.name}>{store.name}</Text>
      <Text style={storeStyles.addr}>{store.address}</Text>

      <View style={storeStyles.detailsRow}>
        <View style={[storeStyles.badge, store.matchQuality === 'High' && {backgroundColor: '#4CAF50'}, store.matchQuality === 'Medium' && {backgroundColor: '#FFC107'}, store.matchQuality === 'Low' && {backgroundColor: '#F44336'}]}>
          <Text style={storeStyles.badgeText}>{store.matchQuality} match</Text>
        </View>

        <View style={storeStyles.badge}>
          <Text style={storeStyles.badgeText}>{store.displayDistance}</Text>
        </View>
      </View>

      {store.matchReason && (
        <Text style={storeStyles.matchReason}>{store.displayDistance}</Text>
      )}

      {store.url && (
        <Text style={storeStyles.url} onPress={() => Linking.openURL(store.url)}>
          View Online
        </Text>
      )}

    </View>
  );
}

// ────────────────────────────────────────────────────────────────
// 9. STYLES  ────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  btnBase: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: radii.button,
    alignItems: "center",
  },
  btnSecondary: {
    width: "100%",
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: colors.primaryDark,
    borderRadius: radii.button,
    alignItems: "center",
  },
  btnLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});

const hero = StyleSheet.create({
  card: {
    width: "90%",
    maxWidth: 480,
    borderRadius: radii.card,
    padding: 24,
    alignItems: "center",
  },
  headline: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginVertical: 16,
  },
});

const modal = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
    marginBottom: 20,
  },
  pickCard: {
    width: "80%",
    maxWidth: 350,
    backgroundColor: colors.card,
    borderRadius: radii.card,
    padding: 24,
    ...shadow,
  },
  sizeCard: {
    width: Dimensions.get("window").width < 600 ? "90%" : "35%",
    maxWidth: 600,
    backgroundColor: colors.card,
    borderRadius: radii.card,
    padding: 24,
    ...shadow,
  },
  resultCard: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: colors.card,
    borderRadius: radii.card,
    padding: 24,
    maxHeight: "85%",
    ...shadow,
  },
  resultText: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginVertical: 16,
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    color: colors.text,
  },
});

const size = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: 8,
  },
  imageWrap: {
    flex: 0.7,
    paddingRight: 12,
  },
  image: {
    width: "100%",
    aspectRatio: 3 / 4,
    borderRadius: radii.card,
    borderWidth: 5,
    borderColor: "#f0f0f0",
  },
  pickerWrap: {
    flex: 0.3,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    color: colors.text,
  },
  pickBtn: {
    paddingVertical: 10,
    marginBottom: 8,
    borderRadius: radii.button,
    backgroundColor: "#ddd",
    alignItems: "center",
  },
  pickBtnActive: {
    backgroundColor: colors.primaryDark,
  },
  pickText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
});

const storeStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    padding: 12,
    marginBottom: 12,
    ...shadow,
  },
  name: { fontWeight: "700", fontSize: 16, color: colors.text },
  addr: { color: "#555", marginTop: 2 },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.button,
  },
  badgeText: { color: "#fff", fontSize: 12 },
  url:{
    color: colors.primaryDark,
    fontSize: 12,
    marginTop: 2,
    textDecorationLine: 'underline',
  },
  detailsRow: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 8, 
  }, 
  matchReason: { 
    fontSize: 12, 
    color: '#666', 
    marginTop: 8, 
    fontStyle: 'italic', 
  }, 
});

const storesSection = StyleSheet.create({
  container: {
    width: "90%",
    maxWidth: 480,
    backgroundColor: colors.card,
    borderRadius: radii.card,
    padding: 24,
    marginTop: 24,
    ...shadow,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
    marginBottom: 20,
  },
  storesList: {
    maxHeight: 400,
  },
}) 