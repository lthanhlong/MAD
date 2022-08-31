import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity, TextInput, Button
} from 'react-native';
import {
    NativeBaseProvider, Box, Center, Container, Heading, VStack, FormControl, Input, HStack,
    IconButton, Icon, MaterialCommunityIcons, Link, ScrollView, AspectRatio, Stack, Pressable, Divider, Badge, Spacer, Flex, Spinner
} from "native-base";
import * as SecureStore from 'expo-secure-store'
import * as ImagePicker from 'expo-image-picker';
import { doc, collection, onSnapshot, where, getDoc } from 'firebase/firestore';
import { db } from '../Core/FirebaseConfig';
import { baseUrl } from '../baseUrl';

class UserProfileComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            imageUrl: "",
            user: {},
            isloaded: false,
            changedInfo: false,
            email: '',
            oldpassword: '',
            password: '',
            confirmPassword: '',
            fullName: '',
            inProcess: false,
            changedPassword: false,
        }
        SecureStore.getItemAsync('user').then((user) => {
            this.setState({ user: JSON.parse(user), isloaded: true })
            console.log(user)
        })

    }

    async reloadUserInfo() {
        if (this.state.email.trim() === "") {

            return;
        }

        await fetch(`${baseUrl}login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: this.state.email.trim(),
                password: this.state.user.data.password,
            })
        }).then(async (data) => {
            if (await !data.ok) {
                throw new Error("Đăng nhập thất bại");
            } else {

                await getDoc(doc(db, 'users', await data.text())).then(async (doc) => {
                    //save to securestore
                    await SecureStore.deleteItemAsync('user')

                })
            }
        }).catch((err) => {
            console.log(err)
        })

    }
    async setInfo() {
        if (this.state.email.trim() == '') {
            await this.setState({ email: this.state.user.data.email })
        }
        else {

        }
        if (this.state.fullName == '') {
            await this.setState({ fullName: this.state.user.data.fullName })
        }
        else {

        }


        return true
    }


    async changeUserPassword(navigator) {

        this.setState({ inProcess: true });

        if (this.state.confirmPassword === this.state.password) {
            await fetch(`${baseUrl}updateUserPassword`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: this.state.user.id,
                    oldpassword: this.state.oldpassword,
                    newpassword: this.state.password,
                })
            }).then(async (data) => {
                if (await !data.ok) {
                    this.setState({ inProcess: false, changedPassword: false });
                    throw new Error("Cập nhật mật khẩu không thành công");
                } else {

                    this.setState({ inProcess: false, changedPassword: false });
                    await SecureStore.deleteItemAsync('user')
                    navigator.reset({ index: 0, routes: [{ name: 'Login' }] });
                    alert("Mật khẩu  đã được cập nhật vui lòng đăng nhập lại")


                }
            }).catch((err) => {
                this.setState({ changedPassword: false, inProcess: false });
                alert(err)
            })


        }
        else {
            alert("Vui lòng nhập đầy đủ thông tin")
            this.setState({ inProcess: false });
            return;
        }


    }
    async changeUserInfo(navigator) {
        this.setState({ inProcess: true });

        if (await this.setInfo()) {

            await fetch(`${baseUrl}updateUser`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: this.state.user.id,
                    email: this.state.email,
                    fullName: this.state.fullName,
                })
            }).then(async (data) => {
                if (await !data.ok) {
                    this.setState({ changedInfo: false, inProcess: false });
                    throw new Error("Cập nhật thông tin không thành công");
                } else {
                    await this.reloadUserInfo().then(() => {
                        this.setState({ changedInfo: false, inProcess: false });
                        navigator.reset({ index: 0, routes: [{ name: 'Login' }] });
                        alert("Thông tin đã được cập nhật vui lòng đăng nhập lại")
                    });

                }
            }).catch((err) => {
                this.setState({ changedInfo: false, inProcess: false });
                alert(err)
            })


        }
        else {
            alert("Vui lòng nhập đầy đủ thông tin")
            this.setState({ inProcess: false });
            return;
        }
    }
    Loading() {
        return <HStack space={8} justifyContent="center">
            <Spinner color="#bd6604" />

        </HStack>;
    };
    render() {
        const navigator = this.props.navigation;
        return (
            this.state.isloaded ? <View style={styles.container}>


                <Image style={styles.avatar} source={{ uri: this.state.user.data.pictureURL }} />
                <Button title='Camera' onPress={() => this.getImageFromCamera()} />

                <View style={styles.body}>
                    <View style={styles.bodyContent}>
                        <Text style={styles.name}>{this.state.user.data.fullName}</Text>
                        <Text style={styles.role}>{this.state.user.data.role}</Text>

                        {!this.state.changedPassword ?
                            <>
                                <View style={styles.inputContainer}>
                                    <TextInput style={styles.inputs}
                                        editable={this.state.changedInfo}
                                        selectTextOnFocus={this.state.changedInfo}
                                        placeholder="Email"
                                        keyboardType="email-address"
                                        underlineColorAndroid='transparent'
                                        defaultValue={this.state.user.data.email}
                                        onChangeText={(email) => this.setState({ email: email })} />
                                    <Image style={styles.inputIcon} source={{ uri: 'https://img.icons8.com/nolan/40/000000/email.png' }} />
                                </View>
                                <View style={styles.inputContainer}>
                                    <TextInput style={styles.inputs}
                                        editable={this.state.changedInfo}
                                        selectTextOnFocus={this.state.changedInfo}
                                        placeholder="Họ tên"
                                        keyboardType="email-address"
                                        underlineColorAndroid='transparent'
                                        defaultValue={this.state.user.data.fullName}
                                        onChangeText={(fullName) => this.setState({ fullName: fullName })} />
                                    <Image style={styles.inputIcon} source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1828/1828439.png' }} />
                                </View>
                                {this.state.changed ? <TouchableOpacity style={[styles.buttonContainer, styles.applyButton]} >
                                    <Button disabled={this.state.inProcess} title={'Áp dụng'} style={styles.buttonText} onPress={() => this.changeUserInfo(navigator)}></Button>
                                </TouchableOpacity>
                                    : null}
                            </>
                            :
                            <>
                                <View style={styles.inputContainer}>
                                    <TextInput style={styles.inputs}
                                        placeholder="Mật khẩu cũ"
                                        secureTextEntry={true}
                                        underlineColorAndroid='transparent'
                                        onChangeText={(password) => this.setState({ oldpassword: password })} />
                                    <Image style={styles.inputIcon} source={{ uri: '' }} />
                                </View>
                                <View style={styles.inputContainer}>
                                    <TextInput style={styles.inputs}
                                        placeholder="Mật khẩu mới"
                                        secureTextEntry={true}
                                        underlineColorAndroid='transparent'
                                        onChangeText={(password) => this.setState({ password: password })} />
                                    <Image style={styles.inputIcon} source={{ uri: 'https://cdn4.iconfinder.com/data/icons/glyphs/24/icons_password-512.png' }} />
                                </View>
                                <View style={styles.inputContainer}>
                                    <TextInput style={styles.inputs}
                                        placeholder="Xác nhận mật khẩu mới"
                                        secureTextEntry={true}
                                        underlineColorAndroid='transparent'
                                        onChangeText={(password) => this.setState({ confirmPassword: password })} />
                                    <Image style={styles.inputIcon} source={{ uri: 'https://cdn-icons-png.flaticon.com/512/100/100470.png' }} />
                                </View>
                                {this.state.changed ? <TouchableOpacity style={[styles.buttonContainer, styles.applyButton]} >
                                    <Button disabled={this.state.inProcess} title={'Áp dụng'} style={styles.buttonText} onPress={() => this.changeUserPassword(navigator)}></Button>
                                </TouchableOpacity>
                                    : null}
                            </>
                        }


                        {!this.state.changedInfo && this.state.changedPassword == false ?
                            <Button title='Thay đổi thông tin' onPress={() => this.setState({ changedInfo: true, changed: true })} />
                            : null
                        }

                        {!this.state.changedPassword && this.state.changedInfo == false ? <Button title='Thay đổi mật khẩu' onPress={() => this.setState({ changedPassword: true, changed: true })} /> : null}

                    </View>
                </View>
            </View> : <View style={styles.container}>
                <Text>Loading...</Text>
            </View>



        );
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
        width: 300,
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
        borderBottomColor: '#FFFFFF',
        flex: 1,
    },
    inputIcon: {
        width: 30,
        height: 30,
        marginRight: 15,
        justifyContent: 'center'
    },
});

export default UserProfileComponent