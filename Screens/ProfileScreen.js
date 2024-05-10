import {
  ImageBackground,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native";
import { Avatar } from "react-native-elements";
import { Appearance } from "react-native";
import * as Font from "expo-font";
import { useSelector } from "react-redux";

export default function ProfileScreen() {
  const userData = useSelector((state) => state.loginData.userData);
  const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme());

  async function loadFonts() {
    await Font.loadAsync({
      "Montserrat-SemiBold": require("../assets/fonts/Montserrat-SemiBold.ttf"),
      "Montserrat-Medium": require("../assets/fonts/Montserrat-Medium.ttf"),
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

  return (
    <SafeAreaView style={styles(colorScheme).container}>
      <ImageBackground
        style={styles(colorScheme).imageContainer}
        source={require("../images/backgroundImage.jpg")}
      >
        <KeyboardAvoidingView
          style={styles(colorScheme).keyboardAvoidingContainer}
          behavior={Platform.OS === "ios" ? "height" : null}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -500}
        >
          <View style={styles(colorScheme).userProfile}>
            <Avatar
              size={120}
              rounded
              containerStyle={{
                backgroundColor: colorScheme === "dark" ? "#464646" : "#ffffff",
              }}
              source={{ uri: userData?.PhotoPath }}
            />
          </View>

          <View style={styles(colorScheme).loginContent}>
            <ScrollView style={{ flex: 1, width: "100%" }}>
              <View style={styles(colorScheme).userDetails}>
                <View>
                  <View style={styles(colorScheme).inputPlaceholder}>
                    <Image
                      source={require("../images/face-id.png")}
                      style={styles(colorScheme).inputIcons}
                    />
                    <Text style={styles(colorScheme).inputText}> User ID </Text>
                  </View>
                  <Text style={styles(colorScheme).userInput}>
                    {userData?.Code}
                  </Text>
                </View>
                <View>
                  <View style={styles(colorScheme).inputPlaceholder}>
                    <Image
                      source={require("../images/usericon.png")}
                      style={styles(colorScheme).inputIcons}
                    />
                    <Text style={styles(colorScheme).inputText}>
                      {" "}
                      User Name{" "}
                    </Text>
                  </View>
                  <Text style={styles(colorScheme).userInput}>
                    {userData?.Name}
                  </Text>
                </View>
                <View>
                  <View style={styles(colorScheme).inputPlaceholder}>
                    <Image
                      source={require("../images/envelope.png")}
                      style={styles(colorScheme).inputIcons}
                    />
                    <Text style={styles(colorScheme).inputText}>
                      {" "}
                      Email ID{" "}
                    </Text>
                  </View>
                  <Text style={styles(colorScheme).userInput}>
                    {userData?.EmailId}
                  </Text>
                </View>
                <View>
                  <View style={styles(colorScheme).inputPlaceholder}>
                    <Image
                      source={require("../images/phone-call.png")}
                      style={styles(colorScheme).inputIcons}
                    />
                    <Text style={styles(colorScheme).inputText}>
                      {" "}
                      Mobile No{" "}
                    </Text>
                  </View>
                  <Text style={styles(colorScheme).userInput}>
                    {userData?.MobileNo}
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = (colorScheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme === "dark" ? "#000000" : "#FFFFFF",
    },
    keyboardAvoidingContainer: {
      flex: 1,
      justifyContent: "flex-end",
    },
    imageContainer: {
      flex: 1,
      width: "100%",
      justifyContent: "flex-end",
    },
    userProfile: {
      flex: 0.3,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 20,
    },
    loginContent: {
      flex: 0.8,
      justifyContent: "flex-end",
      alignItems: "center",
      backgroundColor: colorScheme === "dark" ? "#333333" : "#FFFFFF",
      borderTopRightRadius: 50,
      borderTopLeftRadius: 50,
      elevation: 10,
    },
    userDetails: {
      flex: 1,
      width: "90%",
      gap: 30,
      marginTop: 100,
      alignSelf: "center",
    },
    inputPlaceholder: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    inputText: {
      color: "#8c8c8c",
      fontSize: 16,
      fontFamily: "Montserrat-SemiBold",
    },
    inputIcons: {
      height: 25,
      width: 25,
    },
    userInput: {
      borderBottomWidth: 1.5,
      borderBottomColor: colorScheme === "dark" ? "#464646" : "#CCCCCC",
      padding: 5,
      paddingBottom: 15,
      paddingHorizontal: 35,
      fontSize: 18,
      fontFamily: "Montserrat-SemiBold",
      color: colorScheme === "dark" ? "#FFFFFF" : "#000000",
    },
  });
