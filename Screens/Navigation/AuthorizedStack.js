import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RegisterScreen from "../RegisterScreen";
import MainStack from "./MainStack";
const Stack = createNativeStackNavigator();

export default function AuthorizedStack() {
  return (
    <Stack.Navigator  initialRouteName="Register"  screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="MainStack" component={MainStack} />
    </Stack.Navigator>
  );
}
