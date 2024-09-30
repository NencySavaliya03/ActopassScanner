import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Appearance,
  SafeAreaView,
  Animated,
  Modal,
  ScrollView,
  Easing,
  PanResponder,
  TouchableWithoutFeedback,
  TextInput,
  Alert,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";

import * as Font from "expo-font";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Entypo } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { SET_SCANDATA } from "../../redux/Login/loginSlice";
import { CameraView } from "expo-camera";

export default function Scanner() {
  const dispatch = useDispatch();
  const scannedData = useSelector((state) => state.loginData.scanData);
  const [scanned, setScanned] = useState(false);
  const [scanData, setScanData] = useState(null);
  const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme());
  const [IsshowModal, setShowModal] = useState(false);
  const [persons, setPersons] = useState([]);
  const [totalScannerTicketQty, setTotalScannerTicketQty] = useState(0);
  const [scannedTicket, setScannedTicket] = useState(0);
  const [success, setSuccess] = useState("");
  const [warning, setWarning] = useState("");
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [email, setEmail] = useState("");
  const modalAnimation = useRef(new Animated.Value(hp("100%"))).current;
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [profileData, setProfileData] = useState({});
  const profileModalAnimation = useRef(new Animated.Value(hp("100%"))).current;

  async function loadFonts() {
    await Font.loadAsync({
      "Montserrat-SemiBold": require("../../assets/fonts/Montserrat-SemiBold.ttf"),
      "Montserrat-Medium": require("../../assets/fonts/Montserrat-Medium.ttf"),
    });
  }

  const cameraRef = useRef(null);
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
    const hideMessageTimeout = setTimeout(() => {
      setSuccess(false);
      setWarning(false);
    }, 1000);
    return () => clearTimeout(hideMessageTimeout);
  }, [success, warning]);

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    setScanData(data);

    const storedDataJSON = await AsyncStorage.getItem("userData");
    const storedData = JSON.parse(storedDataJSON);
    try {
      const response = await fetch(`${global.DomainName}/api/SacnneTicket`, {
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
      });
      if (!response.ok) {
        if (response.status === 404) {
          const responseBody = await response.json();
          setWarning(responseBody.ResponseMessage);
        }
      } else {
        const scannedData = await response.json();
        console.log("scannedData: ", scannedData);
        dispatch(SET_SCANDATA(scannedData));
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

  const handleScanData = async () => {
    setSuccess("");
    setWarning("");
    if (warning == "" && email == "") {
      return;
    }
    const storedDataJSON = await AsyncStorage.getItem("userData");
    const storedData = JSON.parse(storedDataJSON);
    try {
      const response = await fetch(`${global.DomainName}/api/SacnneTicket`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + storedData.AuthorizationKey,
        },
        body: JSON.stringify({
          QrCode: email,
          ScannerLoginId: storedData.ScannerLoginId,
        }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          setEmail("");
          const responseBody = await response.json();
          setWarning(responseBody.ResponseMessage);
        }
      } else {
        const scannedData = await response.json();
        dispatch(SET_SCANDATA(scannedData));
        console.log(scannedData);
        await AsyncStorage.setItem("scannedData", JSON.stringify(scannedData));
        fetchData();
        if (scannedData.ResponseCode === 0) {
          setEmail("");
          if (scannedData.KhelaiyaGroupid != "") {
            setProfileData({
              name: scannedData.Name,
              group: scannedData.KhelaiyaGroupName,
              KhelaiyaGroupType: scannedData.KhelaiyaGroupType,
              email: scannedData.Email,
              mobile: scannedData.Mobile,
              profilephoto: scannedData.ProfileImage,
              response: scannedData.ResponseMessage,
              RegistrationId: scannedData.RegistrationId,
            });
            showProfileModal();
          } else {
            setEmail("");
            showModal();
            setShowModal(true);
          }
          setSuccess(scannedData.ResponseMessage);
        }
      }
      setEmail("");
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  const fetchData = async () => {
    try {
      const scannedDataJSON = await AsyncStorage.getItem("scannedData");
      if (scannedDataJSON) {
        const scannedData = JSON.parse(scannedDataJSON);
        const count =
          scannedData.TotalBookTicket - scannedData.TotalShareTicket;
        const initialPersons = Array(count).fill({ checked: false });
        setPersons(initialPersons);
        const scannedTicket = scannedData.TotalSacnnerTicketQty;
        setScannedTicket(scannedTicket);
        const updatedPersons = initialPersons.map((person, index) => {
          return { ...person, checked: index < scannedTicket };
        });
        setPersons(updatedPersons);
      } else {
        console.log("No scanned data found");
      }
    } catch (error) {
      console.error("Error fetching scanned data:", error);
    }
  };

  const handleCheckboxChange = (clickedIndex) => {
    setPersons((prevPersons) => {
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
      const newTotalScannerTicketQty = updatedPersons.filter(
        (person, index) => person.checked && index >= scannedTicket
      ).length;
      setTotalScannerTicketQty(newTotalScannerTicketQty);
      return updatedPersons;
    });
  };

  const handleProceedData = async () => {
    const scannedDataJSON = await AsyncStorage.getItem("scannedData");
    const scannedData = JSON.parse(scannedDataJSON);
    const storedDataJSON = await AsyncStorage.getItem("userData");
    const storedData = JSON.parse(storedDataJSON);
    try {
      console.log("book ticket", scannedData);
      console.log("totalScannerTicketQty", totalScannerTicketQty);
      const response = await fetch(
        `${global.DomainName}/api/SacnneTicket/confirm-ticket`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + storedData.AuthorizationKey,
          },
          body: JSON.stringify({
            BookTicketDeatils: scannedData.BookTicketDeatils,
            ScannerLoginId: storedData.ScannerLoginId,
            TotalSacnnerTicketQty: totalScannerTicketQty,
          }),
        }
      );
      if (!response.ok) {
        if (responseBody.ResponseCode === 0) {
          setWarning(true);
        }
        throw new Error(`Failed to fetch data`);
      }
      const responseBody = await response.json();
      console.log("responseBody: ", responseBody);
      setShowModal(false);
      if (responseBody.ResponseCode === 0) {
        setSuccess(true);
      }
      return responseBody;
    } catch (error) {
      console.error("Error fetching or parsing data:", error);
    }
  };

  // Modal Animation
  const showModal = () => {
    setShowModal(true);
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 500,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  };

  const hideModal = () => {
    Animated.timing(modalAnimation, {
      duration: 500,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => setShowModal(false));
  };

  const showProfileModal = () => {
    setProfileModalVisible(true);
    Animated.timing(profileModalAnimation, {
      toValue: 0,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const hideProfileModal = () => {
    Animated.timing(profileModalAnimation, {
      toValue: 0,
      duration: 500,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => setProfileModalVisible(false));
  };

  const CustomCheckbox = ({ checked }) => (
    <View
      style={{
        backgroundColor: checked
          ? "#942FFA"
          : colorScheme === "dark"
          ? "#888888"
          : "#D8D8D8",
        height: 25,
        width: 25,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
      }}
    >
      {checked && <Entypo name="check" size={15} color="#FFF" />}
    </View>
  );

  return (
    <SafeAreaView style={styles(colorScheme).container}>
      {/* Message Container */}
      <View style={styles(colorScheme).messageContainer}>
        {(success || warning) && (
          <View style={styles(colorScheme).successContainer}>
            <LinearGradient
              colors={success ? ["#b0e8d1", "#FFFFFF"] : ["#ffe0b3", "#FFFFFF"]}
              style={styles(colorScheme).successMessages}
            >
              <View
                style={{
                  flexDirection: "row",
                  width: wp("100%"),
                  gap: 20,
                  alignItems: "center",
                  padding: 20,
                }}
              >
                <View
                  style={{
                    height: 45,
                    width: 45,
                    backgroundColor: "#FFF",
                    borderRadius: 50,
                    justifyContent: "center",
                    alignItems: "center",
                    elevation: 2,
                  }}
                >
                  <Image
                    source={
                      success
                        ? require("../../images/tick-mark.png")
                        : require("../../images/warning-sign.png")
                    }
                    resizeMode="stretch"
                    style={{ height: 25, width: 25 }}
                  />
                </View>
                <View style={{ width: wp("60%"), overflow: "hidden", gap: 5 }}>
                  <Text
                    style={{ fontFamily: "Montserrat-SemiBold", fontSize: 16 }}
                  >
                    {success ? success : warning}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        )}
      </View>

      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          gap: wp(3),
        }}
      >
        <View style={styles(colorScheme).scannerCamera}>
          <CameraView
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr", "pdf417"],
            }}
            ref={cameraRef}
            style={{ flex: 1 }}
          />
        </View>
        <TextInput
          style={[
            styles(colorScheme).inputContainer,
            {
              borderColor: isEmailFocused
                ? "#cc9cfc"
                : colorScheme === "dark"
                ? "#333"
                : "#ccc",
            },
          ]}
          placeholder="Enter Code "
          placeholderTextColor={"#b3b3b3"}
          onFocus={() => setIsEmailFocused(true)}
          onBlur={() => setIsEmailFocused(false)}
          autoCapitalize="none"
          value={email}
          onChangeText={(value) => {
            setEmail(value);
          }}
          blurOnSubmit={false}
          returnKeyType="next"
        />
        <TouchableOpacity
          style={styles(colorScheme).submitButton}
          onPress={handleScanData}
          hitSlop={30}
        >
          <Text style={styles(colorScheme).submitText}>Scan </Text>
        </TouchableOpacity>
      </View>

      {/* Modal Component */}
      {IsshowModal && (
        <Modal transparent={true}>
          <Animated.View
            style={{
              ...StyleSheet.absoluteFillObject,
              flex: 1,
              justifyContent: "flex-end",
              alignItems: "center",
              transform: [{ translateY: modalAnimation }],
            }}
          >
            <View
              style={{
                backgroundColor: colorScheme === "dark" ? "#262626" : "#F2F2F2",
                padding: 15,
                width: "95%",
                height: "75%",
                borderRadius: 10,
              }}
            >
              <View
                style={{
                  height: 60,
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ paddingLeft: 20, gap: 10 }}>
                  <View style={{}}>
                    <Text
                      style={{
                        color: colorScheme === "dark" ? "#CCCCCC" : "#000000",
                        fontSize: 22,
                        fontFamily: "Montserrat-Medium",
                      }}
                    >
                      {scannedData.TicketType} - {persons.length} Tickets
                    </Text>
                  </View>
                  <View style={{ width: "90%" }}>
                    <Text
                      numberOfLines={1}
                      style={{
                        color: colorScheme === "dark" ? "#CCCCCC" : "#000000",
                        fontFamily: "Montserrat-Medium",
                        fontSize: 16,
                      }}
                    >
                      {" "}
                      you'll enjoy {scannedData.TicketType} perks and benefits
                      that will elevate your event experience to new heights.
                    </Text>
                  </View>
                </View>
                <View>
                  <AntDesign
                    name="closecircle"
                    size={25}
                    color={colorScheme === "dark" ? "#FFFFFF" : "#000000"}
                    style={{ alignSelf: "flex-end" }}
                    onPress={() => hideModal()}
                  />
                </View>
              </View>
              <ScrollView
                style={styles(colorScheme).subContainer}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles(colorScheme).sub_Content}>
                  {persons.map((person, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles(colorScheme).row}
                      onPress={() => handleCheckboxChange(index)}
                    >
                      <Text style={styles(colorScheme).text}>
                        Person {index + 1}
                      </Text>
                      <CustomCheckbox checked={person.checked} />
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              <TouchableOpacity
                style={[
                  styles(colorScheme).ProceedButton,
                  totalScannerTicketQty < 1 && {
                    opacity: 0.5,
                    backgroundColor:
                      colorScheme === "dark" ? "#333333" : "#333333",
                  },
                ]}
                onPress={() => {
                  totalScannerTicketQty >= 1 && handleProceedData();
                }}
                disabled={totalScannerTicketQty < 1}
              >
                <Text style={styles(colorScheme).ProceedText}>Proceed</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Modal>
      )}

      {profileModalVisible && (
        <Modal
          transparent={true}
          visible={profileModalVisible}
          animationType="slide"
        >
          <TouchableWithoutFeedback onPress={hideProfileModal}>
            {/* <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                justifyContent: "flex-end",
              }}
            >
              <TouchableWithoutFeedback onPress={() => {}}>
                <Animated.View
                  style={{
                    transform: [{ translateY: profileModalAnimation }],
                    height: "30%",
                    width: "90%",
                    backgroundColor:
                      colorScheme === "dark" ? "#262626" : "#FFFFFF",
                    padding: 20,
                    margin: 20,
                  }}
                >
                  <TouchableOpacity
                    onPress={hideProfileModal}
                    style={{ alignItems: "flex-end" }}
                  >
                    <AntDesign
                      name="closecircle"
                      size={20}
                      color={colorScheme === "dark" ? "#FFFFFF" : "#000000"}
                      onPress={hideProfileModal}
                    />
                  </TouchableOpacity>
                  <Image
                    resizeMode="cover"
                    source={{ uri: profileData.profilephoto }}
                    style={{
                      height: 80,
                      width: 80,
                      borderRadius: 50,
                      position: "absolute",
                      top: -40,
                      left: 30,
                      zIndex: 1,
                    }}
                  />

                  <View style={{ paddingLeft: "2%", gap: 10, marginTop: "4%" }}>
                    <Text
                      style={{
                        color: colorScheme === "dark" ? "#CCCCCC" : "#000000",
                        fontSize: 20,
                        fontFamily: "Montserrat-SemiBold",
                        // position: 'absolute',
                        // left: 0,
                      }}
                    >
                      {profileData.group}
                    </Text>
                    <View style={{ flexDirection: "row", gap: wp(3) }}>
                      <MaterialIcons
                        name="person-outline"
                        size={20}
                        color={colorScheme === "dark" ? "#FFFFFF" : "#666666"}
                      />
                      <Text
                        style={{
                          color: colorScheme === "dark" ? "#CCCCCC" : "#666666",
                          fontSize: 14,
                          fontFamily: "Montserrat-SemiBold",
                        }}
                      >
                        {profileData.name}
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row", gap: wp(3) }}>
                      <Image
                        source={
                          colorScheme === "dark"
                            ? require("../../images/face-id2.png")
                            : require("../../images/face-id1.png")
                        }
                        style={{ height: hp("2.5%"), width: hp("2.5%") }}
                      />
                      <Text
                        style={{
                          color: colorScheme === "dark" ? "#CCCCCC" : "#666666",
                          fontSize: 14,
                          fontFamily: "Montserrat-SemiBold",
                        }}
                      >
                        {profileData.RegistrationId}
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row", gap: wp(3) }}>
                      <MaterialCommunityIcons
                        name="email-variant"
                        size={20}
                        color={colorScheme === "dark" ? "#FFFFFF" : "#666666"}
                        onPress={hideProfileModal}
                      />
                      <Text
                        style={{
                          color: colorScheme === "dark" ? "#CCCCCC" : "#666666",
                          fontSize: 14,
                          fontFamily: "Montserrat-SemiBold",
                        }}
                      >
                        {profileData.email}
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row", gap: wp(3) }}>
                      <Ionicons
                        name="call-outline"
                        size={20}
                        color={colorScheme === "dark" ? "#FFFFFF" : "#666666"}
                        onPress={hideProfileModal}
                      />
                      <Text
                        style={{
                          color: colorScheme === "dark" ? "#CCCCCC" : "#666666",
                          fontSize: 14,
                          fontFamily: "Montserrat-SemiBold",
                        }}
                      >
                        {profileData.mobile}
                      </Text>
                    </View>
                    <Text
                      style={{
                        color: "green",
                        fontSize: 13,
                        marginTop: hp(1),
                        fontFamily: "Montserrat-SemiBold",
                      }}
                    >
                      {profileData.response}
                    </Text>
                  </View>
                </Animated.View>
              </TouchableWithoutFeedback>
            </View> */}

            <View style={styles(colorScheme).modalContents}>
              <TouchableOpacity
                hitSlop={40}
                style={{ position: "absolute", top: hp(5), right: wp(5) }}
                onPress={hideProfileModal}
              >
                <AntDesign
                  name="closecircle"
                  size={25}
                  color={colorScheme === "dark" ? "#FFFFFF" : "#444444"}
                />
              </TouchableOpacity>
              <View style={styles(colorScheme).imageContainer}>
                <Image
                  source={{
                    uri: profileData.profilephoto,
                  }}
                  style={styles(colorScheme).profileImage}
                />
                <View style={styles(colorScheme).ringContainer}>
                  <View style={styles(colorScheme).outerRing} />
                  <View style={styles(colorScheme).middleRing} />
                  <View style={styles(colorScheme).innering} />
                </View>
              </View>

              <View style={{ alignItems: "center", gap: hp(2) }}>
                <Text style={styles(colorScheme).title}>
                  {profileData.group} - {profileData.KhelaiyaGroupType}
                </Text>
                <View style={{ alignItems: "center", gap: hp(0.5) }}>
                  <Text style={styles(colorScheme).subtitle}>
                    {profileData.name}{" "}
                  </Text>
                  <Text
                    style={[styles(colorScheme).subtitle, { fontSize: 14 }]}
                  >
                    RegistrationId: {profileData.RegistrationId}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = (colorScheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme === "dark" ? "#000000" : "#FFFFFF",
    },
    messageContainer: {
      position: "absolute",
      top: hp(3),
      alignSelf: "center",
    },
    successContainer: {
      justifyContent: "center",
      alignSelf: "center",
      width: wp("90%"),
    },
    successMessages: {
      borderRadius: 15,
      borderWidth: 2,
      borderColor: "#FFFFFF",
      elevation: 5,
    },
    submitButton: {
      width: wp("40%"),
      backgroundColor: "#942FFA",
      alignItems: "center",
      alignSelf: "center",
      padding: hp(1),
      borderRadius: 10,
    },
    submitText: {
      color: "#FFFFFF",
      fontSize: 18,
      fontFamily: "Montserrat-SemiBold",
    },
    inputContainer: {
      height: hp("6%"),
      width: wp("90%"),
      backgroundColor: colorScheme === "dark" ? "#444" : "#FFFFFF",
      borderRadius: 30,
      borderWidth: 1,
      paddingHorizontal: wp(5),
      elevation: 7,
      marginBottom: hp(3),
      fontSize: 16,
      color: colorScheme === "dark" ? "#FFF" : "#5A5A5A",
      fontFamily: "Montserrat-SemiBold",
    },
    // after modal
    subContainer: {
      backgroundColor: colorScheme === "dark" ? "#333333" : "#e6e6e6",
      borderRadius: 10,
      borderLeftWidth: 3,
      borderLeftColor: "#9938fa",
      margin: 10,
      padding: 10,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 15,
      borderBottomWidth: 1,
      borderColor: colorScheme === "dark" ? "#888888" : "#D8D8D8",
    },
    text: {
      color: colorScheme === "dark" ? "#CCCCCC" : "#000000",
      fontSize: 18,
      fontFamily: "Montserrat-Medium",
      letterSpacing: 0.5,
      textTransform: "uppercase",
    },
    ProceedButton: {
      marginBottom: 10,
      width: "100%",
      paddingVertical: 10,
      marginTop: 20,
      borderRadius: 10,
      backgroundColor: "#942FFA",
      justifyContent: "flex-end",
      alignSelf: "center",
      alignItems: "center",
    },
    ProceedText: {
      color: "#FFFFFF",
      fontSize: 20,
      fontWeight: "bold",
      letterSpacing: 1,
      fontFamily: "Montserrat-SemiBold",
    },
    profileContainer: {
      backgroundColor: colorScheme === "dark" ? "#262626" : "#FFFFFF",
      padding: 20,
      borderRadius: 10,
      alignItems: "center",
    },
    profileText: {
      fontSize: 18,
      color: colorScheme === "dark" ? "#FFFFFF" : "#000000",
    },
    profileImage: {
      height: 100,
      width: 100,
      borderRadius: 50,
      marginVertical: 20,
    },

    modalContents: {
      flex: 1,
      backgroundColor: colorScheme === "dark" ? "#333333" : "#FFFFFF",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      gap: hp(5),
    },
    title: {
      fontFamily: "Montserrat-Bold",
      fontSize: 26,
      color: colorScheme === "dark" ? "#CCCCCC" : "#000000",
    },
    subtitle: {
      fontFamily: "Montserrat-SemiBold",
      fontSize: 18,
      color: colorScheme === "dark" ? "#CCCCCC" : "#444",
    },
    imageContainer: {
      position: "relative",
      marginBottom: 20,
    },
    profileImage: {
      width: wp(40),
      height: wp(40),
      borderRadius: wp(50),
    },
    ringContainer: {
      position: "absolute",
      top: -20,
      left: -20,
      right: -20,
      bottom: -20,
      justifyContent: "center",
      alignItems: "center",
    },
    outerRing: {
      position: "absolute",
      width: wp(56),
      height: wp(56),
      borderRadius: wp(50),
      borderWidth: 2.2,
      borderColor: "rgba(140, 140, 140, 0.4)",
    },
    innering: {
      position: "absolute",
      width: wp(45),
      height: wp(45),
      borderRadius: wp(50),
      borderWidth: 1.5,
      borderColor: "rgba(89, 89, 89, 0.4)",
    },
    middleRing: {
      position: "absolute",
      width: wp(50),
      height: wp(50),
      borderRadius: wp(50),
      borderWidth: 2,
      borderColor: "rgba(128, 128, 128, 0.2)",
    },
    scannerCamera: {
      flex: 1,
      margin: 50,
      overflow: "hidden",
      borderRadius: 30,
    },
  });
