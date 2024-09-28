import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Appearance,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { AntDesign } from "@expo/vector-icons";

const InvitationScreen = () => {
  const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme());
  const [historyData, setHistoryData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  async function loadFonts() {
    await Font.loadAsync({
      "Montserrat-SemiBold": require("../../assets/fonts/Montserrat-SemiBold.ttf"),
      "Montserrat-Bold": require("../../assets/fonts/Montserrat-Bold.ttf"),
      "Montserrat-Medium": require("../../assets/fonts/Montserrat-Medium.ttf"),
    });
  }

  useEffect(() => {
    loadFonts();
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

  return (
    <View style={styles(colorScheme).container}>
      <TouchableOpacity
        hitSlop={40}
        style={{ position: "absolute", top: 0, right: wp(5) }}
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
            uri: "https://cdn.mepass.in/images/seller/34447_1725201027.jpeg",
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
        <Text style={styles(colorScheme).title}>Gold khelaiya - Gold</Text>
        <View style={{ alignItems: "center", gap: hp(0.5) }}>
          <Text style={styles(colorScheme).subtitle}>
            Kapadiya margi hiteshbhai{" "}
          </Text>
          <Text style={[styles(colorScheme).subtitle, { fontSize: 14 }]}>
            RegistrationId: 85
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = (colorScheme) =>
  StyleSheet.create({
    container: {
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
  });

export default InvitationScreen;
