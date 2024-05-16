import React, { useEffect, useState } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Scanner from "../Screens/Scanner"
import ProfileScreen from "../Screens/ProfileScreen"
import HistoryScreen from "../Screens/HistoryScreen"
import RegisterScreen from "../Screens/RegisterScreen"
import CustomDrawerContent from "../Screens/CustomDrawerContent"
import { AntDesign } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { Octicons } from '@expo/vector-icons';
import { Appearance } from 'react-native';
import AuthorizedStack from './AuthorizedStack';
import SingleHistoryScreen from '../Screens/SingleHistoryScreen';

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


    const MainStackView = () => {
        return (
          <Stack.Navigator initialRouteName="AuthorizedStack" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="AuthorizedStack" component={AuthorizedStack} />
            <Stack.Screen name="Scanner" component={Scanner} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="History" component={HistoryScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="MainStack" component={MainStack} />
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
         <Drawer.Screen name="TicketHistory" component={SingleHistoryScreen}
          options={{
            drawerIcon: ({ color }) => (
              <Octicons name='history' size={25} color={color} />
            )
          }}
        />
        <Drawer.Screen name="MainStackView" component={MainStackView} options={{ drawerLabel: () => null }}  />
      </Drawer.Navigator>
    );
}
