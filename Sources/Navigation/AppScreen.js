import React, { useEffect, useState } from "react";
import MainStack from "./MainStack";
import AuthorizedStack from "./AuthorizedStack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo"; 
import { Text, View } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useDispatch, useSelector } from "react-redux";
import { SET_USERDATA } from "../../redux/Login/loginSlice";

export default function AppScreen() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  global.DomainName = "https://actopassapidev.actoscript.com";
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.loginData.userData);
  
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });
    NetInfo.fetch().then((state) => {
      setIsConnected(state.isConnected);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authorizedJSON = await AsyncStorage.getItem("userData");
        const authorized = authorizedJSON ? JSON.parse(authorizedJSON) : null;
        dispatch(SET_USERDATA(authorized));
        setIsAuthorized(!!authorized); 
      } catch (error) {
        console.error("Error fetching authorization status:", error);
      } finally {
        setIsLoading(false); 
      }
    };
  
    fetchData();
  }, [dispatch]);
  
  if (isLoading) {
    return null;
  }

  if (!isConnected) {
    return (
      <View>
        <Text
          style={{
            color: "#000000",
            fontSize: 20,
            fontFamily: "Montserrat-SemiBold",
            textAlign: "center",
            paddingHorizontal: wp(10),
            marginTop: hp(40),
          }}
        >
          Connect to the Internet
        </Text>
        <Text
          style={{
            color: "grey",
            fontSize: 14,
            fontFamily: "Montserrat-Medium",
            textAlign: "center",
          }}
        >
          You're offline. Check your connection.
        </Text>
      </View>
    ); 
  }

  return <>{userData ? <MainStack /> : <AuthorizedStack />}</>;
}
