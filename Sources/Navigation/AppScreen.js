import React, { useEffect, useState } from 'react';
import MainStack from './MainStack';
import AuthorizedStack from './AuthorizedStack';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AppScreen() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true); 
  const globalDomain = "http://192.168.1.34/ActoPassCoreApi";
  // const globalDomain = "https://actopassapi.actoscript.com";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const Authorized = await AsyncStorage.getItem("userData");
        if (Authorized) { 
          setIsAuthorized(true);
        }
      } catch (error) {
        console.error("Error fetching authorization status:", error);
      } finally {
        setIsLoading(false); 
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return null; 
  }

  return (
    <>
      {isAuthorized ? <MainStack globalDomain={globalDomain} /> : <AuthorizedStack globalDomain={globalDomain} />}
    </>
  );
}
