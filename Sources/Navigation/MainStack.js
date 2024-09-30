import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import Scanner from "../Screens/Scanner";
import ProfileScreen from "../Screens/ProfileScreen";
import HistoryScreen from "../Screens/HistoryScreen";
import RegisterScreen from "../Screens/RegisterScreen";
import CustomDrawerContent from "../Screens/CustomDrawerContent";
import { Appearance, Image } from "react-native";
import AuthorizedStack from "./AuthorizedStack";
import SingleHistoryScreen from "../Screens/SingleHistoryScreen";
import InvitationScreen from "../Screens/InvitationScreen";
import KhelaiyaHistory from "../Screens/KhelaiyaHistory";

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
      <Stack.Navigator
        initialRouteName="AuthorizedStack"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="AuthorizedStack" component={AuthorizedStack} />
        <Stack.Screen name="Scanner" component={Scanner} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="InvitationScreen" component={InvitationScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="MainStack" component={MainStack} />
      </Stack.Navigator>
    );
  };

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        headerStyle: {
          borderWidth: 0,
          borderColor: "transparent",
          backgroundColor: colorScheme === "dark" ? "#000" : "#fff",
        },
        headerTintColor: colorScheme === "dark" ? "#fff" : "#000",
        headerTitleStyle: {
          color: "transparent",
        },
        headerBackgroundColor: "transparent",
        drawerLabelStyle: {
          marginLeft: -15,
          fontSize: 16,
          fontFamily: "Montserrat-SemiBold",
        },
        drawerActiveBackgroundColor: "#7306e0",
        drawerActiveTintColor: "#fff",
        drawerInactiveTintColor: colorScheme === "dark" ? "#FFFFFF" : "#000000",
      }}
    >
      <Drawer.Screen
        name="Scanner "
        component={Scanner}
        options={{
          drawerIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require("../../images/scan1.png")
                  : colorScheme === "dark"
                  ? require("../../images/scan1.png")
                  : require("../../images/scan.png")
              }
              style={{ height: 25, width: 25 }}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Profile "
        component={ProfileScreen}
        options={{
          drawerIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require("../../images/user1.png")
                  : colorScheme === "dark"
                  ? require("../../images/user1.png")
                  : require("../../images/user.png")
              }
              style={{ height: 25, width: 25 }}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="History "
        component={HistoryScreen}
        options={{
          drawerIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require("../../images/history1.png")
                  : colorScheme === "dark"
                  ? require("../../images/history1.png")
                  : require("../../images/history.png")
              }
              style={{ height: 27, width: 27 }}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="TicketHistory "
        component={SingleHistoryScreen}
        options={{
          drawerIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require("../../images/invoice1.png")
                  : colorScheme === "dark"
                  ? require("../../images/invoice1.png")
                  : require("../../images/invoice.png")
              }
              style={{ height: 25, width: 25 }}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="KhelaiyaHistory"
        component={KhelaiyaHistory}
        options={{
          drawerIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require("../../images/time1.png")
                  : colorScheme === "dark"
                  ? require("../../images/time1.png")
                  : require("../../images/time.png")
              }
              style={{ height: 25, width: 25 }}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="MainStackView"
        component={MainStackView}
        options={{ drawerLabel: () => null }}
      />
    </Drawer.Navigator>
  );
}
