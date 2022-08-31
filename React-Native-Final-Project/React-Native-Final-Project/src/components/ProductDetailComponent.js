

import React, { Component } from 'react';
import { TextInput, Card, LogBox, BackHandler, BackAndroid } from 'react-native';
import { useState } from 'react';
import { Rating, Icon } from 'react-native-elements';
import {
    NativeBaseProvider, Box, Center, Container, Heading, VStack, FormControl, Input, HStack,
    IconButton, MaterialCommunityIcons, Button, Link, ScrollView, AspectRatio, Stack, Image, Text, Divider, Modal, Avatar, Spacer, Badge, Fab, Spinner,
    FlatList, View,
} from "native-base";
import { db } from '../Core/FirebaseConfig';
import { useEffect } from 'react';
import { doc, collection, onSnapshot, where, getDoc } from 'firebase/firestore'
import * as SecureStore from 'expo-secure-store'
import { baseUrl } from '../baseUrl'

import { render } from 'react-dom';



function RenderComment(comment) {
    return (
        <Box borderBottomWidth="1" _dark={{
            borderColor: "gray.600"
        }} borderColor="coolGray.200" pl="4" pr="5" py="2">
            <HStack space={3} justifyContent="space-between">
                <Avatar size="48px" source={{
                    uri: comment.pictureURL
                }} />
                <VStack>
                    <Text _dark={{
                        color: "warmGray.50"
                    }} color="coolGray.800" bold>
                        {comment.fullName}
                    </Text>
                    <Text color="coolGray.600" _dark={{
                        color: "warmGray.200"
                    }}>
                        {comment.comment}
                    </Text>
                </VStack>
                <Spacer />
                <Text fontSize="xs" _dark={{
                    color: "warmGray.50"
                }} color="coolGray.800" alignSelf="flex-start">
                    {comment.time}
                </Text>
            </HStack>
        </Box>
    );
}
export default class ProductDetailComponent extends Component {
    Loading(text) {
        return <HStack space={2} justifyContent="center">
            <Spinner accessibilityLabel="Loading posts" color="#bd6604" />
            <Heading color="#bd6604" fontSize="md">
                {text.text}
            </Heading>
        </HStack>;
    };
    constructor(props) {
        super(props);
        this.state = {
            item: {},
            isLoaded: false,
            rating: 0,
            userInfo: {},
            isLoadedComment: false,
            comments: [],
            isBookmarked: false,
            inCart: false,
            isLoadedCategories: false,
            inProcess: false,
            category: 'Không có mục',

        };
        SecureStore.getItemAsync('user').then((user) => {
            if (user) {
                this.setState({ userInfo: JSON.parse(user) })
                onSnapshot(doc(db, `users/${this.state.userInfo.id}`), async (data) => {
                    (this.state.userInfo)

                    data.data().bookmark.map((product) => {

                        if (product === this.props.route.params.productId) {
                            this.setState({ isBookmarked: true })
                        } else {
                            this.setState({ isBookmarked: false })
                        }
                    })
                    data.data().cart.map((cartItem) => {

                        if (cartItem.productId === this.props.route.params.productId) {
                            this.setState({ inCart: true })
                        }
                        else {
                            this.setState({ inCart: false })
                        }

                    })
                })
            }
        })


        onSnapshot(doc(db, `items/${this.props.route.params.productId}`), (data) => {
            if (data.data().category != null) {
                //get category name from category id
                getDoc(doc(db, `categories/${data.data().category}`)).then(async (category) => {

                    this.setState({ category: await category.data().name })

                    this.setState({
                        item: data.data(),
                        isLoaded: true,
                    })

                })
            } else {
                this.setState({
                    item: data.data(),
                    isLoaded: true,
                })
            }


        })
        //getComment
        onSnapshot(collection(db, `comments`), (data) => {
            let comment = [];
            data.docs.forEach(async (item) => {
                if (item.data().productId === this.props.route.params.productId) {

                    await getDoc(doc(db, `users/${item.data().userId}`)).then((data) => {
                        comment.push({ comment: item.data().comment, userId: item.data().userId, pictureURL: data.data().pictureURL, fullName: data.data().fullName, time: item.data().time })
                    })
                    this.setState({
                        comments: [...comment],
                        isLoadedComment: true
                    })
                }
            })
        })

    }
    async addItemToCart() {
        this.setState({ inProcess: true })
        await fetch(`${baseUrl}addCart`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: this.state.userInfo.id,
                productId: this.props.route.params.productId
            })
        }).then(async (data) => {
            if (await !data.ok) {
                throw new Error("Không thể thêm vào giỏ hàng");
            } else {
                this.setState({ inCart: true, inProcess: false })
                alert("Đã thêm vào giỏ hàng")

            }
        }).catch((err) => {
            this.setState({ inProcess: false })
            alert(err)

        })
    }
    async removeCartItem() {
        this.setState({ inProcess: true })
        await fetch(`${baseUrl}deleteCart`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: this.state.userInfo.id,
                productId: this.props.route.params.productId
            })
        }).then(async (data) => {
            if (await !data.ok) {
                throw new Error("Không thể xóa sản phẩm ở giỏ hàng");
            } else {
                this.setState({ inCart: false, inProcess: false })
                alert("Đã xóa khỏi  giỏ hàng")



            }
        }).catch((err) => {
            this.setState({ inProcess: false })
            alert(err)

        })
    }
    async addBookMark() {
        this.setState({ inProcess: true })
        await fetch(`${baseUrl}updateBookmark`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: this.state.userInfo.id,
                productId: this.props.route.params.productId
            })
        }).then(async (data) => {
            if (await !data.ok) {
                throw new Error("Không thể thêm vào BookMark");
            } else {
                alert("Đã thêm vào BookMark")
                this.setState({ isBookmarked: true, inProcess: false })
            }
        }).catch((err) => {
            alert(err)
            this.setState({ inProcess: false })
        })
    }
    async removeFromBookmark() {
        this.setState({ inProcess: true })
        await fetch(`${baseUrl}deleteBookmark`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: this.state.userInfo.id,
                productId: this.props.route.params.productId
            })
        }).then(async (data) => {
            if (await !data.ok) {
                throw new Error("Không thể xóa");
            } else {
                alert("Xóa khỏi bookmark thành công")
                this.setState({ isBookmarked: false, inProcess: false })
            }
        }).catch((err) => {
            alert(err)
            this.setState({ inProcess: false })
        })
    }
    async addComment(comment) {
        this.setState({ inProcess: true })
        const date = new Date()
        let a = (Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes()))
        let b = a.split(' ')
        let c = b.slice(0, 5).join(' ')

        await fetch(`${baseUrl}addComment`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: this.state.userInfo.id,
                productId: this.props.route.params.productId,
                comment: comment,
                time: c
            })
        }).then(async (data) => {
            if (await !data.ok) {
                throw new Error("Không thể thêm bình luận");
            } else {
                alert("Đã thêm bình luận")
                this.setState({ inProcess: false })
            }
        }).catch((err) => {
            alert(err)
            this.setState({ inProcess: false })
        })
    }



    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', () => { return true });
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', () => { return true });
    }
    render() {


        const CommentModal = () => {
            const [modal, showModal] = useState(false);
            const [comment, setComment] = useState('');
            return <Center>
                <Box>
                    <Button isDisabled={this.state.inProcess} backgroundColor={'#bd6604'} size={"sm"} mr={2} onPress={() => showModal(true)}>Bình luận</Button>
                </Box>
                <Modal isOpen={modal} onClose={() => showModal(true)}>
                    <Modal.Content maxWidth="400px">
                        {/* <Modal.CloseButton /> */}
                        <Modal.Header>Thêm bình luận</Modal.Header>
                        <Modal.Body>

                            <FormControl.Label>Bình luận</FormControl.Label>
                            <Input blurOnSubmit={false} onChangeText={(comment) => setComment(comment)} />
                        </Modal.Body>
                        <Modal.Footer>
                            <Button.Group space={2}>
                                <Button variant="ghost" colorScheme="blueGray" onPress={() => {

                                    this.setState({ showModal: false });
                                }}>
                                    Cancel
                                </Button>
                                <Button onPress={() => {
                                    this.addComment(comment);
                                    this.setState({ showModal: false });
                                }}>
                                    Save
                                </Button>
                            </Button.Group>
                        </Modal.Footer>
                    </Modal.Content>
                </Modal>
            </Center>;
        };
        return (
            <>
                <View flex={'1'} >
                    {this.state.isLoaded ?
                        <ScrollView >
                            {this.state.isLoaded ?
                                <VStack >
                                    <AspectRatio w="100%" ratio={16 / 9}>
                                        <Image source={{
                                            uri: this.state.item.pictureURL
                                        }} alt="image" />
                                    </AspectRatio>
                                    <Box p="4">
                                        <HStack justifyContent={'center'} alignItems={'center'}>
                                            <Heading size="md" >{this.state.item.name}</Heading>
                                        </HStack>
                                        <Divider my="2" />
                                        <Heading alignItems="center" flexDirection="row" fontSize={'15'}>
                                            Danh mục
                                        </Heading>
                                        <HStack space={{
                                            sm: 4
                                        }}
                                        >
                                            <><Badge colorScheme="danger">{this.state.category}</Badge></>
                                            <>
                                            </>
                                        </HStack>
                                        <Divider my="2" />
                                        <Heading alignItems="center" flexDirection="row" fontSize={'15'}>
                                            Chi tiết
                                        </Heading>
                                        <Divider my="2" />
                                        <Text fontSize="xs">{this.state.item.description}</Text>
                                    </Box>
                                    <HStack>
                                        <Heading alignItems="center" pl="4" fontSize={'15'}>
                                            Bình luận
                                        </Heading>
                                        <HStack flex={1} justifyContent={'flex-end'}>
                                            <CommentModal ></CommentModal>
                                        </HStack>
                                    </HStack>
                                    <Divider my="2" />
                                    {this.state.isLoadedComment ?
                                        <FlatList nestedScrollEnabled m={'2'} borderRadius={'10'} backgroundColor={'#FFFFFF'} p={'2'} h={'20%'} data={this.state.comments} renderItem={({ item, index }) => {
                                            return RenderComment(item)
                                        }} />
                                        : <Box borderBottomWidth="1" _dark={{
                                            borderColor: "gray.600"
                                        }} borderColor="coolGray.200" pl="4" pr="5" py="2" h={"32%"} backgroundColor={'#FFFFFF'} m={'2%'} borderRadius={'10'}>

                                            <Text>Không có bình luận</Text>
                                        </Box>}
                                </VStack>
                                : <Box borderBottomWidth="1" _dark={{
                                    borderColor: "gray.600"
                                }} borderColor="coolGray.200" pl="4" pr="5" py="2" h={"5%"} backgroundColor={'#FFFFFF'} m={'2%'} borderRadius={'10'}>
                                    <this.Loading text={"Đang tải bình luận"} />
                                </Box>
                            }

                        </ScrollView>
                        : <this.Loading text={"Đang tải thông tin sản phẩm"} />
                    }

                </View>
                <View h={'8%'} backgroundColor={'white'} shadow={'4'} justifyContent={'center'}>
                    {this.state.isLoaded ?
                        <HStack alignItems={'center'}>
                            <Text color={'#bd6604'} fontWeight={'bold'} fontSize="15" strikeThrough={true}>{this.state.item.price.toLocaleString('it-IT', { style: 'currency', currency: 'VND' })}</Text>
                            <Text color={'#bd6604'} fontWeight={'bold'} fontSize="15">  {(this.state.item.price - this.state.item.discountPrice).toLocaleString('it-IT', { style: 'currency', currency: 'VND' })}</Text>
                            <HStack flex={'1'} justifyContent={'flex-end'} mr={'1'}>
                                {this.state.isBookmarked ? <Icon raised name={'bookmark'} type='material' color='#f50' size={20} onPress={() => {
                                    this.removeFromBookmark()
                                }} /> : <Icon raised reverse name={'bookmark'} type='material' color='#f50' size={20} onPress={() => {
                                    this.addBookMark()
                                }} />}
                                {this.state.inCart ? <Button isDisabled={this.state.inProcess} size="xs" backgroundColor={'#bd6604'} mr={"2"} mt={"1"} mb={"1"} borderRadius={'20'} onPress={() => {
                                    this.removeCartItem();
                                }}>
                                    XOÁ KHỎI GIỎ
                                </Button> : <Button isDisabled={this.state.inProcess} size="sm" mr={"2"} mt={"1"} mb={"1"} backgroundColor={'#bd6604'} borderRadius={'20'} onPress={() => {
                                    this.addItemToCart();
                                }}>
                                    THÊM VÀO GIỎ
                                </Button>}
                            </HStack>
                        </HStack>
                        : <Text>Loading...</Text>



                    }
                </View>
            </>
        )
    }

}