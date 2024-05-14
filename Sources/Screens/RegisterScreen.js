import {  Appearance,  Image, ImageBackground, Keyboard, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from 'expo-font';

const RegisterScreen = ({ navigation }) => { 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme());
  const [isError, setError] = useState(false);
  const inputRef = useRef(null);

  async function loadFonts() {
    await Font.loadAsync({
      'Montserrat-SemiBold': require('../../assets/fonts/Montserrat-SemiBold.ttf'),
      'Montserrat-Medium': require('../../assets/fonts/Montserrat-Medium.ttf')
    });
  }
  loadFonts();

  useEffect(() => {
    const handleChange = (preferences) => {
      setColorScheme(preferences.colorScheme);
    };
    const subscription = Appearance.addChangeListener(handleChange);
    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    );
    return () => {
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleLogin = async () => {
    try {
      const response = await fetch(`${global.DomainName}/api/Scanner`,{ 
        method: 'POST',
        headers: { 
          "Accept": 'application/json',
          'Content-Type': 'application/json',
         },
        body: JSON.stringify({
          Code: email,
          Password: password,
        })
      }
      );
      const userData = await response.json();
      if (userData.Code === email && userData.Password === password) {
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        navigation.navigate('MainStack');
      } else {
        setError(true)
        console.error('Invalid username or password');
      }
      setEmail('');
      setPassword('');
      setError('');
      return userData;
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles(colorScheme).container}>
        <ImageBackground style={styles(colorScheme).imageContainer} source={require('../../images/backgroundImage.jpg')} >
          <KeyboardAvoidingView
            style={styles(colorScheme).keyboardAvoidingContainer}
            behavior={Platform.OS === "ios" ? "height" : null}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -500} 
          >
            <View style={styles(colorScheme).loginContent}>
              <View style={styles(colorScheme).logo}>
                <Text style={styles(colorScheme).text}> Login Account </Text>
              </View>

              <ScrollView keyboardShouldPersistTaps="handled" style={styles(colorScheme).inputContents}>
                <ScrollView keyboardShouldPersistTaps="always">
                  {/* input containers */}
                  <View style={styles(colorScheme).inputContents}>
                    
                    <View style={[styles(colorScheme).inputContainer, { borderColor: isEmailFocused ? '#cc9cfc' : colorScheme === 'dark' ? '#333' : '#fff' }]}>
                      <Image source={require('../../images/user.png')} style={styles(colorScheme).inputIcon}/>
                      <TextInput
                        style={styles(colorScheme).userInput}
                        placeholder="Enter Username or Mobile"
                        placeholderTextColor={'#b3b3b3'}
                        onFocus={() => setIsEmailFocused(true)}
                        onBlur={() => setIsEmailFocused(false)}
                        autoCapitalize="none"
                        value={email}
                        onChangeText={value => { setEmail(value) }}
                        blurOnSubmit={false}
                        onSubmitEditing={() => {
                          this.textInput.focus();
                        }}
                        returnKeyType="next"
                      />
                    </View>

                    <View style={[styles(colorScheme).inputContainer, { borderColor: isPasswordFocused ? '#cc9cfc' : colorScheme === 'dark' ? '#333' : '#fff' }]}>
                      <Image source={require('../../images/unlock.png')} style={styles(colorScheme).inputIcon}/>
                      <View style={styles(colorScheme).passwordContent}>
                        <TextInput
                          ref={(inputRef)}
                          style={styles(colorScheme).userInput}
                          value={password}
                          placeholder="Enter Password"
                          placeholderTextColor={'#b3b3b3'}
                          onFocus={() => setIsPasswordFocused(true)}
                          onBlur={() => setIsPasswordFocused(false)}
                          secureTextEntry={true}
                          onChangeText={value => { setPassword(value) }}
                          getRef={(e) => {
                            this.textInput.focus = e;
                          }}
                          returnKeyType="done"             
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                          <Image
                            style={styles(colorScheme).inputIcon}
                            source={showPassword ? require('../../images/eye-off.png') : require('../../images/eye.png')}
                          />
                        </TouchableOpacity>
                      </View> 

                    </View>

                    <View style={{flex: .5}}>
                      {isError === true ? <Text style={styles(colorScheme).errorText}>Invalid username or password</Text> : null}
                    </View>

                  </View>
                </ScrollView>
              </ScrollView>

              <View style={styles(colorScheme).submitData}>
                <TouchableOpacity style={styles(colorScheme).submitButton} onPress={handleLogin}>
                  <Text style={styles(colorScheme).submitText}> Login </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
          </ImageBackground>
    </SafeAreaView>
  );
};

const styles = (colorScheme) => StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: colorScheme === 'dark' ? '#000000' : '#FFFFFF', 
  },
  keyboardAvoidingContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  imageContainer: {
    flex: 1, 
    width: '100%', 
    justifyContent: 'flex-end'
  }, 
  loginContent: {
    flex: .8,
    justifyContent: 'flex-end',
    backgroundColor: colorScheme === 'dark' ? '#333333' : '#FFFFFF', 
    borderTopRightRadius: 50,
    borderTopLeftRadius: 50,
    elevation: 10,
  },
  logo: {
    flex: 2,
    width: wp('100%'),
    justifyContent: 'flex-end',
    paddingBottom: 20,
    alignItems: 'center',
  },
  text: {
    fontSize: 32,
    fontFamily: 'Montserrat-SemiBold',
    color: colorScheme === 'dark' ? '#FFF' : '#000',
    textAlign: 'center',
  },

  inputContents: {
    flexGrow: .5,
    padding: 10,
    gap: 15,
  },
  inputContainer: {
    flex: 1,
    height: hp('6%'),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colorScheme === 'dark' ? '#444' : '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 15,
    elevation: 5,
    marginBottom: 10,
  },
  passwordContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputIcon: {
    height: hp('3%'),
    width: hp('3%')
  },
  userInput: {
    flex: 1,
    fontSize: 18,
    paddingHorizontal: 10,
    color: colorScheme === 'dark' ? '#FFF' : '#5A5A5A',
    fontFamily: 'Montserrat-SemiBold'
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '200'
  },

  submitData: {
    flex: 2,
    justifyContent: 'space-between',  
    alignItems: 'center',      
    paddingVertical: 20,     
  },
  submitButton: {
    width: '90%',              
    height: hp('6%'),                
    borderRadius: 10,          
    backgroundColor: '#942FFA',
    justifyContent: 'center',  
    alignItems: 'center',      
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'Montserrat-SemiBold'
  },
});

export default RegisterScreen;
