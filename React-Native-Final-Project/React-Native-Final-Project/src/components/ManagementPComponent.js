import React, { Component } from "react";
import {
  StyleSheet,
  Text,

  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  FlatList,
} from "react-native";


import {
  NativeBaseProvider, Box, Center, Container, Heading, VStack, FormControl, Input, HStack,
  IconButton, MaterialCommunityIcons, Button, Link, AspectRatio, Stack, Pressable, Divider, Badge
  , Spinner, Icon, View,
} from "native-base";
import { db } from '../Core/FirebaseConfig';
import { doc, collection, onSnapshot } from 'firebase/firestore';
import render from 'react-dom';
import * as SecureStore from 'expo-secure-store'

import { baseUrl } from '../baseUrl'
export default class Store extends Component {
  constructor(props) {
    super(props);
    this.state = {

      items: [],
      itemsforFilter: [],
      isLoaded: false,
      inProcess: false,
      user: {},
    };
    onSnapshot(collection(db, "items"), (data) => {

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
  async confirmDeleteProduct(id) {

    await Alert.alert("Xóa người dùng", "Bạn có chắc chắn muốn xóa sản phẩm này không?", [{ text: "Không", onPress: () => console.log("Không"), style: "cancel" }, {
      text: "Có", onPress: () => this.deleteProduct(id)
    }])

  }
  async deleteProduct(id) {
    this.setState({ inProcess: true }),
      await fetch(`${baseUrl}deleteItem?id=${id}&userId=${this.state.user.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },

      }).then(async (data) => {
        if (await !data.ok) {
          throw new Error("Không thể xóa sản phẩm");
        } else {
          alert("Đã xóa sản phẩm")
          this.setState({ inProcess: false })
        }
      }).catch((err) => {
        alert(err)
        this.setState({ inProcess: false })
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
    const navigator = this.props.navigation;
    return (
      <>
        <View w={'100%'} h={'20%'} mt={'2%'}>
          <VStack w="100%" flex={'1'} space={5} alignItems={'center'} >
            <Button onPress={() => {
              navigator.navigate("AddProduct")
            }}>
              Thêm san pham
            </Button>
            <Input onChangeText={(text) => {
              this.filterProductByName(text)
            }} placeholder="Tìm kiếm sản phẩm" width="90%" backgroundColor={'white'} borderRadius="4" py="3" px="1" fontSize="14" InputLeftElement={<Icon name='search' size={36} color='#FFC6D6' />} />
          </VStack>
        </View>

        <View style={styles.container}>
          {!this.state.isLoaded ?
            <this.Loading text={'Đang tải sản phẩm'} /> : <FlatList
              style={styles.list}
              contentContainerStyle={styles.listContainer}
              data={this.state.items}
              horizontal={false}
              numColumns={2}
              keyExtractor={(item) => {
                return item.id;
              }}
              ItemSeparatorComponent={() => {
                return <View style={styles.separator} />;
              }}
              renderItem={(post) => {
                const item = post.item;
                const { navigate } = this.props.navigation;
                return (
                  <View style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View>
                        <Text style={styles.title}>{item.name}</Text>
                        <Text style={styles.price}>Giá: {item.price.toLocaleString('it-IT', { style: 'currency', currency: 'VND' })}</Text>
                        <Text style={styles.price}>Giảm: {item.discountPrice.toLocaleString('it-IT', { style: 'currency', currency: 'VND' })}</Text>
                      </View>
                    </View>

                    <Image style={styles.cardImage} source={{ uri: item.pictureURL }} />

                    <View style={styles.cardFooter}>
                      <View style={styles.socialBarContainer}>
                        <View style={styles.socialBarSection}>
                          <TouchableOpacity style={styles.socialBarButton}>
                            <Image
                              style={styles.icon}
                              source={{
                                uri: "https://img.icons8.com/nolan/96/3498db/add-shopping-cart.png",
                              }}
                            />
                            <Text onPress={() => {
                              navigator.navigate('ProductDetailAdmin', { productId: item.id })
                            }}

                              style={[styles.socialBarLabel, styles.buyNow]}
                            >
                              Chỉnh sửa
                            </Text>
                          </TouchableOpacity>
                        </View>
                        <View style={styles.socialBarSection} >
                          <TouchableOpacity style={styles.socialBarButton} onPress={() => {
                            this.confirmDeleteProduct(item.id);
                          }}>
                            <Image
                              style={styles.icon}
                              source={{
                                uri: "https://icon-library.com/images/icon-delete/icon-delete-16.jpg",
                              }}
                            />
                            <Text style={styles.socialBarLabel}>Xoá</Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                    </View>

                  </View>
                );
              }}
            />
          }


        </View>
      </>
    );

  }


}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
  },
  list: {
    paddingHorizontal: 5,
    backgroundColor: "#E6E6E6",
  },
  listContainer: {
    alignItems: "center",
  },
  separator: {
    marginTop: 10,
  },
  /******** card **************/
  card: {
    shadowColor: "#00000021",
    shadowOffset: {
      width: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    marginVertical: 8,
    backgroundColor: "white",
    flexBasis: "47%",
    marginHorizontal: 5,
  },
  cardHeader: {
    paddingVertical: 17,
    paddingHorizontal: 16,
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardContent: {
    paddingVertical: 12.5,
    paddingHorizontal: 16,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12.5,
    paddingBottom: 25,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 1,
    borderBottomRightRadius: 1,
  },
  cardImage: {
    flex: 1,
    height: 150,
    width: null,
  },
  /******** card components **************/
  title: {
    fontSize: 18,
    flex: 1,
  },
  price: {
    fontSize: 16,
    color: "green",
    marginTop: 5,
  },
  buyNow: {
    color: "purple",
  },
  icon: {
    width: 25,
    height: 25,
  },
  /******** social bar ******************/
  socialBarContainer: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    flex: 1,
  },
  socialBarSection: {
    justifyContent: "center",
    flexDirection: "row",
    flex: 1,
  },
  socialBarlabel: {
    marginLeft: 8,
    alignSelf: "flex-end",
    justifyContent: "center",
  },
  socialBarButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});
