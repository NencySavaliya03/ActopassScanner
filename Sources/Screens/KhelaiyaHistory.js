import {
  Appearance,
  FlatList,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Font from "expo-font";
import ShimmerLoader from "./Skeleton";
import { useFocusEffect } from "@react-navigation/native";

export default function KhelaiyaHistory() {
  const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme());
  const [historyData, setHistoryData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

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

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          const userDataJSON = await AsyncStorage.getItem("userData");
          const userData = JSON.parse(userDataJSON);

          const response = await fetch(
            `${global.DomainName}/api/SacnneTicket/TicketHistory?ScannerLoginId=${userData.ScannerLoginId}`,
            {
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: "Bearer " + userData.AuthorizationKey,
              },
            }
          );
          const data = await response.json();

          if (
            data.length === 0 ||
            (data.length === 1 && data[0].RegistrationId === 0)
          ) {
            setHistoryData([]);
          } else {
            setHistoryData(data);
          }
          setLoading(false);
          console.log(data);
        } catch (error) {
          setLoading(false);
          console.error("Error fetching history data:", error);
        }
      };
      fetchData();
    }, [])
  );

  const filteredData = historyData.filter((item) =>
    item.RegistrationId.toString().includes(searchQuery)
  );

  const renderHistoryItem = () => {
    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        {filteredData.length === 0 ? (
          <Text style={styles(colorScheme).noDataText}>No data found</Text>
        ) : (
          <FlatList
            data={filteredData.reverse()}
            keyExtractor={(item) => item.RegistrationId.toString()}
            renderItem={({ item }) => (
              <View style={styles(colorScheme).historyContainer}>
                <View style={styles(colorScheme).historyItem}>
                  <View>
                    <Text
                      style={[
                        styles(colorScheme).historyText,
                        {
                          marginBottom: hp(1),
                          fontSize: 16,
                          fontFamily: "Montserrat-Bold",
                        },
                      ]}
                    >
                      {item.KhelaiyaGroupName} - {item.KhelaiyaGroupType}
                    </Text>
                    <Text style={styles(colorScheme).historyText}>
                      ID: {item.RegistrationId}
                    </Text>
                    <Text style={styles(colorScheme).historyText}>
                      Name: {item.Name}
                    </Text>
                    <Text style={styles(colorScheme).historyText}>
                      {item.Mobile}
                    </Text>
                    <Text style={styles(colorScheme).historyText}>
                      {item.Email}
                    </Text>
                  </View>
                  <View>
                    <Image
                      source={
                        item.ProfileImage.length == 0
                          ? require("../../images/profile.png")
                          : {
                              uri: item.ProfileImage,
                            }
                      }
                      style={{
                        height: wp("30%"),
                        width: wp("30%"),
                        borderRadius: 10,
                        resizeMode: "contain",
                      }}
                    />
                  </View>
                </View>
              </View>
            )}
          />
        )}
      </ScrollView>
    );
  };

  return (
    <View style={styles(colorScheme).container}>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colorScheme === "dark" ? "#000" : "#fff"}
      />
      <View style={styles(colorScheme).inputContainer}>
        <View style={styles(colorScheme).passwordContent}>
          <StatusBar />
          <Image
            style={{
              height: hp("2%"),
              width: hp("2%"),
              tintColor: colorScheme === "dark" ? "#FFF" : "#000",
            }}
            source={require("../../images/search.png")}
          />
          <TextInput
            style={styles(colorScheme).userInput}
            placeholder="Enter Id "
            placeholderTextColor={"#5A5A5A"}
            returnKeyType="done"
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
          />
        </View>
      </View>
      {loading ? (
        <View style={{ alignItems: "center" }}>
          <ShimmerLoader
            style={{
              width: "95%",
              height: 160,
              borderRadius: 20,
              marginBottom: 10,
            }}
          />
          <ShimmerLoader
            style={{
              width: "95%",
              height: 160,
              borderRadius: 20,
              marginBottom: 10,
            }}
          />
        </View>
      ) : (
        renderHistoryItem()
      )}
    </View>
  );
}

const styles = (colorScheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme === "dark" ? "#000" : "#FFF",
      padding: wp(2),
      // alignItems: "center",
      gap: hp(3),
    },
    inputContainer: {
      height: hp("5%"),
      flexDirection: "row",
      alignItems: "center",
      borderRadius: wp("5"),
      borderWidth: 1,
      borderColor: "#d2d2d2",
      paddingHorizontal: wp(3),
    },
    passwordContent: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: wp(2),
    },
    userInput: {
      flex: 1,
      fontSize: 14,
      color: colorScheme === "dark" ? "#FFF" : "#000",
      fontFamily: "Montserrat-Medium",
    },
    historyContainer: {
      // backgroundColor: "#EEEEEE",
      borderWidth: 1,
      width: wp("95%"),
      borderRadius: wp(2),
      padding: wp(1),
      borderLeftWidth: 3,
      borderLeftColor: "#942FFA",
      borderRightColor: "#d2d2d2",
      borderTopColor: "#d2d2d2",
      borderBottomColor: "#d2d2d2",

      marginBottom: hp(2),
    },
    historyItem: {
      padding: wp(2),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    historyText: {
      fontSize: 13,
      width: wp(55),
      fontFamily: "Montserrat-SemiBold",
      color: colorScheme === "dark" ? "#FFF" : "#000",
    },
    noDataText: {
      fontSize: 16,
      fontFamily: "Montserrat-Bold",
      color: colorScheme === "dark" ? "#FFF" : "#000",
      textAlign: "center",
      marginTop: hp(3),
    },
  });
