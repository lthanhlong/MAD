import React, { Component } from 'react';
import { db } from '../Core/FirebaseConfig';

import { createStackNavigator } from '@react-navigation/stack';

import { doc, collection, onSnapshot } from 'firebase/firestore';
import {
    Box, Heading, VStack, FormControl, Input, HStack,
    IconButton, Icon, MaterialCommunityIcons, Button, Link, Text, View, Center, ScrollView, Stack, Divider
} from "native-base";
import { NavigationHelpersContext } from '@react-navigation/native';



class DashBroadComponent extends Component {
    constructor(props){
        super(props);

    }
  
    render() {
        const { navigate } = this.props.navigation;
        return (
            <ScrollView showsVerticalScrollIndicator={false} px="3">
                <VStack w="100%" space={4} px="2" mt="4" alignItems="center" justifyContent="center">

                    <Heading size="md">Danh mục</Heading>
                    <Stack mb="2.5" mt="1.5" direction={{
                        base: "column",
                        md: "row"
                    }} space={2} mx={{
                        base: "auto",
                        md: "0"
                    }}>
                        <Button onPress={() => navigate('ManageProduct')} size="sm" variant="subtle">
                            <Text>Quản lý sản phẩm</Text>
                        </Button>
                        <Button onPress={()=>navigate('ManageEmployee')} size="sm" variant="subtle" colorScheme="secondary">
                            <Text>Quản lý nhân viên</Text>
                        </Button>
                    </Stack>
                    <Divider />
                </VStack>
            </ScrollView>
        );
    }
}

export default DashBroadComponent