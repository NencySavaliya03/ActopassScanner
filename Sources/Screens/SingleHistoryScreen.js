import { Appearance, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Animated } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { Image } from 'react-native';
import { useDispatch, useSelector } from "react-redux";
import { SET_SINGLE_HISTORYDATA } from '../../redux/Login/loginSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ShimmerLoader from '../Screens/Skeleton';

export default function SingleHistoryScreen() {
  const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme());
  const [showTicket, setShowTicket] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const s_historyData = useSelector((state) => state.loginData.s_historyData);
  const [inputID, setInputID] = useState('');

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

  const handleInputID = async () => {
    setIsLoading(true);
    try {
      const userDataJSON = await AsyncStorage.getItem("userData");
      const userData = JSON.parse(userDataJSON);
      const response = await fetch(
        `${global.DomainName}/api/BookTicketList/BookTicketid/${inputID}`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + userData.AuthorizationKey,
          },
        }
      );
      if (!response.ok) {
        console.log('response', response);
        throw new Error("Failed to fetch History data");
      }
      const HistoryData = await response.json();
      dispatch(SET_SINGLE_HISTORYDATA(HistoryData[0]));
      setShowTicket(true);
    } catch (error) {
      console.error("Error fetching history data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderTicket = () => (
    <ScrollView style={{ backgroundColor: colorScheme === "dark" ? "#464646" : "#EEEEEE", borderRadius: 20 }} showsVerticalScrollIndicator={false}>
      <View style={styles(colorScheme).ticketdataView}>
        <View style={styles(colorScheme).ticketBanner}>
          <Image resizeMode='stretch' style={{ width: '100%', height: 120 }} source={require('../../images/event-banner.png')} />
        </View>
        <View style={{ width: '55%', gap: 10 }}>
          <Text style={[styles(colorScheme).ticketData, { fontSize: 24, color: colorScheme === "dark" ? "#FFFFFF" : "#000000" }]} numberOfLines={1}>{s_historyData.EventName}</Text>
          <Text style={styles(colorScheme).ticketData}>{s_historyData.EventDate} || {s_historyData.EventTime}</Text>
          <Text style={styles(colorScheme).ticketData}>{s_historyData.AddressLandMark}  ,{s_historyData.CityName}</Text>
          <Text style={styles(colorScheme).ticketData}>{s_historyData.MobileNo}</Text>
        </View>
      </View>
      
      <View style={{ borderWidth: 1, borderColor: '#E2E2E2', marginVertical: 20 }} />
      
      {s_historyData.SubDetails.map((detail, index) => (
        <View key={detail.BookTicketDeatilsid}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10 }}>
            <View style={{ gap: 15 }}>
              <Text style={styles(colorScheme).ticketData}>{`${detail.BookingTicketQty} Ticket(s)`}</Text>
              <Text style={[styles(colorScheme).ticketData, { fontSize: 30, color: colorScheme === "dark" ? "#FFFFFF" : "#000000" }]}>{detail.TicketType}</Text>
              <Text style={styles(colorScheme).ticketData}>{`Available Ticket-Qty :   ${detail.AvailableTicketQty - detail.SacnneTicketQty}`}</Text>
            </View>
            <View style={{ backgroundColor: colorScheme === "dark" ? "#888888" : "#E2E2E2", padding: 20, borderRadius: 10, justifyContent: 'center' }}>
              <Text style={[styles(colorScheme).ticketData, { fontSize: 16, color: detail.Expired === "Yes" ? 'red' : 'green' }]}>{detail.Expired === "Yes" ? "Expired" : "Active"}</Text>
            </View>
          </View>
          
          <View style={styles(colorScheme).scannedTicketQty}>
            <Text style={[styles(colorScheme).ticketData, { color: colorScheme === "dark" ? "#FFFFFF" : "#464646", fontSize: 16, width: '100%' }]}>Already Scanned Ticket :   </Text>
            <Text style={[styles(colorScheme).ticketData, { color: colorScheme === "dark" ? "#FFFFFF" : "#464646" }]}>{detail.SacnneTicketQty}</Text>
          </View>

          {detail.SplitList && detail.SplitList.length > 0 && (
            <View style={{ padding: 20, gap: 40 }}>
              <View style={{ width: '100%' }}>
                <Text style={styles(colorScheme).ticketData}>Shared Tickets :</Text>
              </View>
              <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 25 }}>
                  {detail.SplitList.map((person, index) => (
                    <View key={index} style={{ alignItems: 'center' }}>
                      <View style={{ width: 50, overflow: 'hidden', borderRadius: 50 }}>
                        <Image style={{ height: 50, width: 50 }} source={{ uri: person.UserImage }} />
                      </View>
                      <View style={{ width: '100%' }}>
                        <Text style={[styles(colorScheme).ticketData, { fontSize: 12, width: '100%' }]}>{person.MobileNo}</Text>
                        <Text style={[styles(colorScheme).ticketData, { fontSize: 12, width: '100%' }]}> ({person.BookingTicketQty} Tickets)</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {s_historyData.SubDetails.length === index + 1 ? null :
            <View style={{ flexDirection: 'row', alignSelf: 'center', marginVertical: 30, height: 0, alignItems: 'center' }}>
              <View style={{ height: 20, width: 20, backgroundColor: colorScheme === "dark" ? "#000000" : "#FFFFFF", borderRadius: 50, zIndex: 1, }} />
              <View style={{ borderWidth: 1, borderColor: colorScheme === "dark" ? "#000000" : "#5A5A5A", borderStyle: 'dashed', width: '85%', marginHorizontal: 15 }} />
              <View style={{ height: 20, width: 20, backgroundColor: colorScheme === "dark" ? "#000000" : "#FFFFFF", borderRadius: 50, zIndex: 1, }} />
            </View>
          }
          
        </View>
      ))}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles(colorScheme).container}>
      <View style={styles(colorScheme).subContainer}>
        <TextInput
          placeholder='Ticket ID'
          placeholderTextColor={colorScheme === "dark" ? "#888" : "#CCC"}
          style={[styles(colorScheme).textInput, { fontSize: 16 }]}
          value={inputID}
          onChangeText={value => setInputID(value)}
          keyboardType='numeric'
        />
        <TouchableOpacity onPress={handleInputID} style={{ backgroundColor: colorScheme === "dark" ? "#464646" : "#EEEEEE", padding: 10, borderRadius: 50 }}>
          <Image style={{ height: 30, width: 30 }} source={require('../../images/send.png')} />
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        {isLoading ? (
          <View>
            <ShimmerLoader style={{ width: '100%', height: 200, borderRadius: 10, marginBottom: 5 }} />
            <ShimmerLoader style={{ width: '100%', height: 100, borderRadius: 10, marginBottom: 5 }} />
            <ShimmerLoader style={{ width: '100%', height: 100, borderRadius: 10, marginBottom: 5 }} />
          </View>
        ) : (
          showTicket && renderTicket()
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = (colorScheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorScheme === "dark" ? "#000000" : "#FFFFFF",
    padding: 20,
    gap: 30
  },
  subContainer: {
    paddingTop: 50,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  textInput: {
    width: '80%',
    height: 50,
    borderRadius: 50,
    fontFamily: 'Montserrat-SemiBold',
    backgroundColor: colorScheme === "dark" ? "#464646" : "#EEEEEE",
    color: colorScheme === "dark" ? "#FFFFFF" : "#000000",
    paddingHorizontal: 20,
    fontSize: 14,
  },
  ticketdataView: {
    padding: 20,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  ticketBanner: {
    width: '40%',
    backgroundColor: colorScheme === "dark" ? "#888888" : "#E2E2E2",
    overflow: 'hidden',
    borderRadius: 10
  },
  ticketData: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    color: colorScheme === "dark" ? "#888888" : "#464646",
  },
  scannedTicketQty: {
    backgroundColor: colorScheme === "dark" ? "#888888" : "#E2E2E2",
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginTop: 10
  }
});
