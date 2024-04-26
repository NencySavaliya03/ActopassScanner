import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Button, TouchableOpacity, Linking, Appearance } from "react-native";
import { Camera, CameraType } from 'expo-camera';

export default function Scanner() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scanData, setScanData] = useState(null);
  const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme());

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };
    getCameraPermissions();
  }, []);

  useEffect(() => {
    const handleChange = (preferences) => {
      setColorScheme(preferences.colorScheme);
    };
    const subscription = Appearance.addChangeListener(handleChange);
    return () => {
      subscription.remove();
    };
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setScanData(data);
  };

  // const handleOpenLink = (url) => {
  //   Linking.canOpenURL(url).then(supported => {
  //     if (supported) {
  //       Linking.openURL(url);
  //     } else {
  //       alert("Don't know how to open this URL: " + url);
  //     }
  //   });
  // };

  const handleReset = () => {
    setScanned(false);
    setScanData(null);
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles(colorScheme).container}>
      <Text style={styles(colorScheme).scannedText}>{scanned && scanData}</Text>
      <View style={styles(colorScheme).cameraContainer}>
        <Camera
          type={CameraType.back}
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={styles(colorScheme).camera}
        />
      </View>
      {scanned && (
        <TouchableOpacity style={styles(colorScheme).submitButton}>
          <Text style={styles(colorScheme).submitText} onPress={handleReset}>Scan Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = (colorScheme) => StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colorScheme === 'dark' ? '#000000' : '#FFFFFF', 
  },
  cameraContainer: {
    height: 300,
    width: 300,
    overflow: 'hidden',
    borderRadius: 20, 
  },
  camera: {
    flex: 1,
  },
  submitButton: {
    width: '50%',
    paddingVertical: 10,
    marginTop: 50,
    borderRadius: 10,
    backgroundColor: '#942FFA',
    alignSelf: 'center',
    alignItems: 'center',
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1
  },
  scannedText: {
    color: '#000000',
    fontSize: 20,
    marginBottom: 20
  }
});
