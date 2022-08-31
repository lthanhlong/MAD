import React, { Component } from 'react';

import * as SecureStore from 'expo-secure-store'
import {
    NativeBaseProvider, Box, Center, Container, Heading, VStack, FormControl, Input, HStack,
    IconButton, Icon, MaterialCommunityIcons, Button, Link, ScrollView, AspectRatio, Stack, Image, Text, Pressable, Divider, Badge,
    Spacer, Flex, FlatList, Avatar, View, Spinner
} from "native-base";
import { db } from '../Core/FirebaseConfig';
import { doc, collection, onSnapshot, where, getDocs, getDoc, updateDoc } from 'firebase/firestore';
import { render } from 'react-dom';
import { baseUrl } from '../baseUrl'
import ThemedListItem from 'react-native-elements/dist/list/ListItem';

class CartComponent extends Component {
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
            cartItemFull: [],
            isLoaded: false,
            userInfo: {},
            cartItem: [],
            totalPrice: 0,
            hasItem: false,
            inProcess:false,
        };
    }
    async makePayment(navigate) {
        if(!this.state.inProcess){
            this.setState({inProcess:true});
            fetch(`${baseUrl}makePayment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    userId: this.state.userInfo.id,
                    data: this.state.cartItemFull
                })
            }).then(async res => {
                console.log(res)
                if (res.ok) {
                    alert(`Thanh toán số tiền ${this.state.totalPrice} thành công`)
                    this.setState({
                        cartItem: [],
                        totalPrice: 0,
                        cartItemFull: [],
                        hasItem: false,
                        inProcess:false
    
                    })
                    navigate.navigate('Product')
                }
            }).catch(err => {
                alert(`Không thể thanh toán `)
                this.setState({inProcess:false})
            }).finally(() => {
                // this.setState({
                //     isLoaded: false
                // })
            }
            )
    
        }else{
            alert('Đang xử lý')
        }
       

    }
    async increment(productId) {

        let cartItem = this.state.cartItemFull;
        let cartDrop = [];
        let index = cartItem.findIndex(item => item.productId === productId);
        cartItem[index].value++;
        cartItem.forEach((data) => {
            cartDrop.push({ productId: data.productId, value: data.value })
        })

        await updateDoc(doc(db, `users/${this.state.userInfo.id}`), {
            cart: cartDrop
        })
        this.setState({ cartItemFull: cartItem })
    }
    async removeFromCart(productId) {
        this.setState({hasItem:false,isLoaded:true})
        let cartItem = this.state.cartItemFull;
        let cartDrop = [];
        let index = cartItem.findIndex(item => item.productId === productId);

        this.setState({ totalPrice: this.state.totalPrice - (cartItem[index].product.price-cartItem[index].product.discountPrice) })
        cartItem.splice(index, 1);
        cartItem.forEach((data) => {
            cartDrop.push({ productId: data.productId, value: data.value })
        })

        await updateDoc(doc(db, `users/${this.state.userInfo.id}`), {
            cart: cartDrop
        })
        this.setState({ cartItemFull: cartItem})
    }
    async decrement(productId) {
   
        //increment the value of the product
        let cartItem = this.state.cartItemFull;

        let cartDrop = [];
        let index = cartItem.findIndex(item => item.productId === productId);
        if (cartItem[index].value > 0) {
            cartItem[index].value--;
            cartItem.forEach((data) => {

                cartDrop.push({ productId: data.productId, value: data.value })
            })

            await updateDoc(doc(db, `users/${this.state.userInfo.id}`), {
                cart: cartDrop
            })
        }
    }
    componentDidMount() {
        //get data from securestore
        SecureStore.getItemAsync('user').then((user) => {
            if (user) {
                this.setState({
                    userInfo: JSON.parse(user)
                });
                onSnapshot(doc(db, `users/${this.state.userInfo.id}`), async (data) => {

                    let itemList = [];
                    let totalPrice = 0;
                    await data.data().cart.forEach(async (cartItemFull) => {
                        await getDoc(doc(db, `items/${cartItemFull.productId}`)).then(async (productData) => {
                            if (productData.length >= 0) {
                                this.setState({ hasItem: false })
                            }
                            itemList.push({
                                productId: cartItemFull.productId,
                                product: productData.data(),
                                value: cartItemFull.value
                            })
                            //cal total
                            totalPrice += (productData.data().price - productData.data().discountPrice) * cartItemFull.value
                            this.setState({ cartItemFull: itemList, hasItem: true })
                            this.setState({ totalPrice: totalPrice })

                        })


                    })
                })
            }
        })
    }
    render() {
        let navigate = this.props.navigation
        return (
            <View justifyContent={'space-between'}>
                <Box>
                    <Heading fontSize="xl" p="4" pb="3">
                        Sản phẩm trong giỏ hàng
                    </Heading>
                    <Box maxW={'99%'} borderColor="coolGray.200" borderWidth="1" backgroundColor={'white'} p={'2'} m={'2'} h={"70%"}>
                        {this.state.hasItem ? <FlatList h={'70%'} data={this.state.cartItemFull} renderItem={({
                            item, index
                        }) => <Box borderBottomWidth="1" _dark={{
                            borderColor: "gray.600"
                        }} borderColor="coolGray.200" pl="4" pr="5" py="2" key={item.index}>
                                <HStack    >
                                    <HStack flex={'1'} alignItems={'center'}>
                                        <Image size="50" source={{
                                            uri: item.product.pictureURL
                                        }} alt="picture" />
                                        <VStack>
                                            <Text _dark={{
                                                color: "warmGray.50"
                                            }} color="coolGray.800" bold w={'70%'}>
                                                {item.product.name}
                                            </Text>
                                            {item.product.discountPrice > 0 ?
                                                <Text color="coolGray.600" _dark={{
                                                    color: "warmGray.200"
                                                }}>
                                                    Giá: {(item.product.price - item.product.discountPrice).toLocaleString('it-IT', { style: 'currency', currency: 'VND' })}
                                                </Text> :
                                                <Text color="coolGray.600" _dark={{
                                                    color: "warmGray.200"
                                                }}>
                                                    Giá: {item.product.price.toLocaleString('it-IT', { style: 'currency', currency: 'VND' })}
                                                </Text>

                                            }

                                        </VStack>
                                    </HStack>
                                    <VStack   >
                                        <Button backgroundColor={'#bd6604'} size={'8'} onPress={() => this.increment(item.productId)}>+</Button>
                                        <Text fontSize="xs" _dark={{
                                            color: "warmGray.50"
                                        }} color="coolGray.800" textAlign={'center'}>
                                            {item.value}
                                        </Text>
                                        <Button backgroundColor={'#bd6604'} size={'8'} onPress={() => {
                                            if (item.value == 0) {
                                                this.decrement(item.productId);
                                            } else {
                                                this.removeFromCart(item.productId);
                                            }
                                        }}>-</Button>
                                    </VStack>

                                </HStack>


                            </Box>} keyExtractor={item => item.id} /> : this.state.cartItemFull.length == 0 ? <Text>Không có sản phẩm trong giỏ hàng</Text> :
                            <this.Loading text={"Đang tải giỏ hàng"}></this.Loading>
                        }

                    </Box>
                </Box>
                <Box h={'19.8%'} m={'2'} borderColor="coolGray.200" borderWidth="1" backgroundColor={'white'} p={'2'}>
                    <HStack flex={'1'} >
                        <Text>Số tiền cần thanh toán:</Text>
                        <Text>{this.state.totalPrice.toLocaleString('it-IT', { style: 'currency', currency: 'VND' })}</Text>
                    </HStack>

                    <Button isDisabled={this.state.totalPrice <= 0?true:false} backgroundColor={'#bd6604'} w={'100%'} h={'30%'} onPress={() => this.makePayment(navigate)}>Thanh toán</Button>
                </Box>
            </View>


        )

    }
}
export default CartComponent