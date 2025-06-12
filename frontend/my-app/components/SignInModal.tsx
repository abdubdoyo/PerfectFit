import React, { useState, useEffect} from 'react'
import {Center, FormControl, Input, Modal, VStack, Button} from 'native-base'; 
import { Alert, Platform} from 'react-native';
import {router} from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

// You use interface/type for the structure of the functionalities of your modal
interface SignInModalProps { 
    isOpen: boolean; 
    onClose: () => void; 
}

export default function SignInModal({isOpen, onClose}: SignInModalProps) {
    const [email, setEmail] = useState(""); 
    const [password, setPassword] = useState(""); 
    const [confirmPassword, setConfirmPassword] = useState(""); 
    const [isModalOpen, setIsModalOpen] = useState(false); 

    useEffect(() => { 
        setEmail(""); 
        setPassword("")
        setConfirmPassword(""); 
    }, [isOpen])

    const handleSubmit = async () => { 
        if (Platform.OS === "web") { 
            if (!email || !password || !confirmPassword) { 
                window.alert("Error, all fields are required"); 
                return; 
            }
            if (password !== confirmPassword) { 
                window.alert("Password does not match"); 
                return; 
            }
            try{
                const response = await fetch("http://localhost:3000/api/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    }, 
                    body: JSON.stringify({
                        email: email.trim(),
                        password: password.trim(),
                    })
                });
                const data = await response.json();
                if(!response.ok) {
                    window.alert('Login Failed')
                }
                await AsyncStorage.setItem('userToken', data.token);
                window.alert("Login successful");
                onClose(); 
                router.push("/LandingPage"); // Navigate to home page after successful login
            }
            catch (error) {
                window.alert("Error");
            };
        }

        if (Platform.OS === "ios") { 
            if (!email || !password || !confirmPassword) { 
                Alert.alert("Error, all fields are required"); 
                return; 
            }
            if (password !== confirmPassword) { 
                Alert.alert("Password does not match"); 
                return; 
            }
            Alert.alert("Account Created"); 
            onClose(); 
    
            try{
                const response = await fetch("http://localhost:3000/api/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    }, 
                    body: JSON.stringify({
                        email: email,
                        password: password,
                    })
                });
                const data = await response.json();
                if(!response.ok) {
                    throw new Error(data.message || "Login failed");
                }
    
                await AsyncStorage.setItem('userToken', data.token);
                Alert.alert("Login successful");
                
                router.push("/LandingPage"); // Navigate to home page after successful login
            }catch (error) {
                Alert.alert("Error");
            };
        }
    };  

    return (
        <Center>
            <Modal isOpen={isOpen} onClose={onClose}>
                <Modal.Content maxWidth="250px">
                    <Modal.CloseButton />
                    <Modal.Header>Log In</Modal.Header>
                    <Modal.Body>
                        <VStack space={2}>
                            <FormControl>
                                <FormControl.Label>Email</FormControl.Label>
                                <Input placeholder = "you@example.com" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail}></Input>
                            </FormControl>
                            <FormControl>
                                <FormControl.Label>Password</FormControl.Label>
                                <Input placeholder='******' value={password} onChangeText={setPassword} secureTextEntry></Input>
                            </FormControl>
                            <FormControl>
                                <FormControl.Label>Confirm Password</FormControl.Label>
                                <Input placeholder='******' secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword}></Input>
                            </FormControl>
                        </VStack>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button.Group space={2}>
                            <Button variant="ghost" onPress={onClose}>
                                Cancel
                            </Button>
                            <Button onPress={handleSubmit}>Submit</Button>
                        </Button.Group>
                    </Modal.Footer>
                </Modal.Content>
            </Modal>
        </Center>
    ); 
} 