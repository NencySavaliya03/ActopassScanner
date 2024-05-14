import { Appearance, StyleSheet, Text, View, Image, ScrollView, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import * as Font from "expo-font";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useDispatch, useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SET_HISTORYDATA } from "../../redux/Login/loginSlice";

export default function HistoryScreen({ }) {
  const dispatch = useDispatch();
  const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme());
  const historyData = useSelector((state) => state.loginData.historyData);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userDataJSON = await AsyncStorage.getItem("userData");
        const userData = JSON.parse(userDataJSON);

        const response = await fetch(
          `${global.DomainName}/api/SacnneTicket/TicketHistory/${userData.ScannerLoginId}`, {
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

        const historyData = await response.json();
        dispatch(SET_HISTORYDATA(historyData));
        await AsyncStorage.setItem("historyData", JSON.stringify(historyData));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching history data:", error);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles(colorScheme).loadingContainer}>
        <ActivityIndicator size="large" color={colorScheme === "dark" ? "#FFFFFF" : "#000000"} />
      </View>
    );
  }

  return (
    <View style={styles(colorScheme).container}>
      <Text style={styles(colorScheme).titleText}>History</Text>
      <ScrollView>
        {Array.isArray(historyData) && historyData.length > 0 ? (
          historyData.map((item, index) => (
            <View key={index} style={styles(colorScheme).subContainer}>
              <View style={{ overflow: "hidden", borderRadius: 15 }}>
              {item.EventMainImage && item.EventMainImage !== null ? (
                <Image
                  resizeMode="stretch"
                  style={{ height: 150, width: wp("35%") }}
                  source={{ uri: item.EventMainImage }}
                />
              ) : (
                <Image
                  resizeMode="stretch"
                  style={{ height: 150, width: wp("35%") }}
                  source={require('../../images/event-banner.png')}
                />
            )}
              </View>
              <View style={{ gap: 15, width: wp('45%') }}>
                <Text numberOfLines={1} style={[styles(colorScheme).contentText, { fontFamily: 'Montserrat-Bold', fontSize: 20, color: colorScheme === "dark" ? "#FFFFFF" : "#000000", }]}>{item.EventName}</Text>
                <Text style={styles(colorScheme).contentText}>{item.EventDate}  |  {item.EventTime}</Text>
                <Text style={styles(colorScheme).contentText}>{item.EventAddress}</Text>
                <Text numberOfLines={1} style={styles(colorScheme).contentText}>{`${item.SacnneTicketQty} Tickets`}</Text>
              </View>
            </View>
          ))
        ) : (
            <Text style={[styles(colorScheme).titleText, { fontSize: 16, alignSelf: 'center' }]}>No event found !</Text>
          )}
      </ScrollView>
    </View>
  );
}

const styles = (colorScheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      backgroundColor: colorScheme === "dark" ? "#000000" : "#FFFFFF",
      paddingTop: 40,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colorScheme === "dark" ? "#000000" : "#FFFFFF",
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
      backgroundColor: colorScheme === "dark" ? "#464646" : "#EEEEEE",
      padding: 10,
      borderRadius: 20,
    },
    contentText: {
      fontSize: 16,
      fontFamily: "Montserrat-SemiBold",
      color: colorScheme === "dark" ? "#EEEEEE" : "#5A5A5A",
    },
  });
