import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import NetInfo from "@react-native-community/netinfo";

const ConnectivityCheck = () => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    // Check the initial connection state
    NetInfo.fetch().then((state) => {
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <View>
      {isConnected ? (
        <Text>You are online!</Text>
      ) : (
        <Text>You are offline!</Text>
      )}
    </View>
  );
};

export default ConnectivityCheck;
