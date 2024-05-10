import React from "react";
import { store } from "./redux/store";
import AppScreen from "./Screens/Navigation/AppScreen";
import { Provider } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <AppScreen />
      </NavigationContainer>
    </Provider>
  );
}
