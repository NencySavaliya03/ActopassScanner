import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, Appearance, Pressable, ScrollView, ImageBackground } from 'react-native';
import { Entypo } from '@expo/vector-icons';

export default function HomeScreen({route, navigation}) {
  const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme());
  const [isChecked, setIsChecked] = useState({
    person1: false,
    person2: false,
    person3: false,
    person4: false,
    person5: false,
    person6: false,
    person7: false,
    person8: false,
    person9: false,
    person10: false,
    person11: false,
    person12: false,
    person13: false,
    person14: false,
    person16: false,
    person17: false,
    person18: false,
    person19: false,
    person20: false,
    person21: false,
    person22: false,
    person23: false,
    person24: false,
    person25: false,
  });

  const handleCheckboxChange = (clickedIndex) => {
    setIsChecked(prevState => {
      const checkboxState = { ...prevState };
      const keys = Object.keys(checkboxState);
      let index = keys.indexOf(clickedIndex);
      if (checkboxState[clickedIndex] === false) { 
        for (let i = 0; i <= index; i++) {
          checkboxState[keys[i]] = true;
        }
      } else if (checkboxState[clickedIndex] === true) {
        for (let i = 0; i <= index; i++) {
          checkboxState[keys[i]] = false;
        }
      }
      return checkboxState;
    });
  };

  useEffect(() => {
    const handleChange = (preferences) => {
      setColorScheme(preferences.colorScheme);
    };
    const subscription = Appearance.addChangeListener(handleChange);
    return () => {
      subscription.remove();
    };
  }, []);

  const CustomCheckbox = ({ checked }) => (
    <View style={{ backgroundColor: checked ? '#942FFA' : colorScheme === 'dark' ? '#888888' : '#D8D8D8',height: 25,width: 25, justifyContent: 'center',alignItems: 'center',borderRadius: 10, }}>
      {checked && <Entypo name="check" size={15} color="#FFF" />}
    </View>
  );

  return (
    <SafeAreaView style={styles(colorScheme).container}>
        <Text style={styles(colorScheme).title}>GOLD</Text>
        
        <ScrollView style={{flex: 1}}>
          <View style={styles(colorScheme).subContainer}>
            {Object.keys(isChecked).map(person => (
              <Pressable key={person} style={styles(colorScheme).row} onPress={() => handleCheckboxChange(person)}>
                <Text style={styles(colorScheme).text}>Person {person.substring(6)}</Text>
                <CustomCheckbox checked={isChecked[person]} />
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <TouchableOpacity style={styles(colorScheme).submitButton} onPress={() => {navigation.navigate('Success',  { messageType: 'success' })}}>
          <Text style={styles(colorScheme).submitText}>Submit</Text>
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
    color: '#FFFFFF', 
    textAlign: 'center',
    fontSize: 30,
    fontWeight: '800',
  },
  subContainer: {
    backgroundColor: colorScheme === 'dark' ? '#464646' : '#EEEEEE', 
    borderRadius: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#9938fa',
    padding: 5,
    margin: 15,
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
    fontWeight: '600',
    letterSpacing: .5,
    textTransform: 'uppercase',
  },
  checkedComponent: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#942FFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    marginBottom: 10,
    width: '95%',
    paddingVertical: 15,
    marginTop: 50,
    borderRadius: 10,
    backgroundColor: '#942FFA',
    justifyContent: 'flex-end',
    alignSelf: 'center',
    alignItems: 'center',
  },
  submitText: {
    color: '#FFFFFF', 
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1
  }
});
