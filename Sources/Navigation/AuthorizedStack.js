import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainStack from "./MainStack";
import RegisterScreen from "../Screens/RegisterScreen";
const Stack = createNativeStackNavigator();

export default function AuthorizedStack() {
  return (
    <Stack.Navigator initialRouteName="Register">
      <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false}} />
      <Stack.Screen name="MainStack" component={MainStack} options={{ headerShown: false}} />
    </Stack.Navigator>

  );
}
