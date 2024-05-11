import {
  Text,
  View,
  StyleSheet,
  Button,
  TouchableOpacity,
  Linking,
  Appearance,
  SafeAreaView,
  Animated,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Camera, CameraType } from "expo-camera";
import * as Font from "expo-font";

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

export default function Scanner({ navigation, globalDomain }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scanData, setScanData] = useState(null);
  const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme());
  const [warningMessage, setWarningMessage] = useState("");
  const cameraRef = useRef(null);

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
  
  useFocusEffect(
    React.useCallback(() => {
      setScanned(false);
      setScanData(null);
      if (cameraRef.current) {
        cameraRef.current.resumePreview();
      }
    }, [])
  );

  useEffect(() => {
    const unsubscribeFocus = navigation.addListener("focus", handleFocusCamera);
    const unsubscribeBlur = navigation.addListener("blur", handleBlurCamera);

    return () => {
      unsubscribeFocus();
      unsubscribeBlur();
    };
  }, [navigation]);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };
    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    setScanData(data);
    const storedDataJSON = await AsyncStorage.getItem("userData");
    const storedData = JSON.parse(storedDataJSON);
    try {
      const response = await fetch(
        "https://actopassapi.actoscript.com/api/SacnneTicket",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + storedData.AuthorizationKey,
          },
          body: JSON.stringify({
            QrCode: data,
            ScannerLoginId: storedData.ScannerLoginId,
          }),
        }
      );
      if (!response.ok) {
        if (response.status === 404) {
          const responseBody = await response.json();
          setWarningMessage(responseBody.ResponseMessage);
        }
      } else {
        const scannedData = await response.json();
        await AsyncStorage.setItem("scannedData", JSON.stringify(scannedData));
        navigation.navigate("Home");
      }
    } catch (error) {
      setScanned(false);
      console.error("Error:", error.message);
    }
  };

  const handleFocusCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.resumePreview();
      setScanned(false);
      setScanData(null);
      setWarningMessage("");
    }
  };

  const handleBlurCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.pausePreview();
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <SafeAreaView style={styles(colorScheme).container}>
      <View style={styles(colorScheme).messageContainer}>
        {warningMessage !== "" && (
          <View style={styles(colorScheme).warningMessages}>
            <Text numberOfLines={3} style={styles(colorScheme).warningText}>
              {warningMessage}
            </Text>
          </View>
        )}
      </View>
      <View style={styles(colorScheme).scannerCamera}>
        <Camera
          type={Camera.Constants.Type.back}
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          ref={cameraRef}
          style={{ flex: 1 }}
        />
      </View>
      <View style={{ flex: 1 }}>
        {scanned && (
          <TouchableOpacity
            style={styles(colorScheme).submitButton}
            onPress={handleFocusCamera}
          >
            <Text style={styles(colorScheme).submitText}>Scan Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = (colorScheme) => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme === "dark" ? "#000000" : "#FFFFFF",
    },
    messageContainer: {
      flex: 1,
      paddingTop: 100,
    },
    warningMessages: {
      flex: 0.5,
      width: wp("80%"),
      padding: 10,
      alignSelf: "center",
      justifyContent: "center",
      backgroundColor: getRandomColor(),
      borderBottomWidth: 2,
      borderLeftWidth: 2,
      borderBottomColor: '#FFFFFF',
      borderLeftColor: '#FFFFFF',
      borderRadius: 20,
      shadowColor: colorScheme === "dark" ? "#FFFFFF" : "#000000",
      elevation: 7,
    },
    warningText: {
      color: colorScheme === "dark" ? "#FFFFFF" : "#333333",
      fontSize: 18,
      fontFamily: "Montserrat-SemiBold",
      textAlign: "center",
    },
    scannedText: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      color: "#000000",
      fontSize: 18,
    },
    scannerCamera: {
      flex: 1.5,
      margin: 50,
      overflow: "hidden",
      borderRadius: 30,
    },
    submitButton: {
      width: wp("50%"),
      backgroundColor: "#942FFA",
      alignItems: "center",
      alignSelf: "center",
      padding: 10,
      borderRadius: 10,
    },
    submitText: {
      color: "#FFFFFF",
      fontSize: 18,
    },
    
  });

  const colors = ["#607D8B", "#947065", "#BCAAA4", "#80CBC4", "#9FA8DA", "#BAA26A", "#AC559F", "#CA897E"];
  const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  };