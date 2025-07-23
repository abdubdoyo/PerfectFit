import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, Linking, TouchableOpacity} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  Easing,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { TapGestureHandler, RotationGestureHandler } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');
const PROFILE_SIZE = width * 0.5;

const developers = [
  {
    name: "Abdub Doyo",
    image: require('../assets/images/Profile1.jpg'),
    about: "Third-year international student from Kenya studying Computer Science at Toronto Metropolitan University.",
    skills: ['React', 'Node.js', 'Python', 'Java', 'Express.js', 'MongoDB', 'React Native'],
    links: [
      { label: "Email", url: 'mailto:abdubdoyo@gmail.com', icon: '✉️' },
      { label: "GitHub", url: 'https://github.com/abdubdoyo', icon: '💻' },
      { label: "LinkedIn", url: 'https://www.linkedin.com/in/abdub-doyo-75ba83309', icon: '🔗' }
    ]
  },
  {
    name: "Rohan Ramchandani",
    image: require('../assets/images/Profile2.jpeg'),
    about: "Second-year international student from Indonesia studying Computer Science at Toronto Metropolitan University.",
    skills: ['React Native', 'TypeScript', 'Python', 'Java', 'React', 'Node.js', 'Express.js', 'MongoDB'],
    links: [
      { label: "Email", url: 'mailto:rohanvramchandani@gmail.com', icon: '✉️' },
      { label: "GitHub", url: 'https://github.com/RohanRamchandani', icon: '💻' },
      { label: "LinkedIn", url: 'https://www.linkedin.com/in/rohanvramchandani/', icon: '🔗' }
    ]
  }
];

const DeveloperCard = ({ developer }) => {
  const [isHovered, setIsHovered] = useState(false);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);
  const elevation = useSharedValue(3);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotate.value}deg` },
        { scale: scale.value }
      ],
      shadowRadius: elevation.value,
      elevation: elevation.value,
    };
  });

  const onHoverIn = () => {
    scale.value = withSpring(1.05);
    elevation.value = withTiming(8, { duration: 200 });
    setIsHovered(true);
  };

  const onHoverOut = () => {
    scale.value = withSpring(1);
    elevation.value = withTiming(3, { duration: 200 });
    setIsHovered(false);
  };

  const onRotate = (event) => {
    rotate.value = interpolate(
      event.nativeEvent.rotation,
      [-Math.PI, Math.PI],
      [-180, 180],
      Extrapolate.CLAMP
    );
  };

  const onRotateEnd = () => {
    rotate.value = withTiming(0, {
      duration: 500,
      easing: Easing.elastic(1)
    });
  };

  return (
    <View style={styles.cardContainer}>
      <TapGestureHandler
        onHandlerStateChange={({ nativeEvent }) => {
          if (nativeEvent.state === 5) { // ACTIVE state
            rotate.value = withTiming(360, {
              duration: 1000,
              easing: Easing.elastic(2)
            }, () => {
              rotate.value = 0;
            });
          }
        }}
      >
        <RotationGestureHandler
          onGestureEvent={onRotate}
          onEnded={onRotateEnd}
        >
          <Animated.View 
            style={[styles.card, animatedStyles]}
            onMouseEnter={onHoverIn}
            onMouseLeave={onHoverOut}
          >
            <View style={styles.profileHeader}>
              <Animated.Image 
                source={developer.image} 
                style={[
                  styles.profileImage, 
                  { 
                    width: PROFILE_SIZE, 
                    height: PROFILE_SIZE,
                    transform: [{ rotate: isHovered ? '5deg' : '0deg' }]
                  }
                ]} 
              />
              <Text style={styles.name}>{developer.name}</Text>
            </View>
            
            <View style={styles.aboutSection}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.aboutText}>{developer.about}</Text>
            </View>
            
            <View style={styles.skillsSection}>
              <Text style={styles.sectionTitle}>Skills</Text>
              <View style={styles.skillsContainer}>
                {developer.skills.map((skill, index) => (
                  <View key={index} style={styles.skillPill}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
            
            <View style={styles.linksSection}>
              <Text style={styles.sectionTitle}>Connect</Text>
              <View style={styles.linksContainer}>
                {developer.links.map((link, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.linkButton}
                    onPress={() => Linking.openURL(link.url)}
                  >
                    <Text style={styles.linkIcon}>{link.icon}</Text>
                    <Text style={styles.linkText}>{link.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Animated.View>
        </RotationGestureHandler>
      </TapGestureHandler>
    </View>
  );
};

export default function Developers() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>The Developer Collective</Text>
      <Text style={styles.subheader}>Building innovative solutions together</Text>
      
      {developers.map((dev, index) => (
        <DeveloperCard key={index} developer={dev} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    padding: 20,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#2c3e50',
  },
  subheader: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
    color: '#7f8c8d',
  },
  cardContainer: {
    marginBottom: 30,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    borderRadius: PROFILE_SIZE / 2,
    borderWidth: 4,
    borderColor: '#3498db',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  name: {
    fontSize: 26,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 10,
  },
  aboutSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#34495e',
  },
  skillsSection: {
    marginBottom: 20,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  skillPill: {
    backgroundColor: '#e3f2fd',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    color: '#1976d2',
    fontSize: 14,
  },
  linksSection: {
    marginTop: 10,
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  linkButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: '30%',
    justifyContent: 'center',
  },
  linkIcon: {
    marginRight: 8,
    fontSize: 16,
  },
  linkText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});