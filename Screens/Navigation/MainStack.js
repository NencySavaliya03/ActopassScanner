import React, { useEffect, useState } from 'react'
import CustomDrawerContent from '../CustomDrawerContent';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Scanner from '../Scanner';
import HomeScreen from '../HomeScreen';
import Success from '../Success';
import ProfileScreen from '../ProfileScreen';
import HistoryScreen from '../HistoryScreen';
import RegisterScreen from '../RegisterScreen'
import { AntDesign } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { Octicons } from '@expo/vector-icons';
import { Appearance } from 'react-native';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

export default function MainStack() {
  const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme());

  useEffect(() => {
    const handleChange = (preferences) => {
      setColorScheme(preferences.colorScheme);
    };
    const subscription = Appearance.addChangeListener(handleChange);
    return () => {
      subscription.remove();
    };
  }, []);


    const MainStack = () => {
        return (
          <Stack.Navigator initialRouteName="Scanner" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Scanner" component={Scanner} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Success" component={Success} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="History" component={HistoryScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </Stack.Navigator>
        );
      };

    return (
      <Drawer.Navigator 
        drawerContent={props => <CustomDrawerContent {...props} />}
        screenOptions={{ 
          headerShown: false, 
          drawerLabelStyle: { marginLeft: -15, fontSize: 16, fontFamily: 'Montserrat-SemiBold' }, 
          drawerActiveBackgroundColor: '#942FFA', 
          drawerActiveTintColor: '#fff',
          drawerInactiveTintColor: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
        }}
      >
        <Drawer.Screen name="Home" component={MainStack} 
          options={{
            drawerIcon: ({ color }) => (
              <AntDesign name='home' size={25} color={color} />
            )
          }}
        />
        <Drawer.Screen name="Scanner" component={Scanner}
          options={{
            drawerIcon: ({ color }) => (
              <Ionicons name='scan' size={25} color={color} />
            )
          }}
        />
         <Drawer.Screen name="Profile" component={ProfileScreen}
          options={{
            drawerIcon: ({ color }) => (
              <AntDesign name='user' size={25} color={color} />
            )
          }}
        />
         <Drawer.Screen name="History" component={HistoryScreen}
          options={{
            drawerIcon: ({ color }) => (
              <Octicons name='history' size={25} color={color} />
            )
          }}
        />
      </Drawer.Navigator>
    );
}
