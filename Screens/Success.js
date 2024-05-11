import { Animated, Appearance, Image, ImageBackground, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'

export default function Success({ navigation, route }) {
  const { messageType } = route.params;
  const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme());

  useEffect(() => {
    const handleChange = (preferences) => {
      setColorScheme(preferences.colorScheme);
    };
    const subscription = Appearance.addChangeListener(handleChange);
    return () => {
      subscription.remove();
    };
  }, []);

  async function loadFonts() {
    await Font.loadAsync({
      'Montserrat-SemiBold': require('../assets/fonts/Montserrat-SemiBold.ttf'),
      'Montserrat-Medium': require('../assets/fonts/Montserrat-Medium.ttf')
    });
  }
  useEffect(() => {
    loadFonts();
  }, []);

  console.log(messageType);

  let imageSource;
  if (messageType === 'Success') {
    imageSource = require('../images/success.png');
  } else if (messageType === 'warning') {
    imageSource = require('../images/warning.png');
  } else if (messageType === 'error') {
    imageSource = require('../images/error.png'); 
  }


  return (
    <SafeAreaView style={styles(colorScheme).container}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 50 }}>
        <ImageBackground
          source={require('../images/output-onlinegiftools.gif')}
          style={{height: 200,width: 200,justifyContent: 'center',alignItems: 'center'}}
          repeat={1}
        >
          <View style={styles(colorScheme).Success}>
            <Image style={{ height: 100, width: 100 }} source={imageSource} />
          </View>
        </ImageBackground>
        <View style={{ gap: 30, paddingHorizontal: 60 }}>
          <View style={{ gap: 5 }}>
            <Text style={{ fontSize: 26, color: colorScheme === 'dark' ? '#FFFFFF' : '#000000', fontFamily: 'Montserrat-SemiBold', textAlign: 'center' }}>Successfully Completed</Text>
          </View>
          <TouchableOpacity style={styles(colorScheme).submitButton} onPress={() => navigation.navigate('Scanner')}>
            <Text style={styles(colorScheme).submitText}> Continue </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = (colorScheme) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: 50,
    backgroundColor: colorScheme === 'dark' ? '#000000' : '#FFFFFF',
  },
  Success: {
    height: 110,
    width: 110,
    backgroundColor: colorScheme === 'dark' ? '#464646' : '#E2E2E2',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center'
  },
  submitButton: {
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 10,
    backgroundColor: '#942FFA',
    alignSelf: 'center',
    alignItems: 'center',
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1
  },
});
