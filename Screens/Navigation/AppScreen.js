import React, { useEffect, useState } from 'react';
import MainStack from './MainStack';
import AuthorizedStack from './AuthorizedStack';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AppScreen() {
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const Authorized = await AsyncStorage.getItem("userData");
        console.log(typeof Authorized, Authorized);
        if (Authorized) {
          setIsAuthorized(true);
        }
      } catch (error) {
        console.error("Error fetching authorization status:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      {isAuthorized ? <MainStack /> : <AuthorizedStack />}
    </>
  );
}
