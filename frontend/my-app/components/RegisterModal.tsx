import { Center, FormControl, Modal, VStack, Input, Button} from 'native-base'
import React, { useState } from 'react'
import { Alert } from 'react-native';

interface RegisterModalProps { 
    isOpen: boolean; 
    onClose: () => void; 
}

export default function RegisterModal({isOpen, onClose}: RegisterModalProps) { 
    const [email, setEmail] = useState(" "); 
    const [confirmEmail, setConfirmEmail] = useState(" "); 
    const [password, setPassword] = useState(" "); 
    const [confirmPassword, setConfirmPassword] = useState(" "); 

    const handleSubmit = () => { 
        if (!email || !confirmEmail || !password || !confirmPassword) { 
            Alert.alert("Fill all fields"); 
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
        Alert.alert("Success"); 
        onClose(); 
    }

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
                                <Input placeholder="" keyboardType="email-address" autoCapitalize='none' value={email} onChangeText={setEmail}></Input>
                            </FormControl>
                            <FormControl>
                                <FormControl.Label>Confrim Email</FormControl.Label>
                                <Input placeholder="" keyboardType="email-address" autoCapitalize="none" value={confirmEmail} onChangeText={setConfirmEmail}></Input>
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
                            <Button onPress={handleSubmit}>
                                Submit
                            </Button>
                        </Button.Group>
                    </Modal.Footer>
                </Modal.Content>
            </Modal>
        </Center>
    )
}
