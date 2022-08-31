
import React, { Component } from 'react';
import { View, PanResponder, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store'
import {
    NativeBaseProvider, Box, Center, Container, Heading, VStack, FormControl, Input, HStack,
    IconButton, Icon, MaterialCommunityIcons, Button, Link, ScrollView, AspectRatio, Stack, Image, Text, Pressable, Divider, Badge, Spacer, Flex
} from "native-base";
import { db } from '../Core/FirebaseConfig';
import { doc, collection, onSnapshot, where, getDocs } from 'firebase/firestore';
import { render } from 'react-dom';
import { baseUrl } from '../baseUrl'
class RenderBookMarkItem extends Component {
    recognizeDrag = ({ moveX, moveY, dx, dy }) => {
        if (dx < -200) return true; // right to left
        return false;
    };
    recognizeComment = ({ dx }) => {
        if (dx > 200) return true; // Left to right
        return false;
    };
    async removeFromBookmark() {
        await fetch(`${baseUrl}deleteBookmark`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: this.props.user,
                productId: this.props.product.id
            })
        }).then(async (data) => {
            if (await !data.ok) {
                throw new Error("Không thể xóa");
            } else {
                alert("Xóa khỏi bookmark thành công")
            }
        }).catch((err) => {
            alert(err)
        })
    }
    panResponder = PanResponder.create({
        onStartShouldSetPanResponder: (e, gestureState) => { return true; },
        onPanResponderEnd: (e, gestureState) => {
            if (this.recognizeDrag(gestureState)) {
                Alert.alert(
                    'Thông báo',
                    'Xóa sản phẩm ' + this.props.product.name + ' khỏi danh sách yêu thích ?',
                    [
                        { text: 'Cancel', onPress: () => { /* nothing */ } },
                        { text: 'OK', onPress: () => { this.removeFromBookmark() } },
                    ]
                );
            } else if (this.recognizeComment(gestureState)) {
                this.props.navigate('productDetail', { productId: this.props.product.id })
            }
            return true;
        }
    });
    render() {

        return (
            <Box alignItems="center" key={this.props.productId}>
                <Box maxW="96" borderWidth="1" borderColor="coolGray.300" shadow="3" bg="coolGray.100" p="5" rounded="8"{...this.panResponder.panHandlers}>
                    <HStack alignItems="center">
                        <Spacer />
                    </HStack>
                    <AspectRatio w="90%" ratio={16 / 9}>
                        <Image source={{
                            uri: this.props.product.pictureURL
                        }} alt="image" />
                    </AspectRatio>
                    <Text color="coolGray.800" mt="3" fontWeight="medium" fontSize="xl">
                        {this.props.product.name}
                    </Text>

                    <Flex>
                        <Pressable onPress={() => {
                            this.props.navigate('productDetail', { productId: this.props.product.id });
                        }}>
                            <Text mt="2" fontSize={12} fontWeight="medium" color="darkBlue.600">
                                Xem chi tiết
                            </Text>
                        </Pressable>
                    </Flex>
                </Box>
            </Box>
        )
    }

}

export default class BookmarkComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            products: [],
            userInfo: {},
            bookmarkItem: [],
            isLoaded: false,
        }
        SecureStore.getItemAsync('user').then((user) => {
            if (user) {
                this.setState({ userInfo: JSON.parse(user) })
                onSnapshot(doc(db, `users/${this.state.userInfo.id}`), async (data) => {
                    let bookmarkList = [];
                    data.data().bookmark.map((productBookmark) => {
                        this.state.products.forEach((item) => {
                            if (item.id == productBookmark) {
                                bookmarkList.push(item);
                            }
                        })
                    })
                    this.setState({ bookmarkItem: bookmarkList, isLoaded: true })

                })
            }
        })

        onSnapshot(collection(db, "items"), (data) => {
            let item = [];
            data.docs.forEach((doc) => {
                item.push({ ...doc.data(), id: doc.id });
            })
            this.setState({
                products: item,
            })
        })



    }
    // onPress={() => navigate('productDetail', { productId: item.id })} key={index}
    render() {
        const { navigate } = this.props.navigation;
        return (

            <Box safeArea flex={1} p={2} w="100%" mx="auto">
                <ScrollView>
                    <VStack space={4} alignItems="center">
                        {this.state.bookmarkItem.length == 0 ? <Text>Không có sản phẩm được thích</Text> :
                            this.state.isLoaded ? this.state.bookmarkItem.map((item, index) => {
                                return (
                                    <RenderBookMarkItem product={item} key={index} user={this.state.userInfo.id} navigate={navigate} />
                                )
                            }) : <Text>Loading...</Text>}
                    </VStack>
                </ScrollView>

            </Box>

        )

    }
}
