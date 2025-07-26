import React, { useState } from 'react';
import { Box, Button, Center, Heading, Text, VStack, HStack, Image, Icon, ScrollView, Divider, Link, Pressable } from 'native-base';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SignInModal from '@/components/SignInModal';

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
    <ScrollView bg="white" showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <Box bg={{
        linearGradient: {
          colors: ['primary.100', 'primary.300'],
          start: [0, 0],
          end: [1, 1]
        }
      }} px={6} py={20}>
        <VStack space={6} alignItems="center" maxW="600" mx="auto">
          <Heading size="3xl" textAlign="center" color="primary.900" fontWeight="extrabold">
            Find Your Perfect{' '}
            <Text color="primary.600" underline>T-Shirt Fit</Text>
          </Heading>
          <Text fontSize="xl" textAlign="center" color="gray.700" maxW="90%">
            AI-powered size measurements and personalized shopping recommendations tailored just for you
          </Text>
          <Button 
            size="lg" 
            colorScheme="primary" 
            _text={{ fontWeight: 'bold' }}
            endIcon={<Icon as={MaterialIcons} name="arrow-forward" size="md" />}
            onPress={handleMeasurePress}
            px={8}
            py={4}
            borderRadius="xl"
            shadow={3}
          >
            Measure My Size Now
          </Button>
          <Box mt={4}>
            <HStack space={2} alignItems="center">
              <Icon as={FontAwesome} name="star" color="amber.400" />
              <Text color="gray.700">4.9/5 from 1,200+ users</Text>
            </HStack>
          </Box>
        </VStack>
      </Box>

      {/* Logo Cloud */}
      <Box py={8} bg="white">
        <Text textAlign="center" color="gray.500" mb={4}>TRUSTED BY</Text>
        <HStack justifyContent="center" space={8} flexWrap="wrap" px={4}>
          {['nike', 'adidas', 'uniqlo', 'hm', 'zara'].map((brand, index) => (
            <Box key={index} p={2}>
              <Text fontSize="xl" fontWeight="bold" color="gray.700">{brand}</Text>
            </Box>
          ))}
        </HStack>
      </Box>

      {/* Value Proposition */}
      <Box px={6} py={12} bg="white">
        <VStack space={12} maxW="600" mx="auto">
          <Heading size="xl" textAlign="center" color="primary.900" fontWeight="bold">
            Why You'll Love Our Service
          </Heading>
          
          <HStack space={8} alignItems="center" flexDirection={{ base: "column", md: "row" }}>
            <Box flex={1}>
              <Image 
                source={{ uri: "https://placehold.co/400x300/primary.100/white?text=Perfect+Fit" }} 
                alt="Perfect fit illustration"
                borderRadius="xl"
                h="200"
                w="full"
              />
            </Box>
            <VStack space={4} flex={1}>
              {[
                {icon: 'check-circle', text: 'Precision measurements using computer vision', color: 'emerald.500'},
                {icon: 'store', text: 'Personalized recommendations from top brands', color: 'blue.500'},
                {icon: 'timer', text: 'Save hours of shopping and return hassle', color: 'amber.500'}
              ].map((item, index) => (
                <HStack key={index} space={4} alignItems="flex-start">
                  <Center bg={item.color} borderRadius="full" p={2}>
                    <Icon as={MaterialIcons} name={item.icon} size="5" color="white" />
                  </Center>
                  <Text fontSize="lg" flex={1}>{item.text}</Text>
                </HStack>
              ))}
            </VStack>
          </HStack>
        </VStack>
      </Box>

      {/* How It Works */}
      <Box bg="gray.50" px={6} py={12}>
        <VStack space={12} maxW="600" mx="auto">
          <Heading size="xl" textAlign="center" color="primary.900">
            How It Works
          </Heading>
          
          <VStack space={8}>
            {[
              {step: 1, title: "Create Your Profile", text: 'Quick sign up in under 30 seconds', icon: 'person-add'},
              {step: 2, title: "Take Measurements", text: 'Use your camera or upload existing photos', icon: 'photo-camera'},
              {step: 3, title: "Get Your Size Profile", text: 'Our AI analyzes your unique body shape', icon: 'insights'},
              {step: 4, title: "Shop With Confidence", text: 'See recommended sizes across brands', icon: 'shopping-cart'}
            ].map((item, index) => (
              <Box 
                key={index} 
                bg="white" 
                p={6} 
                borderRadius="2xl" 
                shadow={1}
                borderLeftWidth={4}
                borderLeftColor="primary.500"
              >
                <HStack space={4} alignItems="center">
                  <Center bg="primary.100" borderRadius="full" w={10} h={10}>
                    <Text color="primary.700" fontWeight="bold" fontSize="lg">{item.step}</Text>
                  </Center>
                  <VStack space={1} flex={1}>
                    <HStack alignItems="center" space={2}>
                      <Icon as={MaterialIcons} name={item.icon} size="5" color="primary.500" />
                      <Heading size="md" color="primary.900">{item.title}</Heading>
                    </HStack>
                    <Text color="gray.600">{item.text}</Text>
                  </VStack>
                </HStack>
              </Box>
            ))}
          </VStack>
        </VStack>
      </Box>

      {/* Testimonials */}
      <Box px={6} py={12} bg="white">
        <VStack space={8} maxW="600" mx="auto">
          <Heading size="xl" textAlign="center" color="primary.900">
            What Our Users Say
          </Heading>
          
          <HStack space={6} flexDirection={{ base: "column", md: "row" }}>
            {[
              {
                quote: "I never knew my proper size until I used this tool. Saved me so much return hassle!",
                author: "Sarah K.",
                rating: 5
              },
              {
                quote: "Finally found t-shirts that actually fit my shoulders properly. Game changer!",
                author: "Michael T.",
                rating: 5
              }
            ].map((item, index) => (
              <Box 
                key={index}
                bg="gray.50" 
                p={6} 
                borderRadius="xl" 
                flex={1}
                shadow={0}
              >
                <HStack space={1} mb={2}>
                  {[...Array(item.rating)].map((_, i) => (
                    <Icon key={i} as={MaterialIcons} name="star" color="amber.400" />
                  ))}
                </HStack>
                <Text fontSize="lg" italic mb={4}>"{item.quote}"</Text>
                <Text fontWeight="medium" color="gray.600">— {item.author}</Text>
              </Box>
            ))}
          </HStack>
        </VStack>
      </Box>

      {/* CTA Section */}
      <Box bg={{
        linearGradient: {
          colors: ['primary.500', 'primary.700'],
          start: [0, 0],
          end: [1, 1]
        }
      }} px={6} py={16}>
        <VStack space={6} alignItems="center" maxW="600" mx="auto">
          <Heading size="2xl" textAlign="center" color="white">
            Ready for Perfect-Fit T-Shirts?
          </Heading>
          <Text fontSize="xl" textAlign="center" color="primary.100" maxW="90%">
            Join thousands of happy customers who never worry about sizing again
          </Text>
          <Button 
            size="lg" 
            colorScheme="white" 
            _text={{ color: 'primary.700', fontWeight: 'bold' }}
            endIcon={<Icon as={MaterialIcons} name="arrow-forward" size="md" />}
            onPress={handleMeasurePress}
            px={8}
            py={4}
            borderRadius="xl"
            shadow={5}
          >
            Get Started Now
          </Button>
        </VStack>
      </Box>

      {/* Footer */}
      <Box bg="gray.900" px={6} py={12}>
        <VStack space={8} maxW="1000" mx="auto">
          <HStack justifyContent="space-between" flexDirection={{ base: "column", md: "row" }} space={8}>
            <VStack space={4} maxW="300">
              <Heading size="lg" color="white">T-Shirt Fit Finder</Heading>
              <Text color="gray.400">
                AI-powered sizing technology to help you find perfectly fitting clothes every time.
              </Text>
              <HStack space={4}>
                {['facebook', 'twitter', 'instagram'].map((social, index) => (
                  <Icon 
                    key={index} 
                    as={FontAwesome} 
                    name={social} 
                    color="gray.400" 
                    size="md" 
                  />
                ))}
              </HStack>
            </VStack>
            
            <HStack space={12} flexWrap="wrap">
              <VStack space={3}>
                <Heading size="sm" color="white" mb={2}>Product</Heading>
                <Link href="#" color="gray.400">How it works</Link>
                <Link href="#" color="gray.400">Features</Link>
                <Link href="#" color="gray.400">Pricing</Link>
              </VStack>
              <VStack space={3}>
                <Heading size="sm" color="white" mb={2}>Company</Heading>
                <Link href="#" color="gray.400">About</Link>
                <Link href="#" color="gray.400">Careers</Link>
                <Link href="#" color="gray.400">Contact</Link>
              </VStack>
              <VStack space={3}>
                <Heading size="sm" color="white" mb={2}>Legal</Heading>
                <Link href="#" color="gray.400">Privacy</Link>
                <Link href="#" color="gray.400">Terms</Link>
                <Link href="#" color="gray.400">Cookie Policy</Link>
              </VStack>
            </HStack>
          </HStack>
          
          <Divider bg="gray.700" />
          
          <HStack justifyContent="space-between" flexDirection={{ base: "column-reverse", md: "row" }} space={4}>
            <Text color="gray.500" fontSize="sm">
              © {new Date().getFullYear()} T-Shirt Fit Finder. All rights reserved.
            </Text>
            <HStack space={6}>
              <Link href="#" color="gray.400" fontSize="sm">Privacy Policy</Link>
              <Link href="#" color="gray.400" fontSize="sm">Terms of Service</Link>
              <Link href="#" color="gray.400" fontSize="sm">Cookies</Link>
            </HStack>
          </HStack>
        </VStack>
      </Box>
    </ScrollView>
  );
}