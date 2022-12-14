import React, { Component } from "react";
import { TextInput, Card, LogBox } from "react-native";
import { useState } from "react";
import { Rating, Icon } from "react-native-elements";
import {
    NativeBaseProvider,
    Box,
    Center,
    Container,
    Heading,
    VStack,
    FormControl,
    Input,
    HStack,
    IconButton,
    MaterialCommunityIcons,
    Button,
    Link,
    ScrollView,
    AspectRatio,
    Stack,
    Image,
    Text,
    Divider,
    Modal,
    Avatar,
    Spacer,
    Badge,
    Fab,
    Spinner,
    FlatList,
    View,
} from "native-base";
import { StyleSheet } from "react-native";
import { render } from "react-dom";
import { doc, collection, onSnapshot, where, getDoc } from "firebase/firestore";
import RNPickerSelect from 'react-native-picker-select';
import * as SecureStore from "expo-secure-store";
import { baseUrl } from '../baseUrl';
import { db } from '../Core/FirebaseConfig';
class AddProduct extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            price: 0,
            category: "",
            description: "",
            pictureURL: "",
            discountPrice: 0,
            quantity: 0,
            user: {},
            inProcess: false,
            categories: [],
            categoryLoaded: false,
        };
        onSnapshot(collection(db, "categories"), (data) => {

            let item = [];
            data.forEach((doc) => {
                item.push({ ...doc.data(), id: doc.id });
            })
            this.setState({
                categories: item,
                categoryLoaded: true,
            })

        })
        SecureStore.getItemAsync('user').then(async (user) => {
            await this.setState({ user: JSON.parse(user) })
            await onSnapshot(doc(db, `users/${this.state.user.id}`), async (data) => {
                if (await data.data().role !== 'admin') {
                    console.log("alo")
                   await SecureStore.deleteItemAsync('user').then(() => {
                        alert("Quy???n h???n kh??ng h???p l??? vui l??ng ????ng nh???p l???i")
                        this.props.navigation.reset({ index: 0, routes: [{ name: 'Login' }] })
                    })
                }
            })
        })
    }


    Dropdown = () => {
        const [category, setCategory] = useState(this.state.category);
        const dataList = this.state.categories.map((item) => {
            return { label: item.name, value: item.id }
        })

        return (
            <View backgroundColor={'white'} color={'black'}>
                <RNPickerSelect
                    value={category}
                    onValueChange={(chooseCategory) => {
                        setCategory(chooseCategory);
                        this.setState({ category: category })
                    }}
                    items={dataList}

                    onClose={() => {
                      
                    }}
                />
            </View>

        )
    }
    async addProduct(navigator) {
        this.setState({ inProcess: true });
        await fetch(`${baseUrl}addItem`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: this.state.user.id,
                name: this.state.name,
                price: this.state.price,
                category: this.state.category,
                description: this.state.description,
                pictureURL: this.state.pictureURL,
                discountPrice: this.state.discountPrice,
                quantity: this.state.quantity,
            })
        }).then(async (data) => {
            if (await !data.ok) {
                this.setState({ inProcess: false });
                throw new Error("Kh??ng th??? th??m s???n ph???m");
            } else {
                navigator.navigate('ManageProduct')
                    this.setState({ inProcess: false });

                    alert("Th??m s???n ph???m th??nh c??ng ")


            }
        }).catch((err) => {
            this.setState({ inProcess: false });
            alert(err)
        })
    }
    render() {
        const navigator = this.props.navigation;
        return (
            <View flex={"1"}>
                <ScrollView>
                    <VStack>
                        <AspectRatio w="100%" ratio={16 / 9}>
                            <Image
                                style={styles.image}
                                source={{
                                    uri: "https://product.hstatic.net/1000378196/product/z3026009462635_3fe710c4fa7c6b910c7ac8c77e9b601c_fc92154cfae243a4a5828173f0417faa_grande.jpg",
                                }}
                                alt="image"
                            />
                        </AspectRatio>
                        <Box p="4">
                            <Heading
                                style={styles.label}
                                alignItems="center"
                                flexDirection="row"
                                fontSize={"15"}
                            >
                                T??n s???n ph???m
                            </Heading>
                            <Input
                                style={styles.input}
                                placeholder="T??n s???n ph???m"
                                isRequired={true}
                                onChangeText={(name) => {
                                    this.setState({ name })}}

                            />
                            <Heading
                                style={styles.label}
                                alignItems="center"
                                flexDirection="row"
                                fontSize={"15"}
                            >
                                Danh m???c
                            </Heading>
                            <this.Dropdown />
                            <Heading
                                style={styles.label}
                                alignItems="center"
                                flexDirection="row"
                                fontSize={"15"}
                            >
                                Gi?? s???n ph???m
                            </Heading>
                            <Input
                                style={styles.input}
                                placeholder="Gi?? s???n ph???m"
                                isRequired={true}
                                keyboardType="numeric"
                                onChangeText={(text) => { this.setState({ price: parseInt(text) }) }}
                            />
                            <Heading
                                style={styles.label}
                                alignItems="center"
                                flexDirection="row"
                                fontSize={"15"}
                            >
                                M?? t??? s???n ph???m
                            </Heading>
                            <Input
                                style={styles.input}
                                placeholder="M?? t??? s???n ph???m"
                                isRequired={true}

                                onChangeText={(text) => { this.setState({ description: text }) }}
                            />
                            <Heading
                                style={styles.label}
                                alignItems="center"
                                flexDirection="row"
                                fontSize={"15"}
                            >
                                Gi???m gi??
                            </Heading>
                            <Input
                                style={styles.input}
                                placeholder="Gi???m gi??"
                                isRequired={true}
                                keyboardType="numeric"
                                onChangeText={(text) => { this.setState({ discountPrice: parseInt(text) }) }}
                            />
                            <Heading
                                style={styles.label}
                                alignItems="center"
                                flexDirection="row"
                                fontSize={"15"}
                            >

                                S??? l?????ng
                            </Heading>
                            <Input
                                style={styles.input}
                                placeholder="S??? l?????ng"
                                isRequired={true}
                                keyboardType="numeric"

                                onChangeText={(text) => { this.setState({ quantity: parseInt(text)}) }}
                            />
                            <Heading
                                style={styles.label}
                                alignItems="center"
                                flexDirection="row"
                                fontSize={"15"}
                            >
                                ???nh s???n ph???m
                            </Heading>
                            <Input
                                style={styles.input}
                                placeholder="???????ng d???n ???nh"
                                isRequired={true}
                                onChangeText={(text) => { this.setState({ pictureURL: text }) }}
                            />

                            <Button style={styles.button} isDisabled={this.state.inProcess} onPress={() => {
                                this.addProduct(navigator)
                            }}>Th??m</Button>
                            {/* <Divider my="2" /> */}
                        </Box>
                    </VStack>
                </ScrollView>
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
    label: {
        padding: 10,
    },
    input: {
        height: 40,
    },
    button: {
        marginTop: 20,
        height: 50,
        marginBottom: 20,
        backgroundColor: "#bd6604",
    },
    image: {
        height: 200,
    },
});

export default AddProduct;
