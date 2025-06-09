import { Text, View, StyleSheet, TouchableOpacity, ScrollView} from "react-native";

export default function LandingPage() {
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
              <Text style={styles.buttonText}>PRESS ME</Text>
            </TouchableOpacity>
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
    borderColor: "#0DEEE8", 
    borderRadius: 3, 
    alignItems: "center", 
    justifyContent: "center", 
    backgroundColor: "#11d5cf", 
  }, 
  title: { 
    fontSize: 38, 
    fontWeight: "bold", 
    marginBottom: 10, 
    textAlign: 'center', 
    paddingTop: 20, 
  }, 
  button: { 
    backgroundColor: "#098C88", 
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