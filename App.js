import React from "react";
import { store } from "./redux/store";
import { Provider } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import AppScreen from "./Sources/Navigation/AppScreen";

export default function App() {

  return (
    <Provider store={store}>
      <NavigationContainer>
        <AppScreen />
      </NavigationContainer>
    </Provider>
  );
}


