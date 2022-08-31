import React, { Component } from 'react';
import {
    StyleSheet,
    Text,

    TouchableOpacity,
    Image,
    Alert,
    ScrollView,
    FlatList,
    Button,

} from 'react-native';
import { Icon } from 'react-native-elements';
import { NavigationHelpersContext } from '@react-navigation/native';
import {
    NativeBaseProvider, Box, Center, Container, Heading, VStack, FormControl, Input, HStack,
    IconButton, MaterialCommunityIcons, Link, AspectRatio, Stack, Pressable, Divider, Badge,
    Spinner, View
} from "native-base";
import { useEffect } from 'react';
import { db } from '../Core/FirebaseConfig';
import { doc, collection, onSnapshot } from 'firebase/firestore';
import * as SecureStore from 'expo-secure-store'
import { baseUrl } from '../baseUrl'
export default class Contacts extends Component {

    constructor(props) {
        super(props);
        this.state = {
            users: [],
            usersForFilter: [],
            isLoaded: false,
            isOpen: false,
            inProcess: false,
            user: {},

        };

        SecureStore.getItemAsync('user').then(async (user) => {
            await this.setState({ user: JSON.parse(user) })
            await onSnapshot(doc(db, `users/${this.state.user.id}`), async (data) => {
                if (await data.data().role !== 'admin') {
                    console.log("alo")
                    await SecureStore.deleteItemAsync('user').then(() => {
                        alert("Quyền hạn không hợp lệ vui lòng đăng nhập lại")
                        this.props.navigation.reset({ index: 0, routes: [{ name: 'Login' }] })
                    })
                }
            })
        })

        this.subscriber = onSnapshot(collection(db, "users"), async (data) => {

            let user = [];
            data.docs.forEach((doc) => {

                user.push({ ...doc.data(), id: doc.id });
            })

            this.setState({
                users: user,
                usersForFilter: user,
                isLoaded: true
            })

        })

    }
    filterEmployeeByName(name) {

        let item = this.state.usersForFilter;

        let itemFilter = item.filter((item) => {

            return item.fullName.toLowerCase().includes(name.toLowerCase())
        })
        if (itemFilter.length > 0) {
            this.setState({
                users: this.state.usersForFilter
            })
        }
        this.setState({
            users: itemFilter
        })

    }
    async confirmDeleteEmployee(id) {

        await Alert.alert("Xóa người dùng", "Bạn có chắc chắn muốn xóa người dùng này không?", [{ text: "Không", onPress: () => console.log("Không"), style: "cancel" }, {
            text: "Có", onPress: () => this.deleteEmployee(id)
        }])

    }
    async deleteEmployee(id) {
        this.setState({ inProcess: true })
        await fetch(`${baseUrl}deleteUser?id=${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: id,
            })
        }).then(async (data) => {
            if (await !data.ok) {
                throw new Error("Không thể xóa người dùng");
            } else {
                alert("Đã xóa người dùng")
                this.setState({ inProcess: false })
            }
        }).catch((err) => {
            alert(err)
            this.setState({ inProcess: false })
        })
    }

    renderItem = ({ item }) => {
        const navigate = this.props.navigation;

        return (
            <TouchableOpacity onPress={() => { navigate.navigate('UpdateUser', { uid: item.id }) }}>

                <View style={styles.row}>

                    <Image source={{ uri: item.pictureURL }} style={styles.pic} />
                    <View>
                        <View style={styles.nameContainer}>
                            <Text style={styles.nameTxt} numberOfLines={1} ellipsizeMode="tail">{item.fullName}</Text>
                            <View style={styles.mblTxt}>
                                <Button onPress={() => this.confirmDeleteEmployee(item.id)} title='Xoá'></Button>
                            </View>
                        </View>
                        <View style={styles.msgContainer}>
                            <Text style={styles.msgTxt}>{item.role}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
    Loading(text) {
        return <HStack mt={'2'} space={2} justifyContent="center">
            <Spinner accessibilityLabel="Loading posts" color="#bd6604" />
            <Heading color="#bd6604" fontSize="md">
                {text.text}
            </Heading>
        </HStack>;
    };

    render() {

        return (
            <>
                <View h={'10%'}>

                    <VStack mt={'3'} w="100%" flex={'1'} space={5} alignItems={'center'} >
                        <Input onChangeText={(text) => {
                            this.filterEmployeeByName(text)
                        }} placeholder="Tìm kiếm nhân viên" width="90%" backgroundColor={'white'} borderRadius="4" py="3" px="1" fontSize="14" InputLeftElement={<Icon name='search' size={36} color='#FFC6D6' />} />
                    </VStack>
                </View>
                <View>
                    {!this.state.isLoaded ? <this.Loading text={'Đang tải danh sách nhân viên'}></this.Loading>

                        : <FlatList
                            extraData={this.state}
                            data={this.state.users}
                            keyExtractor={(user) => {
                                return user.id;
                            }}
                            renderItem={this.renderItem} />
                    }
                </View>
            </>

        );
    }
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#DCDCDC',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        padding: 10,
    },
    pic: {
        borderRadius: 30,
        width: 60,
        height: 60,
    },
    nameContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 280,
    },
    nameTxt: {
        marginLeft: 15,
        fontWeight: '600',
        color: '#222',
        fontSize: 18,
        width: 170,
    },
    mblTxt: {
        fontWeight: '200',
        color: '#777',
        fontSize: 13,
    },
    msgContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    msgTxt: {
        fontWeight: '400',
        color: '#008B8B',
        fontSize: 12,
        marginLeft: 15,
    },
});