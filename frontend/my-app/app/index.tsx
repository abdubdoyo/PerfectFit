import React, { useState } from 'react';
import { Box, Button, Center, Heading, Text, VStack, HStack, Image, Icon, ScrollView, Divider, Link, Pressable } from 'native-base';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SignInModal from '@/components/SignInModal';
// import { useNavigation } from '@react-navigation/native';

// const navigation = useNavigation();

export default function Index() {
  const [showLogin, setShowLogin] = useState(false); 

  const handleMeasurePress = async () => { 
    const token = await AsyncStorage.getItem('userToken')
    if (token) { 
      router.push('/LandingPage'); 
    }
    else { 
      setShowLogin(true); 
      <SignInModal isOpen={showLogin} onClose={() => setShowLogin(false)}></SignInModal>
    }
  }
  return (
    <ScrollView bg="white">
      {/* Hero Section */}
      <Box bg="primary.100" px={6} py={12}>
        <VStack space={4} alignItems="center">
          <Heading size="2xl" textAlign="center" color="primary.800">
            Find Your Perfect T-Shirt Fit
          </Heading>
          <Text fontSize="lg" textAlign="center">
            Get accurate size measurements and personalized shopping recommendations
          </Text>
          <Button 
            size="lg" 
            colorScheme="primary" 
            endIcon={<Icon as={MaterialIcons} name="arrow-forward" />}
            onPress={handleMeasurePress}
          >
            Measure My Size Now
          </Button>
          <Pressable>
            <Text underline color="primary.600">How It Works</Text>
          </Pressable>
        </VStack>
      </Box>

      {/* Value Proposition */}
      <Box px={6} py={8}>
        <Heading size="lg" mb={6} textAlign="center">Why Use Our Service?</Heading>
        <VStack space={6}>
          {[
            {icon: 'check-circle', text: 'No more guessing - precise measurements'},
            {icon: 'store', text: 'Personalized store recommendations'},
            {icon: 'timer', text: 'Save time and avoid returns'}
          ].map((item, index) => (
            <HStack key={index} space={3} alignItems="center">
              <Icon as={MaterialIcons} name={item.icon} size={6} color="primary.500" />
              <Text fontSize="md">{item.text}</Text>
            </HStack>
          ))}
        </VStack>
      </Box>

      {/* How It Works */}
      <Box bg="gray.50" px={6} py={8}>
        <Heading size="lg" mb={6} textAlign="center">How It Works</Heading>
        <VStack space={4}>
          {[
            {step: 1, text: 'Log in/Sign up (30 sec)'},
            {step: 2, text: 'Take measurements (with webcam or upload image)'},
            {step: 3, text: 'Get your size profile'},
            {step: 4, text: 'See recommended brands/stores'}
          ].map((item, index) => (
            <HStack key={index} space={3} alignItems="center">
              <Center bg="primary.500" borderRadius="full" w={6} h={6}>
                <Text color="white" fontWeight="bold">{item.step}</Text>
              </Center>
              <Text fontSize="md">{item.text}</Text>
            </HStack>
          ))}
        </VStack>
      </Box>

      

      {/* Social Proof */}
      <Box bg="primary.100" px={6} py={8}>
        <VStack space={4} alignItems="center">
          <Heading size="lg" textAlign="center">Trusted by Thousands</Heading>
          <Text fontSize="xl" fontWeight="bold" color="primary.700">1,200+ perfect fits found</Text>
          <Text italic textAlign="center" mt={4}>
            "I never knew my proper size until I used this tool. Saved me so much return hassle!" - Sarah K.
          </Text>
        </VStack>
      </Box>

      {/* Footer */}
      <Box bg="gray.800" px={6} py={8}>
        <VStack space={4}>
          <Text color="white" fontWeight="bold">T-Shirt Fit Finder</Text>
          <HStack space={4} mt={2}>
            <Link href="#" color="white">FAQ</Link>
            <Link href="#" color="white">Contact</Link>
            <Link href="#" color="white">Privacy</Link>
          </HStack>
          <Text color="gray.400" mt={4} fontSize="xs">
            © {new Date().getFullYear()} All rights reserved
          </Text>
        </VStack>
      </Box>
    </ScrollView>
  );
}