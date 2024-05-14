import { Text, View, StyleSheet, Button, TouchableOpacity, Linking, Appearance, SafeAreaView, Animated, Modal, ScrollView, Easing,} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Camera, CameraView } from "expo-camera";
import * as Font from "expo-font";
import { widthPercentageToDP as wp, heightPercentageToDP as hp} from "react-native-responsive-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { Entypo } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from "react-native";

export default function Scanner({ navigation, globalDomain }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [focusedScreen, setFocusedScreen] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [scanData, setScanData] = useState(null);
  const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme());
  const [warningMessage, setWarningMessage] = useState("");
  const [IsshowModal, setShowModal] = useState(false);
  const [persons, setPersons] = useState([]);
  const [totalScannerTicketQty, setTotalScannerTicketQty] = useState(0);
  const [scannedTicket, setScannedTicket] = useState(0); 
  const [success, setSuccess] = useState(false);
  const [warning, setWarning] = useState(false);
  const modalAnimation = useRef(new Animated.Value(hp("100%"))).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const cameraRef = useRef(null);

  async function loadFonts() {
    await Font.loadAsync({
      "Montserrat-SemiBold": require("../../assets/fonts/Montserrat-SemiBold.ttf"),
      "Montserrat-Medium": require("../../assets/fonts/Montserrat-Medium.ttf"),
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
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };
    getCameraPermissions();
  }, []);

  useEffect(() => {
    if (success || warningMessage || warning) {
      Animated.timing(successOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(successOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [success, warningMessage, warning]);

  useFocusEffect(
    React.useCallback(() => {
      const startCamera = async () => {
        if (cameraRef.current) {
          await cameraRef.current.resumePreview();
          setScanned(false)
        }
      };
      const stopCamera = async () => {
        if (cameraRef.current) {
          await cameraRef.current.pausePreview();
        }
      };
      startCamera();
      return () => {
        stopCamera();
      };
    }, [])
  );

  useEffect(() => {
    if (focusedScreen && hasPermission) {
      Animated.timing(modalAnimation, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();
    }
  }, [focusedScreen, hasPermission]);

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    setScanData(data);
    const storedDataJSON = await AsyncStorage.getItem("userData");
    const storedData = JSON.parse(storedDataJSON);
    try {
      const response = await fetch(
        `${globalDomain}/api/SacnneTicket`,
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
        fetchData();
        setShowModal(true);
        showModal();
      }
    } catch (error) {
      setScanned(false);
      console.error("Error:", error.message);
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  } 
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  // after Modal

  const fetchData = async () => {
    try {
      const scannedDataJSON = await AsyncStorage.getItem('scannedData');
      if (scannedDataJSON) {
        const scannedData = JSON.parse(scannedDataJSON);
        const count = scannedData.TotalBookTicket - scannedData.TotalShareTicket;
        const initialPersons = Array(count).fill({ checked: false });
        setPersons(initialPersons);
        const scannedTicket = scannedData.TotalSacnnerTicketQty;
        setScannedTicket(scannedTicket); 
        const updatedPersons = initialPersons.map((person, index) => {
          return { ...person, checked: index < scannedTicket };
        });
        setPersons(updatedPersons);
      } else {
        console.log('No scanned data found');
      }
    } catch (error) {
      console.error('Error fetching scanned data:', error);
    }
  };

  const handleCheckboxChange = (clickedIndex) => {
    setPersons(prevPersons => {
      const updatedPersons = prevPersons.map((person, index) => {
        if (index <= clickedIndex) {
          if (index < scannedTicket) {
            return { ...person, checked: true }; 
          } else {
            return { ...person, checked: !person.checked }; 
          }
        } else {
          return person; 
        }
      });
      const newTotalScannerTicketQty = updatedPersons.filter((person, index) => person.checked && index >= scannedTicket).length;
      setTotalScannerTicketQty(newTotalScannerTicketQty);
      return updatedPersons;
    });
  };

  const handleProceedData = async () => {
    const scannedDataJSON = await AsyncStorage.getItem('scannedData');
    const scannedData = JSON.parse(scannedDataJSON);
    const storedDataJSON = await AsyncStorage.getItem('userData');
    const storedData = JSON.parse(storedDataJSON);
    try {
        console.log('book ticket', scannedData);
        console.log('totalScannerTicketQty', totalScannerTicketQty);
        const response = await fetch(`${globalDomain}/api/SacnneTicket/confirm-ticket`, {
            method: 'POST',
            headers: {
                "Accept": 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + storedData.AuthorizationKey,
            },
            body: JSON.stringify({
                "BookTicketDeatils": scannedData.BookTicketDeatils,
                "ScannerLoginId": storedData.ScannerLoginId,
                "TotalSacnnerTicketQty": totalScannerTicketQty,
            })
        });
        if (!response.ok) {
          if (responseBody.ResponseCode === 0) {
            setWarning(true);
          } 
            throw new Error(`Failed to fetch data`);
        }
        const responseBody = await response.json();
        setShowModal(false);
        if (responseBody.ResponseCode === 0) {
          setSuccess(true);
        } 
        return responseBody;
    } catch (error) {
        console.error('Error fetching or parsing data:', error);
    }
  };

  // Modal Animation 
  const showModal = () => {
    Animated.timing(modalAnimation, {
      toValue: 1,
      duration: 1000, 
      easing: Easing.linear, 
      useNativeDriver: true,
    }).start();
  };

  setTimeout(() => {
    setWarningMessage("");
    setSuccess(false);
    setWarning(false);
  }, 5000);

  const CustomCheckbox = ({ checked }) => (
    <View style={{ backgroundColor: checked ? '#942FFA' : colorScheme === 'dark' ? '#888888' : '#D8D8D8', height: 25, width: 25, justifyContent: 'center', alignItems: 'center', borderRadius: 10, }}>
      {checked && <Entypo name="check" size={15} color="#FFF" />}
    </View>
  );

  return (
    <SafeAreaView style={styles(colorScheme).container}>

      {/* Message Container */}
      <View style={styles(colorScheme).messageContainer}>
      {(success || warningMessage || warning) && (
        <View style={styles(colorScheme).successContainer}>
          <LinearGradient
            colors={success ? ['#b0e8d1', '#FFFFFF'] : ['#ffe0b3', '#FFFFFF']}
            style={styles(colorScheme).successMessages}
          >
            <View style={{ flexDirection: 'row', width: wp('100%'), gap: 20, alignItems: 'center', padding: 20, overflow: 'hidden' }}>
              <View style={{ height: 45, width: 45, backgroundColor: '#FFF', borderRadius: 50, justifyContent: 'center', alignItems: 'center', elevation: 2 }}>
                <Image source={success ? require('../../images/tick-mark.png') : require('../../images/warning-sign.png')} resizeMode="stretch" style={{ height: 25, width: 25 }} />
              </View>
              <View style={{ width: wp('60%'), overflow: 'hidden', gap: 5 }}>
                <Text style={{ fontFamily: 'Montserrat-SemiBold', fontSize: 16 }}>
                  {success ? 'Ticket successfully scanned' : warningMessage ? warningMessage : 'Something is Went wrong'}
                </Text>
              </View>
            </View> 
          </LinearGradient>
        </View>
      )}
      </View>

      {/* Camera View */}
      <View style={styles(colorScheme).scannerCamera}>
        <CameraView
          // type={Camera.Constants.Type.back}
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr", "pdf417"],
          }}
          // ref={cameraRef}
          style={{ flex: 1 }}
        />
      </View>

      {/* Modal Component */}
      {IsshowModal && (
        <Modal transparent={true}>
          <Animated.View style={{ ...StyleSheet.absoluteFillObject, flex: 1, justifyContent: "flex-end", alignItems: "center", transform: [{ translateY: modalAnimation }] }}>
            <View style={{ backgroundColor: colorScheme === "dark" ? "#262626" : "#FFFFFF", padding: 15,width: '95%',height: '75%', borderRadius: 10 }}>
              <ScrollView style={styles(colorScheme).subContainer} showsVerticalScrollIndicator={false}>
                <View style={styles(colorScheme).sub_Content}>
                  {persons.map((person, index) => (
                    <TouchableOpacity key={index} style={styles(colorScheme).row} onPress={() => handleCheckboxChange(index)}>
                      <Text style={styles(colorScheme).text}>Person  {index + 1}</Text>
                      <CustomCheckbox checked={person.checked} />
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              <TouchableOpacity 
                style={[
                  styles(colorScheme).ProceedButton, 
                  totalScannerTicketQty < 1 && { opacity: 0.5, backgroundColor: colorScheme === 'dark' ? '#333333' : '#333333', }
                ]} 
                onPress={() => {totalScannerTicketQty >= 1 && handleProceedData()}}
                disabled={totalScannerTicketQty < 1}
              >
                <Text style={styles(colorScheme).ProceedText}>Proceed</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Modal>
      )}

      {/* Scan Again */}
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
      flex: .5,
      paddingTop: 100,
    },
    successContainer: {
      flex: .5,
      justifyContent: 'center',
      alignSelf: 'center',
      width: wp("90%"),
    },
    successMessages: {
      borderRadius: 15,
      borderWidth: 2,
      borderColor: '#FFFFFF',
      elevation: 5,
    },
    scannerCamera: {
      flex: 1,
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


    // after modal 
    subContainer: {
      backgroundColor: colorScheme === 'dark' ? '#333333' : '#EEEEEE',
      borderRadius: 10,
      borderLeftWidth: 3,
      borderLeftColor: '#9938fa',
      margin: 10,
      padding: 10,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 15,
      borderBottomWidth: 1,
      borderColor: colorScheme === 'dark' ? '#888888' : '#D8D8D8'
    },
    text: {
      color: colorScheme === 'dark' ? '#CCCCCC' : '#000000',
      fontSize: 18,
      fontFamily: 'Montserrat-Medium',
      letterSpacing: .5,
      textTransform: 'uppercase',
    },
    ProceedButton: {
      marginBottom: 10,
      width: '100%',
      paddingVertical: 10,
      marginTop: 20,
      borderRadius: 10,
      backgroundColor: '#942FFA',
      justifyContent: 'flex-end',
      alignSelf: 'center',
      alignItems: 'center',
    },
    ProceedText: {
      color: '#FFFFFF',
      fontSize: 20,
      fontWeight: 'bold',
      letterSpacing: 1,
      fontFamily: 'Montserrat-SemiBold'
    }
  });