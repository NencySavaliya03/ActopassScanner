import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Appearance,
  Image,
  StatusBar,
} from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { Avatar } from "react-native-elements";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SET_USERDATA } from "../../redux/Login/loginSlice";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import * as Font from "expo-font";

export default function CustomDrawerContent(props) {
  const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme());
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.loginData.userData);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Load fonts
  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        "Montserrat-SemiBold": require("../../assets/fonts/Montserrat-SemiBold.ttf"),
        "Montserrat-Bold": require("../../assets/fonts/Montserrat-Bold.ttf"),
        "Montserrat-Medium": require("../../assets/fonts/Montserrat-Medium.ttf"),
      });
    };
    loadFonts();
  }, []);

  // Fetch user profile data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userDataJSON = await AsyncStorage.getItem("userData");
        const parsedUserData = JSON.parse(userDataJSON);

        if (!parsedUserData) {
          console.warn("No user data found in AsyncStorage");
          return;
        }

        const response = await fetch(
          `${global.DomainName}/api/SacnneTicket/Profile/${parsedUserData.ScannerLoginId}`,
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: "Bearer " + parsedUserData.AuthorizationKey,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch profile data");
        }
        
        const profileData = await response.json();
        dispatch(SET_USERDATA(profileData[0]));
        await AsyncStorage.setItem("profileData", JSON.stringify(profileData));
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchData();
  }, [dispatch]);

  const handleSignOut = async () => {
    try {
      await AsyncStorage.clear();
      dispatch(SET_USERDATA(null)); 
      
    } catch (error) {
      console.error("Error clearing AsyncStorage:", error);
    }
  };

  const confirmSignOut = () => {
    setShowLogoutModal(true);
  };

  const cancelSignOut = () => {
    setShowLogoutModal(false);
  };

  const handleConfirmSignOut = () => {
    setShowLogoutModal(false);
    handleSignOut();
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colorScheme === "dark" ? "#202020" : "#FFFFFF",
      }}
    >
      <StatusBar hidden={true} />
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ backgroundColor: "#7306e0" }}
      >
        <View style={{ padding: 20, backgroundColor: "#7306e0" }}>
          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            <Avatar
              size={80}
              rounded
              containerStyle={{
                backgroundColor: colorScheme === "dark" ? "#202020" : "#FFFFFF",
              }}
              source={{ uri: userData?.PhotoPath || 'default-avatar-url' }} // Fallback to a default avatar URL
            />
          </TouchableOpacity>
          <Text style={{ color: "#FFFFFF", fontSize: 18, fontFamily: "Montserrat-SemiBold", marginTop: 10 }}>
            {userData ? userData.Name : "Guest"} {/* Display guest name if userData is null */}
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: colorScheme === "dark" ? "#202020" : "#FFFFFF",
            paddingTop: 10,
          }}
        >
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      <View
        style={{
          padding: 20,
          borderTopWidth: 1,
          borderTopColor: "#CCCCCC",
          backgroundColor: colorScheme === "dark" ? "#202020" : "#FFFFFF",
        }}
      >
        <TouchableOpacity
          style={{ paddingVertical: 10 }}
          onPress={confirmSignOut}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 15 }}>
            <Image
              source={
                colorScheme === "dark"
                  ? require("../../images/exit1.png")
                  : require("../../images/exit.png")
              }
              style={{ width: 25, height: 25 }}
            />
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Montserrat-SemiBold",
                color: colorScheme === "dark" ? "#FFFFFF" : "#000000",
                width: wp(30),
              }}
            >
              Sign out
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {showLogoutModal && (
        <Modal transparent={true}>
          <View style={styles(colorScheme).modalContainer}>
            <View style={styles(colorScheme).modalContent}>
              <Text style={styles(colorScheme).modalTitle}>Log Out?</Text>
              <Text style={styles(colorScheme).modalMessage}>
                Are you sure you want to log out?
              </Text>
              <View style={styles(colorScheme).buttonContainer}>
                <TouchableOpacity
                  style={styles(colorScheme).confirmButton}
                  onPress={handleConfirmSignOut}
                >
                  <Text style={styles(colorScheme).confirmText}>Log Out</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles(colorScheme).cancelButton}
                  onPress={cancelSignOut}
                >
                  <Text style={styles(colorScheme).cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = (colorScheme) =>
  StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor:
        colorScheme === "dark"
          ? "rgba(255, 255, 255, 0.2)"
          : "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
      width: 300,
      backgroundColor: colorScheme === "dark" ? "#000" : "#FFF",
      borderRadius: 8,
      padding: 20,
      alignItems: "center",
    },
    modalTitle: {
      fontSize: 18,
      fontFamily: "Montserrat-SemiBold",
      marginBottom: 10,
      color: colorScheme === "dark" ? "#FFF" : "#000",
    },
    modalMessage: {
      fontSize: 14,
      fontFamily: "Montserrat-SemiBold",
      color: colorScheme === "dark" ? "#ccc" : "#666",
      marginBottom: 20,
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
    },
    confirmButton: {
      backgroundColor: "#7306e0",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      width: "48%",
    },
    cancelButton: {
      backgroundColor: "#ccc",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      width: "48%",
    },
    confirmText: {
      color: "#fff",
      textAlign: "center",
      fontWeight: "600",
    },
    cancelText: {
      color: "#000",
      textAlign: "center",
      fontWeight: "600",
    },
  });
