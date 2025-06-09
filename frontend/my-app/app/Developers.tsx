import React from 'react'
import { View, Text, ScrollView, StyleSheet, Image, Dimensions, Linking} from 'react-native'

const {width} = Dimensions.get('window'); 
const IMAGE_SIZE = width * 0.7; 

export default function Developers() { 
    const Abdu_Profile = [{label: "Email:", url: 'abdubdoyo@gmail.com'}, 
        {label: "GitHub:", url: 'https://github.com/abdubdoyo'}, 
        {label: "LinkedIn:", url: 'https://www.linkedin.com/in/abdub-doyo-75ba83309'}, 
    ]

    const Rohan_Profile = [
        { label: 'Email:',    url: 'mailto:rohanvramchandani@gmail.com' },
        { label: 'GitHub:',   url: 'https://github.com/RohanRamchandani' },
        { label: 'LinkedIn:', url: 'https://www.linkedin.com/in/rohanvramchandani/' },
      ];
    
    return (
        <ScrollView style={styles.Container}>
            <View>
                <Text style={styles.Container_Header}>Abdub Doyo</Text>
                <Image source={require('../assets/images/Profile1.jpg')} style={[styles.Container_ImageProfile1, {width: IMAGE_SIZE, height: IMAGE_SIZE}]} ></Image>
                <Text style={styles.Container_AboutMe}>About Me</Text>
                <Text style={styles.Container_AboutMeText}>I am a third-year Computer Science student at TMU (formerly Ryerson), into all things web dev and always levelling up my coding skills-Python, Java, JavaScript, you name it! Also, I am all about good vibes and good company.</Text>
                {Abdu_Profile.map(({ label, url }) => (
                    <View key={url} style={styles.Container_ListItem}>
                        <Text style={styles.Container_BulletPoint}>{'\u2022'}</Text>
                        <Text
                            style={styles.Container_LinkText}
                            onPress={() => Linking.openURL(url)}
                        >
                        <Text style={styles.Container_LinkLabel}>{label} </Text>
                        {url.replace(/^mailto:/, '')}
                        </Text>
                    </View>
                ))} 
            </View>

            <View>
                <Text style={styles.Container_Header2}>Rohan Ramchandani</Text>
                <Image source={require('../assets/images/Profile2.jpg')} style={[styles.Container_ImageProfile2, {width: IMAGE_SIZE, height: IMAGE_SIZE}]}></Image>
                <Text style={styles.Container_AboutMe2}>About Me</Text>
                <Text style={styles.Container_AboutMeText2}>
                    I am a second-year Computer Science student at TMU (formerly Ryerson),
                    into all things web dev and always levelling up my coding skills—
                    Python, Java, JavaScript, you name it! Also, I am all about good vibes
                    and good company. 
                </Text>

                {Rohan_Profile.map(({ label, url }) => (
                    <View key={url} style={styles.Container_ListItem2}>
                    <Text style={styles.Container_BulletPoint2}>{'\u2022'}</Text>
                    <Text style={styles.Container_LinkText2} onPress={() => Linking.openURL(url)}>
                        <Text style={styles.Container_LinkLabel2}>{label}</Text>
                        {url.replace(/^mailto:/, '')}
                    </Text>
            </View>
        ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    Container: {
        flexGrow: 1,
        backgroundColor: '#11d5cf',
        paddingVertical: 20,
      },
      Container_Header: {
        textAlign: 'center',
        fontSize: 34,
        fontWeight: 'bold',
      },
      Container_ImageProfile1: {
        marginTop: 10,
        borderRadius: IMAGE_SIZE / 2,
        alignSelf: 'center',
      },
      Container_AboutMe: {
        textAlign: 'center',
        marginTop: 12,
        fontSize: 20,
        fontWeight: 'bold',
      },
      Container_AboutMeText: {
        fontSize: 13,
        textAlign: 'center',
        marginTop: 6,
        paddingHorizontal: 16,
      },
      Container_ListItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        width: '80%',
        alignSelf: 'center',
        marginTop: 12,
      },
      Container_BulletPoint: {
        fontSize: 18,
        lineHeight: 22,
        marginRight: 8,
      },
      Container_LinkText: {
        flex: 1,
        fontSize: 16,
        lineHeight: 22,
        color: '#007AFF',
        textDecorationLine: 'underline',
        flexWrap: 'wrap',
      },
      Container_LinkLabel: {
        fontWeight: '600',
        color: '#000',
      },
      Container_Header2: {
        textAlign: 'center',
        fontSize: 34,
        fontWeight: 'bold',
      },
      Container_ImageProfile2: {
        marginTop: 10,
        borderRadius: IMAGE_SIZE / 2,
        alignSelf: 'center',
      },
      Container_AboutMe2: {
        textAlign: 'center',
        marginTop: 12,
        fontSize: 20,
        fontWeight: 'bold',
      },
      Container_AboutMeText2: {
        fontSize: 13,
        textAlign: 'center',
        marginTop: 6,
        paddingHorizontal: 16,
      },
      Container_ListItem2: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        width: '80%',
        alignSelf: 'center',
        marginTop: 12,
      },
      Container_BulletPoint2: {
        fontSize: 18,
        lineHeight: 22,
        marginRight: 8,
      },
      Container_LinkText2: {
        flex: 1,
        fontSize: 16,
        lineHeight: 22,
        color: '#007AFF',
        textDecorationLine: 'underline',
        flexWrap: 'wrap',
      },
      Container_LinkLabel2: {
        fontWeight: '600',
        color: '#000',
      },
})