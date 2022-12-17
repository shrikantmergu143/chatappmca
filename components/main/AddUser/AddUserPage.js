import { Text, View, Box, Center, VStack, FormControl, Input, Button, Divider, HStack, FlatList, Avatar, Spinner } from 'native-base'
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { fetchAllUser, fetchFriends, fetchUser } from './../../../redux/action';
import {KeyboardAvoidingView, Platform, StyleSheet, Dimensions, TouchableOpacity} from "react-native"
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome } from "@expo/vector-icons";
import firebase from "firebase/compat";
import "firebase/compat/auth";
import "firebase/compat/firestore"
import UserListPage from '../UserList/UserListPage';
import { collection, addDoc, query, where, deleteDoc, doc } from "firebase/firestore";
import auth from "./../../../config/Firebase"
import { db } from '../../../config/Firebase';
import { useCollection } from "react-firebase-hooks/firestore";
const screenWidth = Dimensions.get("window").width
const screenHeight = Dimensions.get("window").height

function AddUserPage(props) {
    const [load, setload] = useState(false);
    const colRef = collection(db, `users`);

    // PREP the messages on the server
    const messagesQuery = query(colRef, where("uid", "!=", firebase.auth().currentUser.uid));
    const [chatsSnapshot] = useCollection(messagesQuery);
    const chatAlreadyExists = () => {
        return chatsSnapshot?.docs?.map((chat) =>({...chat.data()}));
    }
    useLayoutEffect(()=>{
        props.navigation.setOptions({
          headerShown :true,
          headerTitle:()=>(
              <View width={"100%"} >
                  <Text fontSize={16} >Find and Add friends</Text>
              </View>
          ),
          headerTitleStyle:{
            fontFamily:"font",
            fontSize:25
          },
          headerStyle:{
                borderBottomWidth: 0,
                borderBottomColor:"white"
          },
          headerShadowVisible: true
        })
    },[!props.navigation])
    if(load){
        return(
            <View style={{flex:1,display:"flex",alignItems:'center',justifyContent:'center'}}>
                <Spinner size={40}/>
            </View>
        )
    }
    return (
        <KeyboardAvoidingView behavior="padding" style={styles.form}>
            <VStack bg={"white"}>
                <FlatList
                    data={chatsSnapshot?.docs}
                    renderItem={({item})=>(
                        <UserListPage {...item.data()} />
                    )}
                />
            </VStack>
        </KeyboardAvoidingView>
    )
}
const styles = StyleSheet.create({
    form: {
        flex: 1,
        justifyContent: 'space-between',
        width: "100%",
        height: "100%"
    },
});

const mapStateToProps = (store) => ({
    usersList: store.usersState.usersList,
})
const mapDispatchProps = (dispatch) => bindActionCreators({ fetchAllUser,fetchUser, fetchFriends  }, dispatch);
 
export default connect(mapStateToProps, mapDispatchProps)(AddUserPage);