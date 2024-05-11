import { Appearance, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import * as Font from "expo-font";
import { Image } from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp,} from "react-native-responsive-screen";
import { ScrollView } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { SET_HISTORYDATA } from "../redux/Login/loginSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HistoryScreen() {
  const dispatch = useDispatch();
  const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme());
  const historyData = useSelector((state) => state.loginData.historyData);

  async function loadFonts() {
    await Font.loadAsync({
      "Montserrat-SemiBold": require("../assets/fonts/Montserrat-SemiBold.ttf"),
      "Montserrat-Bold": require("../assets/fonts/Montserrat-Bold.ttf"),
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userDataJSON = await AsyncStorage.getItem("userData");
        const userData = JSON.parse(userDataJSON);
        const response = await fetch(
          `https://actopassapi.actoscript.com/api/SacnneTicket/TicketHistory/${userData.ScannerLoginId}`, {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: "Bearer " + userData.AuthorizationKey,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch history data");
        }
        console.log('historyDatah',historyData);
        const historyData = await response.json();
        // dispatch(SET_HISTORYDATA(historyData[0]))
        await AsyncStorage.setItem("historyData", JSON.stringify(historyData));
      } catch (error) {
        console.error("Error fetching history data:", error);
      }
    };
    fetchData();
  },[]);

  return (
    <View style={styles(colorScheme).Container}>
      <Text style={styles(colorScheme).titleText}>History</Text>
      <ScrollView>
        {Array.isArray(historyData) ? (historyData.map((item, index) => (
          <View key={item} style={styles(colorScheme).subContainer}>
          <View style={{ overflow: "hidden", borderRadius: 10 }}>
            <Image
              resizeMode="stretch"
              style={{ height: 150, width: wp("35%") }}
              source={require("../images/banner.jpg")}
            />
          </View>
          <View style={{ gap: 15,width: wp('50%'), overflow: 'hidden' }}>
            <Text numberOfLines={1} style={[styles(colorScheme).contentText, {fontFamily: 'Montserrat-Bold',fontSize: 20, color: colorScheme === "dark" ? "#FFFFFF" : "#000000",}]}>kailash Kher and kailasa live</Text>
            <Text style={styles(colorScheme).contentText}>8 may,2024 | 8:00 PM</Text>
            <Text style={styles(colorScheme).contentText}>D-Mart surat</Text>
            <Text numberOfLines={1} style={styles(colorScheme).contentText}>GOLD(₹1500) : 1 Tickets</Text>
          </View>
        </View>
        ))
        ) : (
          <Text style={[styles(colorScheme).titleText, {fontSize: 16,alignSelf: 'center'}]}>No event found !</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = (colorScheme) =>
  StyleSheet.create({
    Container: {
      flex: 1,
      justifyContent: "center",
      backgroundColor: colorScheme === "dark" ? "#000000" : "#FFFFFF",
      paddingTop: 40,
    },
    titleText: {
      fontSize: 22,
      color: colorScheme === "dark" ? "#FFFFFF" : "#000000",
      padding: 20,
      fontFamily: 'Montserrat-SemiBold'
    },
    subContainer: {
      flex: 1,
      flexDirection: "row",
      alignSelf: "center",
      alignItems: 'center',
      gap: 20,
      marginBottom: 20,
      width: wp("90%"),
      backgroundColor: colorScheme === "dark" ? "#000000" : "#EEEEEE",
      padding: 10,
      borderRadius: 20,
    },
    contentText: {
      fontSize: 16,
      fontFamily: "Montserrat-SemiBold",
      color: colorScheme === "dark" ? "#FFFFFF" : "#5A5A5A",
    },
  });
