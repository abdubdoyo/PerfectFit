import { Center, FormControl, Modal, VStack, Input, Button} from 'native-base'
import React, { useState } from 'react'
import { Alert } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RegisterModalProps { 
    isOpen: boolean; 
    onClose: () => void; 
}

export default function RegisterModal({isOpen, onClose}: RegisterModalProps) { 
    const [email, setEmail] = useState(" "); 
    const [confirmEmail, setConfirmEmail] = useState(" "); 
    const [password, setPassword] = useState(" "); 
    const [confirmPassword, setConfirmPassword] = useState(" "); 
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => { 
        if (!email || !confirmEmail || !password || !confirmPassword) { 
            Alert.alert("Error", "Fill all fields"); 
            return; 
        }
        if (email !== confirmEmail) { 
            Alert.alert("Error", "Email does not match"); 
            return; 
        }
        if (password !== confirmPassword) { 
            Alert.alert("Error", "Password does not match"); 
            return; 
        }
        setIsLoading(true);

        try{
            const response = await fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.trim(),
                    password: password.trim(),
                }),
            });  
            const data = await response.json();

            if(!response.ok){
                throw new Error(data.message || 'Registration failed');
            }   
            
            await AsyncStorage.setItem('userToken', data.token);  
            Alert.alert("Success", data.message);         
            onClose();   
            router.replace('/LandingPage');                                                                                  
        }catch (error) {
            Alert.alert("Error");
            console.error("Registration error:", error);
        }finally{
            setIsLoading(false);
        }
    };

    return ( 
        <Center>
            <Modal isOpen={isOpen} onClose={onClose}>
                <Modal.Content maxWidth="250px">
                    <Modal.CloseButton />
                    <Modal.Header>
                        Register
                    </Modal.Header>
                    <Modal.Body>
                        <VStack space={4}>
                            <FormControl>
                                <FormControl.Label>Email</FormControl.Label>
                                <Input 
                                placeholder=""
                                keyboardType="email-address"
                                autoCapitalize='none' 
                                value={email} 
                                onChangeText={setEmail}></Input>
                            </FormControl>
                            <FormControl>
                                <FormControl.Label>Confrim Email</FormControl.Label>
                                <Input placeholder="" 
                                keyboardType="email-address" 
                                autoCapitalize="none" 
                                value={confirmEmail} 
                                onChangeText={setConfirmEmail}></Input>
                            </FormControl>
                            <FormControl>
                                <FormControl.Label>Password</FormControl.Label>
                                <Input placeholder="" secureTextEntry value={password} onChangeText={setPassword}></Input>
                            </FormControl>
                            <FormControl>
                                <FormControl.Label>Confirm Password</FormControl.Label>
                                <Input placeholder="" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword}></Input>
                            </FormControl>
                        </VStack>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button.Group space={2}>
                            <Button variant="ghost" onPress={onClose}>
                                Cancel
                            </Button>
                            <Button onPress={handleSubmit} isLoading={isLoading}>
                                Submit
                            </Button>
                        </Button.Group>
                    </Modal.Footer>
                </Modal.Content>
            </Modal>
        </Center>
    )
}
