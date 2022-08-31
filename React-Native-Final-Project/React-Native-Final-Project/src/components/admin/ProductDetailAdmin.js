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
import { db } from '../../Core/FirebaseConfig';
import * as SecureStore from "expo-secure-store";
import RNPickerSelect from 'react-native-picker-select';
import { baseUrl } from '../../baseUrl';

class ProductDetailAdmin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      item: {},
      user: {},
      isLoaded: false,
      categories: [],
      name: '',
      price: '',
      description: '',
      discountPrice: '',
      quantity: '',
      pictureURL: '',
      category: '',
      inProcess: false,
    };
    onSnapshot(doc(db, `items/${this.props.route.params.productId}`), (data) => {
      this.setState({
        item: { ...data.data(), id: data.id },
        isLoaded: true,
      })
    })
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
    onSnapshot(collection(db, "categories"), (data) => {
      let item = [];
      data.forEach((doc) => {
        item.push({ ...doc.data(), id: doc.id });
      })
      this.setState({
        categories: item,
      })

    })
  }
  async checkInput() {
    if (this.state.name.trim() == "") {
      this.setState({ name: this.state.item.name });
    }
    if (this.state.price.trim() == "") {
      this.setState({ price: this.state.item.price });
    }
    if (this.state.description.trim() == "") {
      this.setState({ description: this.state.item.description });
    }
    if (this.state.discountPrice.trim() == "") {
      this.setState({ discountPrice: this.state.item.discountPrice });
    }
    if (this.state.quantity.trim() == "") {
      this.setState({ quantity: this.state.item.quantity });
    }
    if (this.state.pictureURL.trim() == "") {
      this.setState({ pictureURL: this.state.item.pictureURL });
    }
    if (this.state.category.trim() == "") {
      this.setState({ category: this.state.item.category });
    }
  }
  async updateProduct(navigator) {


    this.setState({ inProcess: true });
    await this.checkInput()
    await fetch(`${baseUrl}updateItem`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({

        userId: this.state.user.id,
        productId: this.props.route.params.productId,
        name: this.state.name,
        price: parseInt(this.state.price),
        description: this.state.description,
        discountPrice: parseInt(this.state.discountPrice),
        quantity: parseInt(this.state.quantity),
        pictureURL: this.state.pictureURL,
        category: this.state.category,
      })
    }).then(async (data) => {
      if (await !data.ok) {
        this.setState({ inProcess: false });
        throw new Error("Cập nhật sản phẩm không thành công");
      } else {
        navigator.navigate('ManageProduct')
        this.setState({ inProcess: false });

        alert("successful")


      }
    }).catch((err) => {
      this.setState({ inProcess: false });
      alert(err)
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
  render() {
    const navigator = this.props.navigation;
    return (
      this.state.isLoaded ?
        <View flex={"1"}>
          <ScrollView>
            <VStack>
              <AspectRatio w="100%" ratio={16 / 9}>
                <Image
                  style={styles.image}
                  source={{
                    uri: this.state.item.pictureURL,
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
                  Tên sản phẩm
                </Heading>
                <Input
                  style={styles.input}
                  placeholder="Tên sản phẩm"
                  defaultValue={this.state.item.name}
                  onChangeText={(name) => this.setState({ name: name })}
                />
                <Heading
                  style={styles.label}
                  alignItems="center"
                  flexDirection="row"
                  fontSize={"15"}
                >
                  Danh mục
                </Heading>
                <this.Dropdown/>
                <Heading
                  style={styles.label}
                  alignItems="center"
                  flexDirection="row"
                  fontSize={"15"}
                >
                  Giá sản phẩm
                </Heading>
                <Input
                  style={styles.input}
                  placeholder="Giá sản phẩm"
                  keyboardType="numeric"
                  defaultValue={(this.state.item.price.toString())}
                  onChangeText={(price) => this.setState({ price: price })}
                />
                <Heading
                  style={styles.label}
                  alignItems="center"
                  flexDirection="row"
                  fontSize={"15"}
                >
                  Mô tả sản phẩm
                </Heading>
                <Input
                  style={styles.input}
                  placeholder="Mô tả sản phẩm"
                  defaultValue={this.state.item.description}
                  onChangeText={(description) => this.setState({ description: description })}
                />
                <Heading
                  style={styles.label}
                  alignItems="center"
                  flexDirection="row"
                  fontSize={"15"}
                >
                  Giá giảm
                </Heading>
                <Input
                  style={styles.input}
                  placeholder="Giá giảm"
                  keyboardType="numeric"
                  defaultValue={(this.state.item.discountPrice).toString()}
                  onChangeText={(discountPrice) => this.setState({ discountPrice: discountPrice })}
                />
                <Heading
                  style={styles.label}
                  alignItems="center"
                  flexDirection="row"
                  fontSize={"15"}
                >
                  Hình sản phẩm
                </Heading>
                <Input
                  style={styles.input}
                  placeholder="Hình sản phẩm"
                  defaultValue={this.state.item.pictureURL}
                  onChangeText={(pictureURL) => this.setState({ pictureURL: pictureURL })}

                />
                <Heading
                  style={styles.label}
                  alignItems="center"
                  flexDirection="row"
                  fontSize={"15"}
                >
                  Số lượng
                </Heading>
                <Input
                  style={styles.input}
                  placeholder="Số lượng"
                  keyboardType="numeric"
                  defaultValue={this.state.item.quantity.toString()}
                  onChangeText={(quantity) => this.setState({ quantity: quantity })}
                />
                <Button style={styles.button} isDisabled={this.state.inProcess} onPress={() => {
                  this.updateProduct(navigator)
                }}>Cập nhật</Button>
                {/* <Divider my="2" /> */}
              </Box>
            </VStack>
          </ScrollView>
        </View>
        :
        <View></View>
    )
  }

  getDetailProduct(dishId) {
    console.log(`id::::::${dishId}`);
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
    backgroundColor: "#FF1A40",
  },
  image: {
    height: 200,
  },
});

export default ProductDetailAdmin;
