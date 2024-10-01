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
  TextInput,
  FlatList,
  Alert,
  StatusBar,
  TouchableWithoutFeedback,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Camera } from "expo-camera";
import * as Font from "expo-font";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Entypo } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "react-native";
import { CameraView } from "expo-camera/next";
import { useDispatch, useSelector } from "react-redux";
import { SET_SCANDATA } from "../../redux/Login/loginSlice";

export default function ScannerCopy() {
  const dispatch = useDispatch();
  const scannedData = useSelector((state) => state.loginData.scanData);
  const [hasPermission, setHasPermission] = useState(null);
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
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("RFCode");
  const profileModalAnimation = useRef(new Animated.Value(hp("100%"))).current;
  const [IsLoading, setLoading] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };
    getCameraPermissions();
  }, []);

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
    const hideMessageTimeout = setTimeout(() => {
      setWarningMessage("");
      setSuccess(false);
      setWarning(false);
    }, 3000);
    return () => clearTimeout(hideMessageTimeout);
  }, [warningMessage, success, warning]);

  const DATA = [
    { id: "1", name: "Scan" },
    { id: "2", name: "RFCode" },
    { id: "3", name: "Manually" },
  ];

  const renderScanner = ({ item }) => (
    <TouchableOpacity onPress={() => setCategory(item.name)}>
      <View
        style={[
          styles(colorScheme).categoryItem,
          {
            backgroundColor:
              category === item.name
                ? "#942FFA"
                : colorScheme === "dark"
                ? "#444"
                : "#EEEEEE",
          },
        ]}
      >
        <Text
          style={[
            styles(colorScheme).listTitle,
            {
              color:
                category == item.name
                  ? "#FFF"
                  : colorScheme === "dark"
                  ? "#FFF"
                  : "#000",
            },
          ]}
        >
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  );

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
          QrCode: data.trim(""),
          ScannerLoginId: 26,
          Type: "RFID",
        }),
      });

      const responseBody = await response;
      console.log("responseBody", responseBody);
      if (!response.ok) {
        if (response.status === 404) {
          const responseBody = await response.json();
          setWarning(responseBody.ResponseMessage);
        }
      } else {
        const scannedData = await response.json();
        if (scannedData.ScannerType == "Vendor") {
          setSuccess(
            scannedData.VendorGroupName + " Vendor is scanned successfully."
          );
        } else {
          console.log("scannedData: ", scannedData.ResponseMessage);
          dispatch(SET_SCANDATA(scannedData));
          await AsyncStorage.setItem(
            "scannedData",
            JSON.stringify(scannedData)
          );
          fetchData();
          setShowModal(true);
          showModal();
        }
      }
    } catch (error) {
      setScanned(false);
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
        setSuccess(responseBody.ResponseMessage);
      }
      return responseBody;
    } catch (error) {
      console.error("Error fetching or parsing data:", error);
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
          Type: category == "RFCode" ? "RFID" : "Khelaiyaid",
        }),
      });

      if (!response.ok) {
        const responseBody = await response.json();
        if (responseBody.ResponseCode == -1) {
          setEmail("");
          setWarning(responseBody.ResponseMessage);
          console.log(warning);
        } else {
          setEmail("");
          setWarning(responseBody.ResponseMessage || "Data not exist");
        }
      } else {
        const scannedData = await response.json();
        dispatch(SET_SCANDATA(scannedData));
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
          // setSuccess(scannedData.ResponseMessage);
        }
      }
      setEmail("");
    } catch (error) {
      console.error("Error:", error.message);
    }
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

  const showModal = () => {
    setShowModal(true);
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 1000,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  };

  const hideModal = () => {
    Animated.timing(modalAnimation, {
      toValue: hp("100%"),
      duration: 1000,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => setShowModal(false));
  };

  const CustomCheckbox = ({ checked }) => (
    <View
      style={[
        styles(colorScheme).checkbox,
        {
          backgroundColor: checked
            ? "#942FFA"
            : colorScheme === "dark"
            ? "#888888"
            : "#D8D8D8",
        },
      ]}
    >
      {checked && <Entypo name="check" size={15} color="#FFF" />}
    </View>
  );

  if (hasPermission === null || hasPermission === false) {
    return (
      <Text
        style={{
          flex: 1,
          backgroundColor: colorScheme === "dark" ? "#000" : "#FFF",
        }}
      >
        Requesting for camera permission
      </Text>
    );
  }

  return (
    <SafeAreaView style={styles(colorScheme).container}>
      <View style={styles(colorScheme).categoriesList}>
        <FlatList
          data={DATA}
          renderItem={renderScanner}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>

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
                  overflow: "hidden",
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

      {category == "Scan" && (
        <View style={{ gap: hp(2) }}>
          <View style={styles(colorScheme).scannerCamera}>
            <Camera
              style={{ flex: 1 }}
              ref={cameraRef}
              onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            />
          </View>
          {scanned && (
            <TouchableOpacity
              style={styles(colorScheme).submitButton}
              onPress={() => setScanned(false)}
            >
              <Text style={styles(colorScheme).submitText}>Scan Again</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {category == "RFCode" && (
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            gap: wp(2),
            marginTop: hp(15),
          }}
        >
          <Image
            source={require("../../images/logo.png")}
            style={styles(colorScheme).modalLogo}
          />
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
            <Text style={styles(colorScheme).submitText}>Send</Text>
          </TouchableOpacity>
        </View>
      )}

      {category == "Manually" && (
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            gap: wp(2),
            marginTop: hp(15),
          }}
        >
          <Image
            source={require("../../images/logo.png")}
            style={styles(colorScheme).modalLogo}
          />
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
            placeholder="Enter KhelaiyaID "
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
            <Text style={styles(colorScheme).submitText}>Send</Text>
          </TouchableOpacity>
        </View>
      )}
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
        <Modal transparent={true} visible={true} animationType="slide">
          <StatusBar
            backgroundColor={colorScheme === "dark" ? "#000000" : "#CCCCCC"}
          />
          <TouchableWithoutFeedback onPress={hideProfileModal}>
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
              <Text style={[styles(colorScheme).subtitle, { fontSize: 25 }]}>
                ID: {profileData.RegistrationId}
              </Text>
              <View style={styles(colorScheme).imageContainer}>
                <Image
                  source={
                    profileData.profilephoto.length == 0
                      ? require("../../images/profile.png")
                      : {
                          uri: profileData.profilephoto,
                        }
                  }
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
                  <Text style={styles(colorScheme).nameText}>
                    {profileData.name}{" "}
                  </Text>
                </View>
              </View>

              <Image
                source={require("../../images/ActoscriptLogo.png")}
                resizeMode="contain"
                style={styles(colorScheme).logoImage}
              />
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
      alignItems: "center",
      gap: hp(20),
    },
    categoriesList: {
      height: hp(5),
      alignItems: "center",
    },
    categoryItem: {
      paddingVertical: hp(1),
      paddingHorizontal: wp(5),
    },
    listTitle: {
      color: colorScheme === "dark" ? "#CCCCCC" : "#000000",
      fontSize: 18,
      fontFamily: "Montserrat-Medium",
    },
    scannerCamera: {
      width: wp(80),
      height: wp(80),
      overflow: "hidden",
      borderRadius: 30,
      justifyContent: "center",
      backgroundColor: "#000",
    },
    submitButton: {
      width: wp("50%"),
      backgroundColor: "#942FFA",
      alignItems: "center",
      alignSelf: "center",
      padding: hp(1),
      borderRadius: 10,
    },
    submitText: {
      color: "#FFFFFF",
      fontFamily: "Montserrat-SemiBold",
      fontSize: 22,
    },
    messageContainer: {
      position: "absolute",
      top: hp(2),
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
    checkbox: {
      height: 25,
      width: 25,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 10,
    },
    modalLogo: {
      position: "absolute",
      opacity: 0.2,
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
    inputContainer: {
      height: hp(7),
      width: wp("90%"),
      backgroundColor: colorScheme === "dark" ? "#444" : "#FFFFFF",
      borderRadius: 30,
      borderWidth: 1,
      paddingHorizontal: wp(5),
      elevation: 7,
      marginBottom: hp(1),
      fontSize: 22,
      color: colorScheme === "dark" ? "#FFF" : "#5A5A5A",
      fontFamily: "Montserrat-SemiBold",
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

    logoImage: {
      height: wp(50),
      width: wp(50),
      position: "absolute",
      bottom: -hp(2),
    },

    modalContents: {
      flex: 1,
      backgroundColor: colorScheme === "dark" ? "#000000" : "#FFFFFF",
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
      fontFamily: "Montserrat-Bold",
      fontSize: 28,
      color: colorScheme === "dark" ? "red" : "red",
      marginBottom: hp(5),
    },
    nameText: {
      fontFamily: "Montserrat-Semibold",
      fontSize: 25,
      color: colorScheme === "dark" ? "#CCCCCC" : "#000000",
      marginBottom: hp(5),
    },
    imageContainer: {
      marginBottom: 20,
      alignItems: "center",
      justifyContent: "center",
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
  });
