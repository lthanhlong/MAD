import React, { Component, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity, TextInput, Button
} from 'react-native';

import { Icon } from 'react-native-elements';
import {
    NativeBaseProvider, Box, Center, Container, Heading, VStack, FormControl, Input, HStack,
    IconButton, MaterialCommunityIcons, Link, ScrollView, AspectRatio, Stack, Pressable, Divider, Badge, FlatList,
    Spinner
} from "native-base";
import RNPickerSelect from 'react-native-picker-select';
import { db } from '../Core/FirebaseConfig';
import { doc, collection, onSnapshot } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { baseUrl } from '../baseUrl';
import * as SecureStore from 'expo-secure-store'
export default class UpdateUserComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            imageUrl: baseUrl + 'images/logo.png',
            user: {},
            isLoaded: false,
            email: '',
            fullName: '',
            password: '',
            role: '',
            currentUser: {},
            inProcess: false,


        }
        onSnapshot(doc(db, `users/${this.props.route.params.uid}`), (data) => {
            this.setState({
                user: { ...data.data(), id: data.id },
                isLoaded: true
            })

        })
        SecureStore.getItemAsync('user').then((user) => {
            this.setState({ currentUser: JSON.parse(user), isloaded: true })

        })
    }

    async checkInput() {
        if (this.state.email.trim() == "") {
            this.setState({ email: this.state.user.email });
        }
        if (this.state.fullName.trim() == "") {
            this.setState({ fullName: this.state.user.fullName });
        }
        if (this.state.password.trim() == "") {
            this.setState({ password: this.state.user.password });
        }
        if (this.state.role.trim() == "") {
            this.setState({ role: this.state.user.role });
        }
    }
    async updateUser(navigator) {
        this.setState({ inProcess: true });
        await this.checkInput();
        await fetch(`${baseUrl}updateUserAdmin`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                adminId: this.state.currentUser.id,
                userId: this.state.user.id,
                email: this.state.email,
                fullName: this.state.fullName,
                password: this.state.password,
                role: this.state.role,
            })
        }).then(async (data) => {
            if (await !data.ok) {
                this.setState({ inProcess: false });
                throw new Error("Cập nhật thông tin không thành công");
            } else {
                navigator.navigate('ManageEmployee')
                this.setState({ inProcess: false });

                alert("Thông tin đã được cập nhật ")


            }
        }).catch((err) => {
            this.setState({ inProcess: false });
            alert(err)
        })

    }
    Dropdown = () => {
        const [role, setRole] = useState(this.state.user.role)
        return (
            <RNPickerSelect
                value={role}
                onValueChange={(value) => setRole(value)}
                items={[
                    { label: 'Admin ', value: 'admin' },
                    { label: 'User', value: 'user' },
                ]}
                onClose={() => {
                    this.setState({ role: role })
                }}
            />
        )
    }


    render() {
        const navigator = this.props.navigation;
        return (this.state.isLoaded ? <View style={styles.container}>
            <Image style={styles.avatar} source={{ uri: this.state.user.pictureURL }} />
            <Button title='Thay đổi ảnh đại diện' />
            <View style={styles.body}>
                <View style={styles.bodyContent}>
                    <View style={styles.inputContainer}>
                        <TextInput style={styles.inputs}
                            placeholder="Email"
                            keyboardType="email-address"
                            underlineColorAndroid='transparent'
                            defaultValue={this.state.user.email}
                            onChangeText={(email) => this.setState({ email: email.trim() })} />
                    </View>
                    <View style={styles.inputContainer}>
                        <TextInput style={styles.inputs}
                            placeholder="Họ và tên"
                            underlineColorAndroid='transparent'
                            defaultValue={this.state.user.fullName}
                            onChangeText={(fullName) => this.setState({ fullName: fullName })} />
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput style={styles.inputs}
                            placeholder="Mật khẩu"
                            underlineColorAndroid='transparent'
                            secureTextEntry={true}
                            defaultValue={this.state.user.password}
                            onChangeText={(password) => this.setState({ password: password })} />
                    </View>

                    <View style={{ width: '80%', borderRadius: '20%', borderWidth: '2s' }}>


                    </View>


                    <View style={styles.DropinputContainer}>
                        <Image style={styles.DropinputIcon} source={{ uri: 'https://img.icons8.com/nolan/40/000000/email.png' }} />
                        <this.Dropdown style={styles.Dropinputs} ></this.Dropdown>

                    </View>

                    <TouchableOpacity style={[styles.buttonContainer, styles.applyButton]}>
                        <Button title={'Cập nhật'} onPress={() => {
                            this.updateUser(navigator);
                        }}></Button>
                    </TouchableOpacity>

                </View>
            </View>
        </View>
            : <Spinner></Spinner>)
    }
    async getImageFromCamera() {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status === 'granted') {
            const capturedImage = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3] });
            if (!capturedImage.cancelled) {
                this.setState({ imageUrl: capturedImage.uri });
            }
        }
    }
}


const styles = StyleSheet.create({

    avatar: {
        width: 130,
        height: 130,
        borderRadius: 63,
        borderWidth: 4,
        borderColor: "white",
        marginBottom: 10,
        alignSelf: 'center',
        position: 'absolute',
        marginTop: 50
    },
    name: {
        fontSize: 22,
        color: "#000000",
        fontWeight: '600',
    },
    body: {
        marginTop: 150,
    },
    bodyContent: {

        alignItems: 'center',
        padding: 30,
    },
    role: {
        fontSize: 16,
        color: "#00BFFF",
        marginTop: 5,
        marginBottom: 30
    },
    description: {
        fontSize: 16,
        color: "#696969",
        marginTop: 10,
        textAlign: 'center'
    },
    buttonContainer: {
        height: 45,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
        width: 200,
        borderRadius: 30,
        backgroundColor: 'transparent'
    },
    applyButton: {
        // backgroundColor: "#bd6604",

        shadowColor: "#808080",
        shadowOffset: {
            width: 0,
            height: 9,
        },
        shadowOpacity: 0.50,
        shadowRadius: 12.35,

        elevation: 19,
    },
    buttonText: {
        color: 'white',
    },
    inputContainer: {
        borderBottomColor: '#F5FCFF',
        backgroundColor: '#FFFFFF',
        borderRadius: 30,
        borderBottomWidth: 1,
        width: 300,
        height: 45,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',

        shadowColor: "#808080",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,

        elevation: 5,
    },
    inputs: {
        height: 45,
        marginLeft: 16,
        // borderBottomColor: '#FFFFFF',
        flex: 1,
    },
    inputIcon: {
        width: 30,
        height: 30,
        marginRight: 15,
        justifyContent: 'center'
    },
    DropinputContainer: {
        backgroundColor: '#FFFFFF',
        // borderRadius: 30,
        width: 100,
        height: 45,
        marginBottom: 10,
        flexDirection: 'column',

        shadowColor: "#808080",

        shadowOpacity: 0.25,
        shadowRadius: 3.84,

        elevation: 5,
    },
    Dropinputs: {
        height: 45,
        marginLeft: 16,
        // borderBottomColor: '#FFFFFF',
        flex: 1,
    },
    DropinputIcon: {
        width: 30,
        height: 30,
        marginRight: 15,
        justifyContent: 'center'
    },
});

