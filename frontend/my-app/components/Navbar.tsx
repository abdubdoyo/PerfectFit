import React, { useState } from 'react'
import {View, Text, StyleSheet, TouchableOpacity, Platform} from "react-native"; 
import { SafeAreaView } from 'react-native-safe-area-context';
import {router} from "expo-router"; 
import SignInModal from './SignInModal';
import RegisterModal from './RegisterModal';

export default function Navbar() {
    const [isModalOpen, setModalOpen] = useState(false); 
    const [isRegisterOpen, setRegisterModal] = useState(false); 
    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push("/")} style={styles.logo}>
                    <Text style={styles.logoText}>AR</Text>
                </TouchableOpacity>
                <View style={{flex: 1}}></View>
                <View style={styles.rightSection}>
                    <TouchableOpacity onPress={() => router.push("/LandingPage")}>
                        <Text style={styles.navLink}>Demo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push("/Developers")}>
                        <Text style={styles.navLink}>Developers</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.signInButton} onPress={() => setModalOpen(true)}> 
                        <Text style={styles.signIn}>Log In</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.registerButton} onPress={() => setRegisterModal(true)}>
                        <Text style={styles.registerText}>Register</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <SignInModal isOpen={isModalOpen} onClose={() => setModalOpen(false)}></SignInModal>
            <RegisterModal isOpen={isRegisterOpen} onClose={() => setRegisterModal(false)}></RegisterModal>
        </SafeAreaView>
    ); 
}


const styles = StyleSheet.create({
    safe: { 
        backgroundColor: "#1a1a1a", 
    }, 
    header: {
        flexDirection: "row", 
        alignItems: "center", 
        minHeight: 44, 
        backgroundColor: "#1a1a1a", 
        paddingHorizontal: 10, 
        paddingVertical: Platform.OS === "web" ? 0 : 0, 
    }, 
    logo: { 
        borderColor: "#222", 
    }, 
    logoText: { 
        color: "#fff", 
        fontSize: 20, 
        fontWeight: "bold", 
    }, 
    rightSection: { 
        flexDirection: "row", 
        alignItems: "center", 
    },
    navLink: { 
        fontSize: 15, 
        color: "#fff", 
        marginHorizontal: 5, 
    }, 
    signIn: { 
        color: "#222", 
        fontSize: 13, 
        fontWeight: "bold", 
    }, 
    signInButton: { 
        borderColor: "#222", 
        borderRadius: 5, 
        paddingHorizontal: 10, 
        paddingVertical: 6, 
        marginLeft: 5, 
        backgroundColor: "#fff", 
    }, 
    registerButton: { 
        borderColor: "#222", 
        backgroundColor: "#fff",
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 6.4,
        marginLeft: 5,
    }, 
    registerText: { 
        color: "#222", 
        fontSize: 13, 
        fontWeight: "bold", 
    }, 
}); 