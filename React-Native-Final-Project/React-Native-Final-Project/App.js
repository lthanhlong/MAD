
import { Button, StyleSheet, View, ScrollView, Text } from 'react-native';
import { NativeBaseProvider, Stack } from "native-base";
import React, { Component } from "react";
import { Icon, Image } from "react-native-elements"
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import ProductComponent from './src/components/ProductComponent';
import HomeComponent from './src/components/HomeComponent';
import LoginComponent from './src/components/LoginComponent';
import DashBroadComponent from './src/components/DashBroadComponent';
import ProductDetailComponent from './src/components/ProductDetailComponent';
import ManagementEComponent from './src/components/ManagementEComponent.js';
import ManagementPComponent from './src/components/ManagementPComponent.js';

import SignUp from './src/components/SignUpComponent';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native';

if (Platform.OS === 'android') {
  require('intl');
  require('intl/locale-data/jsonp/fr-BE');
  require('intl/locale-data/jsonp/nl-BE');
  require('intl/locale-data/jsonp/it-IT');
}

export class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null
    }

  }
  componentDidMount() {
    SecureStore.getItemAsync('user').then((user) => {
      if (user) {
        this.setState({ user: JSON.parse(user), isLoading: true });
        this.props.navigation.navigate('Product');
      }
    })
  }

  render() {
    const Stack = createNativeStackNavigator();

    return (

      <NavigationContainer>
        <NativeBaseProvider>
          <SafeAreaProvider>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <><Stack.Screen name="Login" component={LoginComponent} />
                <Stack.Screen name="SignUp" component={SignUp} />
                <Stack.Screen name="Home" component={HomeComponent} />
                <Stack.Screen name="DashBroad" component={DashBroadComponent} />
                <Stack.Screen name="ManagementE" component={ManagementEComponent} />
                <Stack.Screen name="ManagementP" component={ManagementPComponent} />
              </>
            </Stack.Navigator>

          </SafeAreaProvider>
        </NativeBaseProvider>
      </NavigationContainer>


    );
  }
}

export default App;