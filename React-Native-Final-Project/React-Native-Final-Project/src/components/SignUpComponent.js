
import React, { Component } from 'react';
import { Text, TextInput, View, } from 'react-native';
import {
    NativeBaseProvider, Box, Center, Container, Heading, VStack, FormControl, Input, HStack,
    IconButton, Icon, MaterialCommunityIcons, Button, Link
} from "native-base";
import { baseUrl } from '../baseUrl';

export default class SignUp extends Component {
    constructor(props) {
        super(props)
        this.state = {
            fullName: '',
            email: '',
            password: '',
            confirmPassword: '',
            inProcess:false,
        }
    }
    async signup() {
        this.setState({ inProcess: true })
        if (this.state.password === this.state.confirmPassword) {
            await fetch(`${baseUrl}createUser`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: this.state.email.trim(),
                    fullName: this.state.fullName,
                    password: this.state.password.trim(),
                })
            }).then(async (data) => {
                if (await !data.ok) {
                    throw new Error("Tạo tài khoản thất bại");

                } else {
                    alert("Tạo tài khoản thành công");
                    this.props.navigation.navigate('Login');
                }
            }).catch((err) => {
                alert(err)
                this.setState({ inProcess: false });
            })

        }
        else {
            alert("Password không trùng khớp")
        }
    }
    render() {
        return <Center w="100%">
            <Box safeArea p="2" w="90%" maxW="290" py="8">
                <Heading size="lg" color="coolGray.800" _dark={{
                    color: "warmGray.50"
                }} fontWeight="semibold" textAlign={'center'}>
                    SHOPPING APP
                </Heading>
                <Heading mt="1" color="coolGray.600" _dark={{
                    color: "warmGray.200"
                }} fontWeight="medium" size="xs" textAlign={'center'}>
                   Tạo tài khoản
                </Heading >
                <VStack space={3} mt="5">
                    <FormControl>
                        <FormControl.Label >Họ và tên</FormControl.Label>
                        <Input isDisabled={this.state.inProcess} onChangeText={(changed) => { this.setState({ fullName: changed }) }} />
                    </FormControl>
                    <FormControl>
                        <FormControl.Label >Tài khoản</FormControl.Label>
                        <Input isDisabled={this.state.inProcess} onChangeText={(changed) => { this.setState({ email: changed }) }} />
                    </FormControl>
                    <FormControl>
                        <FormControl.Label>Mật khẩu</FormControl.Label>
                        <Input type="password" isDisabled={this.state.inProcess} onChangeText={(changed) => { this.setState({ password: changed }) }} />
                    </FormControl>
                    <FormControl>
                        <FormControl.Label>Xác nhận mật khẩu</FormControl.Label>
                        <Input type="password" isDisabled={this.state.inProcess} onChangeText={(changed) => { this.setState({ confirmPassword: changed }) }} />
                    </FormControl>
                    <Button mt="2" isDisabled={this.state.inProcess} backgroundColor={'#bd6604'} onPress={() => this.signup()} >
                        Tạo tài khoản
                    </Button>
                </VStack>
            </Box>
        </Center>
    }

};