import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, Appearance, Pressable, ScrollView } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from 'expo-font';

export default function HomeScreen({ navigation }) {
  const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme());
  const [persons, setPersons] = useState([]);
  const [totalScannerTicketQty, setTotalScannerTicketQty] = useState(0);
  const [scannedTicket, setScannedTicket] = useState(0); 

  async function loadFonts() {
    await Font.loadAsync({
      'Montserrat-SemiBold': require('../assets/fonts/Montserrat-SemiBold.ttf'),
      'Montserrat-Medium': require('../assets/fonts/Montserrat-Medium.ttf')
    });
  }
  
  useEffect(() => {
    loadFonts();
  }, []);

  useEffect(() => {
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
    fetchData();
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
        const response = await fetch(`https://actopassapi.actoscript.com/api/SacnneTicket/confirm-ticket`, {
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
            throw new Error(`Failed to fetch data`);
        }
        const responseBody = await response.json();
        let messageType = responseBody.ResponseMessage;
        if (responseBody.ResponseType === "error") {
          navigation.navigate('error', { messageType });
        } else if (responseBody.ResponseType === "warning") {
          navigation.navigate('warning', { messageType });
        } else {
          navigation.navigate('Success', { messageType });
        }
        return responseBody;
    } catch (error) {
        console.error('Error fetching or parsing data:', error);
    }
};

   
  const CustomCheckbox = ({ checked }) => (
    <View style={{ backgroundColor: checked ? '#942FFA' : colorScheme === 'dark' ? '#888888' : '#D8D8D8', height: 25, width: 25, justifyContent: 'center', alignItems: 'center', borderRadius: 10, }}>
      {checked && <Entypo name="check" size={15} color="#FFF" />}
    </View>
  );

  return (
    <SafeAreaView style={styles(colorScheme).container}>
      <Text style={styles(colorScheme).title}>GOLD</Text>

      <ScrollView style={styles(colorScheme).subContainer} showsVerticalScrollIndicator={false}>
        <View style={styles(colorScheme).sub_Content}>
          {persons.map((person, index) => (
            <Pressable key={index} style={styles(colorScheme).row} onPress={() => handleCheckboxChange(index)}>
              <Text style={styles(colorScheme).text}>Person  {index + 1}</Text>
              <CustomCheckbox checked={person.checked} />
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={[
          styles(colorScheme).ProceedButton, 
          totalScannerTicketQty < 1 && { opacity: 0.5, backgroundColor: colorScheme === 'dark' ? '#EEEEEE' : '#333333', }
        ]} 
        onPress={() => {totalScannerTicketQty >= 1 && handleProceedData()}}
        disabled={totalScannerTicketQty < 1}
      >
        <Text style={styles(colorScheme).ProceedText}>Proceed</Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
}

const styles = (colorScheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorScheme === 'dark' ? '#000000' : '#FFFFFF',
  },
  title: {
    paddingTop: 80,
    paddingBottom: 30,
    color: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
    textAlign: 'center',
    fontSize: 30,
    fontFamily: 'Montserrat-SemiBold'
  },
  subContainer: {
    backgroundColor: colorScheme === 'dark' ? '#464646' : '#EEEEEE',
    borderRadius: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#9938fa',
    padding: 10,
    margin: 20,
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
    color: colorScheme === 'dark' ? '#cccccc' : '#000000',
    fontSize: 18,
    fontFamily: 'Montserrat-Medium',
    letterSpacing: .5,
    textTransform: 'uppercase',
  },
  ProceedButton: {
    marginBottom: 10,
    width: '90%',
    paddingVertical: 15,
    marginTop: 50,
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
    letterSpacing: 1
  }
});
