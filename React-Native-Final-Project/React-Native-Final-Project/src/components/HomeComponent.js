import React, { Component, useEffect, useState, useRef } from 'react';

import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { Icon, Image } from "react-native-elements"
import { StyleSheet, View } from 'react-native';
import { NativeBaseProvider } from "native-base";
import ProductComponent from './ProductComponent';
import BookmarkComponent from './BookmarkComponent';
import CartComponent from './CartComponent';
import ProductDetailComponent from './ProductDetailComponent';
import UserProfileComponent from './UserProfileComponent.js';
import ManagementEComponent from '../components/ManagementEComponent.js'
import ManagementPComponent from '../components/ManagementPComponent.js'
import AddProductComponent from './AddProductComponent';
import ProductDetailAdmin from './admin/ProductDetailAdmin.js';
import * as SecureStore from 'expo-secure-store'
import App from '../../App';
import { NavigationHelpersContext } from '@react-navigation/native';

import DashBroadComponent from './DashBroadComponent';
import {
    Box, Center, Container, Heading, VStack, FormControl, Input, HStack,
    IconButton, MaterialCommunityIcons, Button, Link, ScrollView, AspectRatio, Stack, Text, Divider, Modal, Avatar, Spacer, Badge, Fab

} from "native-base";
import UpdateUserComponent from './UpdateUserComponent';

function logout(navigator) {

    SecureStore.deleteItemAsync('user').then(() => {
        console.log('Logout success');
        navigator.navigator.reset({index:0, routes: [{name: 'Login'}]});
    }).catch(err => {
        console.log(err);
    }).done();
}

function CustomDrawerContent(props) {
    const MainNavigator = createDrawerNavigator();
    const [user, setUser] = useState("")

    useEffect(() => {
        SecureStore.getItemAsync('user').then(async (userInfo) => {
            if (userInfo) {
                if (user == "") {
                    setUser(JSON.parse(userInfo))
                }


            }

        })


    })
    return (
        <DrawerContentScrollView {...props}>

            <View style={{ backgroundColor: '#bd6604', height: 100, alignItems: 'center', flexDirection: 'row' }}>
                <View style={{ flex: 1 }}>
                    <HStack>
                        <Image source={user.data ? { uri: user.data.pictureURL } : { uri: "none" }} style={{ margin: 10, width: 50, height: 50 }} />
                        <VStack>
                            <Text style={{ color: '#ffffff', fontSize: 22, fontWeight: 'bold', paddingTop: 20 }}>{user.data ? user.data.fullName : "UserName"}</Text>
                            <Text style={{ color: '#ffffff', fontSize: 12, }}>{user.data ? user.data.email : "Email"}</Text>
                        </VStack>

                        <Spacer />
                    </HStack>
                </View>

            </View>
            <DrawerItemList {...props} />
            <Divider my="2" />

            <DrawerItem label='Đăng xuất'
                activeBackgroundColor='#bd6604'
                inactiveBackgroundColor='#FFFFFF'
                icon={({ focused, color, size }) => <Icon name='exit-to-app' size={size} color={focused ? '#bd6604' : '#bd6604'} />}
                onPress={() => logout(props.navigator)} />
        </DrawerContentScrollView>
    );
}

function MainNavigatorScreen(navigator) {
    const MainNavigator = createDrawerNavigator();
    const [isAdmin, setRole] = useState(false);
    const [user, setUser] = useState("")
    useEffect(() => {
        SecureStore.getItemAsync('user').then(async (userInfo) => {
            if (userInfo) {
                if (user == "") {

                    setUser(JSON.parse(userInfo))
                } else {
                    if (user.data.role == "admin") {
                        setRole(true)
                    }
                }


            }

        })
    })
    return (
        <MainNavigator.Navigator initialRouteName='Product' drawerContent={props => <CustomDrawerContent {...props} navigator={navigator} />}>
            <MainNavigator.Screen name='UserProfile' component={UserProfileNavigatorScreen} options={{ title: 'Thông tin cá nhân', headerShown: false, drawerIcon: ({ focused, size }) => (<Icon name='account-circle' size={size} color={focused ? '#7cc' : '#bd6604'} />) }} />
            <MainNavigator.Screen name='Product' component={ProductNavigatorScreen} options={{ title: 'Sản phẩm', headerShown: false, drawerIcon: ({ focused, size }) => (<Icon name='inventory' size={size} color={focused ? '#7cc' : '#bd6604'} />) }} />
            <MainNavigator.Screen name='Bookmark' component={BookmarkNavigatorScreen} options={{ title: 'Sản phẩm yêu thích', headerShown: false, drawerIcon: ({ focused, size }) => (<Icon name='bookmark' size={size} color={focused ? '#7cc' : '#bd6604'} />) }} />
            <MainNavigator.Screen name='Cart' component={CartNagivatorScreen} options={{ title: 'Giỏ hàng', headerShown: false, drawerIcon: ({ focused, size }) => (<Icon name='shopping-cart' type="material" size={size} color={focused ? '#7cc' : '#bd6604'} />) }} />
            {isAdmin ?
                <MainNavigator.Screen name='DashBroad' component={DashBroadNavigatorScreen} options={{ title: 'Quản lý', headerShown: false, drawerIcon: ({ focused, size }) => (<Icon name='settings' size={size} color={focused ? '#7cc' : '#bd6604'} />) }} />
                : null}

        </MainNavigator.Navigator>
    );
}

function CartNagivatorScreen() {
    const CartNavigator = createStackNavigator();
    return (
        <CartNavigator.Navigator
            initialRouteName='Cart'
            screenOptions={{
                headerTitle: "Giỏ hàng",
                headerStyle: { backgroundColor: '#bd6604' },
                headerTintColor: '#fff',
                headerTitleStyle: { color: '#fff' }
            }}>
            <CartNavigator.Screen name='Cart' component={CartComponent}
                options={({ navigation }) => ({
                    headerLeft: () => (<Icon name='menu' size={36} color='#fff' onPress={() => navigation.toggleDrawer()} />)
                })} />
        </CartNavigator.Navigator>
    );
}

function BookmarkNavigatorScreen() {
    const BookmarkNavigator = createStackNavigator();
    return (
        <BookmarkNavigator.Navigator
            initialRouteName='Bookmark'
            screenOptions={{
                headerStyle: { backgroundColor: '#bd6604' },
                headerTintColor: '#fff',
                headerTitleStyle: { color: '#fff' },
                headerTitleAlign: 'center'
            }}>
            <BookmarkNavigator.Screen name='Bookmark' component={BookmarkComponent}
                options={({ navigation }) => ({
                    headerTitle: 'Sản phẩm yêu thích',
                    headerLeft: () => (<Icon name='menu' size={36} color='#fff' onPress={() => navigation.toggleDrawer()} />)
                })} />
            <BookmarkNavigator.Screen name='productDetail' component={ProductDetailComponent} options={{ headerTitle: 'Chi tiết sản phẩm' }} />
        </BookmarkNavigator.Navigator>
    );
}


function ProductNavigatorScreen() {
    const ProductNavigator = createStackNavigator();
    return (
        <ProductNavigator.Navigator
            initialRouteName='Product'
            screenOptions={{
                headerStyle: { backgroundColor: '#bd6604' },
                headerTintColor: '#fff',
                headerTitleStyle: { color: '#fff' },
                headerTitleAlign: 'center'
            }}>
            <ProductNavigator.Screen name='Product' component={ProductComponent}
                options={({ navigation }) => ({
                    headerTitle: 'Sản phẩm',
                    headerLeft: () => (<Icon name='menu' size={36} color='#fff' onPress={() => navigation.toggleDrawer()} />)
                })} />
            <ProductNavigator.Screen name='productDetail' component={ProductDetailComponent} options={{ headerTitle: 'Chi tiết sản phẩm' }} />
        </ProductNavigator.Navigator>
    );
}
function UserProfileNavigatorScreen() {
    const UserProfileNavigator = createStackNavigator();
    return (
        <>

            <UserProfileNavigator.Navigator
                initialRouteName='UserProfile'
                screenOptions={{
                    headerStyle: { backgroundColor: '#bd6604' },
                    headerTintColor: '#fff',
                    headerTitleStyle: { color: '#fff' }
                }}>
                <UserProfileNavigator.Screen name='UserProfile' component={UserProfileComponent}
                    options={({ navigation }) => ({
                        headerTitle: 'Thông tin cá nhân',
                        headerLeft: () => (<Icon name='menu' size={36} color='#fff' onPress={() => navigation.toggleDrawer()} />),
                    })} />
            </UserProfileNavigator.Navigator>
        </>

    );
}
function DashBroadNavigatorScreen() {
    const DashBroadNavigator = createStackNavigator();
    return (
        <DashBroadNavigator.Navigator
            initialRouteName='DashBroad'
            screenOptions={{
                headerStyle: { backgroundColor: '#bd6604' },
                headerTintColor: '#fff',
                headerTitleStyle: { color: '#fff' }
            }}>
            <DashBroadNavigator.Screen name='DashBroad' component={DashBroadComponent}
                options={({ navigation }) => ({
                    headerTitle: 'DashBroad',
                    headerLeft: () => (<Icon name='menu' size={36} color='#fff' onPress={() => navigation.toggleDrawer()} />)
                })} />
            <DashBroadNavigator.Screen name='ManageEmployee' component={ManagementEComponent} options={{ headerTitle: 'Quản lý người dùng' }} />
            <DashBroadNavigator.Screen name='ManageProduct' component={ManagementPComponent} options={{ headerTitle: 'Quản lý sản phẩm', headerRight: () => (<Icon name='add' size={30} color='#fff' />) }} />
            <DashBroadNavigator.Screen name='UpdateUser' component={UpdateUserComponent} options={{ headerTitle: 'Cập nhật người dùng' }} />
            <DashBroadNavigator.Screen name='ProductDetailAdmin' component={ProductDetailAdmin} options={{ headerTitle: 'Chỉnh sửa sản phẩm' }} />
            <DashBroadNavigator.Screen name='AddProduct' component={AddProductComponent} options={{ headerTitle: 'Thêm sản phẩm' }} />

        </DashBroadNavigator.Navigator>
    );
}
class HomeComponent extends Component {
    constructor(props) {
        super(props);

    }

    render() {
        const navigator = this.props.navigation;

        return (
            <MainNavigatorScreen navigator={navigator} ></MainNavigatorScreen>
        )



    }
}
export default HomeComponent