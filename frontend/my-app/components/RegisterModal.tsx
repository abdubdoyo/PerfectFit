import { Center, FormControl, Modal, VStack, Input, Button} from 'native-base'
import React, { useEffect, useState } from 'react'
import { Alert, Platform} from 'react-native';
import { router } from 'expo-router';


interface RegisterModalProps { 
    isOpen: boolean; 
    onClose: () => void; 
}

export default function RegisterModal({isOpen, onClose}: RegisterModalProps) { 
    const [email, setEmail] = useState(""); 
    const [confirmEmail, setConfirmEmail] = useState(""); 
    const [password, setPassword] = useState(""); 
    const [confirmPassword, setConfirmPassword] = useState(""); 
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => { 
        setEmail(""); 
        setConfirmEmail(""); 
        setPassword(""); 
        setConfirmPassword(""); 
    }, [isOpen])

    const handleSubmit = async () => { 
        if (Platform.OS === "web") { 
            if (!email || !confirmEmail || !password || !confirmPassword) { 
                window.alert("Fill all the fields"); 
                return; 
            }
            if (email !== confirmEmail) { 
                window.alert("Email does not match"); 
                return; 
            }
            if (password !== confirmPassword) { 
                window.alert("Password does not match"); 
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
                 
                window.alert("Success");         
                onClose();                                                                                    
            }
            catch (error) {
                window.alert("Error");
                console.error("Registration error: ", error);
            }
            finally{
                setIsLoading(false);
            }
        }

        if (Platform.OS === "ios") { 
            if (!email || !confirmEmail || !password || !confirmPassword) { 
                Alert.alert("Fill all the fields"); 
                return; 
            }
            if (email !== confirmEmail) { 
                Alert.alert("Email does not match"); 
                return; 
            }
            if (password !== confirmPassword) { 
                Alert.alert("Password does not match"); 
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
  
                Alert.alert("Success");         
                onClose();   
                router.replace('/LandingPage');                                                                                  
            }
            catch (error) {
                Alert.alert("Error");
                console.error("Registration error:", error);
            }
            finally{
                setIsLoading(false);
            }
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
                                placeholder="you@example.com"
                                keyboardType="email-address"
                                autoCapitalize='none' 
                                value={email} 
                                onChangeText={setEmail}></Input>
                            </FormControl>
                            <FormControl>
                                <FormControl.Label>Confrim Email</FormControl.Label>
                                <Input placeholder="you@example.com" 
                                keyboardType="email-address" 
                                autoCapitalize="none" 
                                value={confirmEmail} 
                                onChangeText={setConfirmEmail}></Input>
                            </FormControl>
                            <FormControl>
                                <FormControl.Label>Password</FormControl.Label>
                                <Input placeholder="******" secureTextEntry value={password} onChangeText={setPassword}></Input>
                            </FormControl>
                            <FormControl>
                                <FormControl.Label>Confirm Password</FormControl.Label>
                                <Input placeholder="******" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword}></Input>
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
