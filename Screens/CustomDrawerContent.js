import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Appearance,
} from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { Avatar } from "react-native-elements";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import * as Font from "expo-font";
import { useDispatch, useSelector } from "react-redux";
import { SET_USERDATA } from "../redux/Login/loginSlice";

export default function CustomDrawerContent(props) {
  const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme());
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.loginData.userData);
  const [showSignOutConfirmation, setShowSignOutConfirmation] = useState(false);
 
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


  const handleSignOut = async () => {
    try {
      await AsyncStorage.clear();
      navigation.navigate("Register");
    } catch (error) {
      console.error("Error clearing AsyncStorage:", error);
    }
  };

  const confirmSignOut = () => {
    setShowSignOutConfirmation(true);
  };

  const cancelSignOut = () => {
    setShowSignOutConfirmation(false);
  };

  const handleConfirmSignOut = () => {
    setShowSignOutConfirmation(false);
    handleSignOut();
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userDataJSON = await AsyncStorage.getItem("userData");
        const userData = JSON.parse(userDataJSON);
        const response = await fetch(
          `https://actopassapi.actoscript.com/api/SacnneTicket/Profile/${userData.ScannerLoginId}`,
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: "Bearer " + userData.AuthorizationKey,
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
  },[])
  
  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ backgroundColor: "#8200d6" }}
        style={{backgroundColor: colorScheme === 'dark' ? '#202020' : '#FFFFFF'}}
      >
        <ImageBackground
          source={require("../images/backgroundImage.jpg")}
          style={{ padding: 20 }}
        >
          <TouchableOpacity onPress={() => {  navigation.navigate("Profile");}}>
            <Avatar
              size={80}
              rounded
              containerStyle={{ backgroundColor: "#ffffff" }}
              source={{ uri: userData?.PhotoPath }}
            />
          </TouchableOpacity>
          <Text style={styles(colorScheme).profileText}>
            {userData?.Name}
          </Text>
        </ImageBackground>
        <View style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#202020' : '#FFFFFF', paddingTop: 10 }}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>
      <View
        style={{ padding: 20, borderTopWidth: 1, borderTopColor: "#CCCCCC", backgroundColor: colorScheme === 'dark' ? '#202020' : '#FFFFFF' }}
      >
        <TouchableOpacity
          style={{ paddingVertical: 10 }}
          onPress={confirmSignOut}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 15 }}>
            <Ionicons name="exit-outline" size={25} color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'} />
            <Text style={{ fontSize: 16, fontFamily: "Montserrat-SemiBold", color: colorScheme === 'dark' ? '#FFFFFF' : '#000000', }}>
              Sign out
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      {showSignOutConfirmation && (
        <Modal transparent={true}>
          <View style={{ ...StyleSheet.absoluteFillObject, flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)",}}>
            <View style={{ backgroundColor: "#fff", padding: 20, borderRadius: 10 }}>
              <Text style={{ fontSize: 16, fontWeight: "600", fontFamily: "Montserrat-SemiBold",}}>
                Are you sure you want to sign out?
              </Text>
              <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 20,}}>
                <TouchableOpacity onPress={handleConfirmSignOut}style={{  paddingVertical: 10,  paddingHorizontal: 15,  backgroundColor: "#EEE",  borderRadius: 10,}}>
                  <Text style={{ color: "blue", fontSize: 16, fontWeight: "600", fontFamily: "Montserrat-SemiBold",}}>
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={cancelSignOut} style={{   paddingVertical: 10,   paddingHorizontal: 15,   backgroundColor: "#EEE",   borderRadius: 10, }}>
                  <Text style={{  color: "red",  fontSize: 16,  fontWeight: "600",  fontFamily: "Montserrat-SemiBold",}}>
                    No
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = (colorScheme) => StyleSheet.create ({
  profileText: { 
    color: '#FFFFFF', 
    fontSize: 18, 
    textTransform: "capitalize", 
    marginTop: 10, 
    fontFamily: "Montserrat-SemiBold",
  },
})