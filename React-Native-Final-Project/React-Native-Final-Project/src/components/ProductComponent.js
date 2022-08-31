
import React, { Component, useState } from 'react';
import { Icon } from 'react-native-elements'

import {
    NativeBaseProvider, Box, Center, Container, Heading, VStack, FormControl, Input, HStack,
    IconButton, MaterialCommunityIcons, Button, Link, ScrollView, AspectRatio, Stack, Image, Text, Pressable, Divider, Badge, FlatList,
    View, Spinner
} from "native-base";
import { db } from '../Core/FirebaseConfig';
import { doc, collection, onSnapshot,getDoc} from 'firebase/firestore';
import render from 'react-dom';


import * as SecureStore from 'expo-secure-store'

function RenderItem(product) {
  
    const [category, setCategory] = useState('Không có mục');
    let price = product.product.price; 
    let discountPrice = product.product.price - product.product.discountPrice
    price = price.toLocaleString('it-IT', { style: 'currency', currency: 'VND' })
    discountPrice = discountPrice.toLocaleString('it-IT', { style: 'currency', currency: 'VND' })
    //get category name from product category id

    let categoryId = product.product.category;
     getDoc(doc(db, `categories/${categoryId}`)).then(async (data) => {
        setCategory(await data.data().name);
     

    })
    return (
        <Box alignItems="center" key={product.id}>

            <Box maxW="80" rounded="lg" overflow="hidden" borderColor="coolGray.200" borderWidth="1" _dark={{
                borderColor: "coolGray.600",
                backgroundColor: "gray.700"
            }} _web={{
                shadow: 2,
                borderWidth: 0
            }} _light={{
                backgroundColor: "gray.50"
            }}>
                <Box >
                    <AspectRatio w="100%" ratio={16 / 9}>
                        <Image source={{
                            uri: product.product.pictureURL
                        }} alt="image" />
                    </AspectRatio>
                    {product.product.discountPrice < 0 ? <Center bg="#bd6604" _dark={{
                        bg: "#bd6604"
                    }} _text={{
                        color: "warmGray.50",
                        fontWeight: "700",
                        fontSize: "xs"
                    }} position="absolute" bottom="0" px="3" py="1.5">
                        {price}
                    </Center> :
                        <HStack>
                            <Center bg="#FFC6D6" _dark={{
                                bg: "#bd6604"
                            }} _text={{
                                color: "warmGray.50",
                                fontWeight: "700",
                                fontSize: "xs",
                                textDecorationLine: "line-through"

                            }} px="3" py="1.5">
                                {price}
                            </Center>
                            <Center bg="#bd6604" _dark={{
                                bg: "#bd6604"
                            }} _text={{
                                color: "warmGray.50",
                                fontWeight: "700",
                                fontSize: "xs"
                            }} px="3" py="1.5" mx="2">
                                {discountPrice}
                            </Center>
                        </HStack>
                    }

                </Box>
                <Stack p="4" space={3}>
                    <Stack space={2}>
                        <Heading size="md" ml="-1">
                            {product.product.name}
                        </Heading>
                        <><Badge colorScheme="danger">{category}</Badge></>
                    </Stack>

                    <HStack alignItems="center" space={4} justifyContent="space-between">
                        <HStack alignItems="center">
                            <Text color="coolGray.600" _dark={{
                                color: "warmGray.200"
                            }} fontWeight="400">
                                Đã bán  {product.product.sold}
                            </Text>
                            <Text color="coolGray.600" _dark={{
                                color: "warmGray.200"
                            }} fontWeight="400" marginLeft={'28'}>
                                Còn lại : {product.product.quantity}
                            </Text>
                        </HStack>
                    </HStack>
                </Stack>
            </Box>

        </Box>

    )

}
export default class ProductComponent extends Component {
    componentDidMount() {
        //Get securestorage item
        SecureStore.getItemAsync('user').then((user) => {
            this.setState({ user: JSON.parse(user) })
        })

    }
    constructor(props) {
        super(props);

        this.state = {
            items: [],
            isLoaded: false,
            user: {},

            itemsforFilter: [],

        };
        this.subscriber = onSnapshot(collection(db, "items"), (data) => {

            let item = [];
            data.docs.forEach((doc) => {
                item.push({ ...doc.data(), id: doc.id });
            })
            this.setState({
                items: item,
                itemsforFilter: item,
                isLoaded: true
            })
        })
    }

    filterProductByName(name) {
        let item = this.state.itemsforFilter;

        let itemFilter = item.filter((item) => {
            return item.name.toLowerCase().includes(name.toLowerCase())
        })
        if (itemFilter.length > 0) {
            this.setState({
                items: this.state.itemsforFilter
            })
        }
        this.setState({
            items: itemFilter
        })

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

        const { navigate } = this.props.navigation;

        return (
            <View h={'full'} w={'full'}>

                <Box safeArea p={2} w="90%" mx="auto">
                    <VStack w="100%" space={5} alignItems={'center'} >

                        <Input onChangeText={(text) => {
                            this.filterProductByName(text)
                        }} placeholder="Tìm kiếm sản phẩm" width="90%" backgroundColor={'white'} borderRadius="4" py="3" px="1" fontSize="14" InputLeftElement={<Icon name='search' size={36} color='#FFC6D6' />} />
                    </VStack>
                    <VStack space={4} alignItems="center" >
                        {this.state.isLoaded ? <FlatList nestedScrollEnabled borderRadius={'10'} h={'90%'} data={this.state.items} renderItem={({ item, index }) => {

                            return <Pressable mt={'3'} onPress={() => navigate('productDetail', { productId: item.id })} key={index}>
                                <RenderItem product={item} key={index} />
                            </Pressable>
                        }}
                        />
                            : <this.Loading text={"Đang tải sản phẩm"} />}
                    </VStack>
                </Box>
            </View>
        )

    }

}
