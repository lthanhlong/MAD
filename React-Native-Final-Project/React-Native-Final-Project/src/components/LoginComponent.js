
import React, { Component } from 'react';

import {
    Box, Heading, VStack, FormControl, Input, HStack,
    IconButton, Icon, MaterialCommunityIcons, Button, Link, Text, View, Center
} from "native-base";
import render from 'react-dom';
import * as SecureStore from 'expo-secure-store'
import { baseUrl } from '../baseUrl';
import { db } from '../Core/FirebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignUp from './SignUpComponent';
export default class LoginComponent extends Component {
    componentDidMount() {
        //get data from securestore
        SecureStore.getItemAsync('user').then((user) => {
            if (user) {
                alert("Đã đăng nhập");
                this.props.navigation.navigate('Home');
            }
        })
    }
    login() {
        this.props.login(this.state.email, this.state.password);
    }
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            remember: false,
            inProcess: false,
        }

    }

    render() {
        const navigate = this.props.navigation.navigate;

        return (
            <Center w="100%">
                <Box safeArea p="2" py="8" w="90%" maxW="290">
                    <Heading size="lg" fontWeight="600" color="coolGray.800" _dark={{
                        color: "warmGray.50"
                    }} textAlign={'center'}>
                        FASHION SHOP
                    </Heading>
                    <Heading mt="1" _dark={{
                        color: "warmGray.200"
                    }} color="coolGray.600" fontWeight="medium" size="xs" textAlign={'center'}>
                        Hỏng có tài khoản là khỏi dùng nha bé ơiii 
                    </Heading>

                    <VStack space={3} mt="5">
                        <FormControl>
                            <FormControl.Label>Tài khoản</FormControl.Label>
                            <Input value={this.state.email} isDisabled={this.state.inProcess} onChangeText={(email) => {
                                this.setState({ email })
                            }} />
                        </FormControl>
                        <FormControl>
                            <FormControl.Label>Mật khẩu</FormControl.Label>
                            <Input type="password" isDisabled={this.state.inProcess}  value={this.state.password} onChangeText={(password) => {
                                this.setState({ password })
                            }} />

                        </FormControl>
                        <Button mt="2" isDisabled={this.state.inProcess} backgroundColor={'#bd6604'} onPress={async () => {
                            await this.handleLogin();
                        }}>
                            Đăng nhập
                        </Button>
                        <HStack mt="6" justifyContent="center">
                            <Text fontSize="sm" color="coolGray.600" _dark={{
                                color: "warmGray.200"
                            }}>
                                Chưa có tài khoản ? Tạo tài khoản tại đây.{" "}
                            </Text>
                            <Link _text={{
                                color: "indigo.500",
                                fontWeight: "medium",
                                fontSize: "sm",
                                
                            }} onPress={() => {
                                navigate('SignUp')
                            }}>
                                Đăng ký
                            </Link>
                        </HStack>
                    </VStack>
                </Box>
            </Center>

        )

    }
    async handleLogin() {
        this.setState({ inProcess: true });
        if (this.state.email.trim() === "" || this.state.password.trim() === "") {
            alert("Vui lòng nhập đầy đủ thông tin");
            this.setState({ inProcess: false });
            return;
        }

        await fetch(`${baseUrl}login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: this.state.email.trim(),
                password: this.state.password.trim(),
            })
        }).then(async (data) => {
            if (await !data.ok) {
                throw new Error("Đăng nhập thất bại");
            } else {

                getDoc(doc(db, 'users', await data.text())).then((doc) => {
                    //save to securestore
                    SecureStore.setItemAsync('user', JSON.stringify({ id: doc.id, data: doc.data() })).then(() => {
                        this.props.navigation.navigate('Home');
                    })
                })
            }
        }).catch((err) => {
            alert(err)
            this.setState({ inProcess: false });
        })

    }

}
