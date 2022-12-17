import { Text, View, Box, Center, VStack, FormControl, Input, Button, Divider, Icon, HStack, FlatList, Avatar, Spinner, useToast } from 'native-base'
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { fetchAllUser, fetchFriendsState, fetchFriends,fetchrequestFriends, fetchUser, DeleteFriendList } from './../../../redux/action';
import {KeyboardAvoidingView, Platform, StyleSheet, Dimensions, TouchableOpacity} from "react-native"
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome, Feather } from "@expo/vector-icons";
import firebase from "firebase/compat";
import "firebase/compat/auth";
import { Button as Buttons } from 'react-native-elements';
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, addDoc, query, where, deleteDoc, doc } from "firebase/firestore";
import auth from "./../../../config/Firebase"
import { useCollection } from "react-firebase-hooks/firestore";
import "firebase/compat/firestore"
import { db } from '../../../config/Firebase';
const screenWidth = Dimensions.get("window").width
const screenHeight = Dimensions.get("window").height

function AddUserPage(props) {
    let [user] = useAuthState(auth);
    let userChatRef = query(
        collection(db, "friends"),
        where("users", "array-contains", firebase.auth().currentUser.uid)
    );
    let [chatsSnapshot] = useCollection(userChatRef);
    let FriendList = chatsSnapshot?.docs.map((chat) =>({...chat.data(), friend_id:chat.id}));
    let chatAlreadyExists = (recipientEmail) =>
    !!chatsSnapshot?.docs.find((chat) =>{
        return chat.data().users.find((user) => user === recipientEmail) !== undefined
    });
    let [sendFriend, setStatus] = useState(chatAlreadyExists(props.uid))
    let [load,setload] = useState(false)
    let toast = useToast();
    // useEffect(()=>{
    //     setStatus(chatAlreadyExists(props.uid))
    // },[chatsSnapshot]);

    function AddFriend(uid){
        const user_id = firebase.auth().currentUser.uid
        // toast.show({ title: "Friend added soon please go back it require time to procced",placement: "bottom"})
        setload(true)
        // setStatus(true)
        // db.collection("users").doc(firebase.auth().currentUser.uid).update({friends:firebase.firestore.FieldValue.arrayUnion(uid)})
        // db.collection("friends").add({users:[uid, firebase.auth().currentUser.uid]})
        const col = collection(db, "friends");
        addDoc(col, {
            users: [uid, firebase.auth().currentUser.uid],
            [uid]:[],
            [user_id]:[],
            seen:{
                [uid]:[],
                [user_id]:[],
            },
            [`seen${uid}`]:[],
            [`seen${user_id}`]:[],
            last_messages:{
                message:"",
                sendTo:"",
                sendBy:"",
                readBy:"",
                readTo:"",
                sendAt:new Date(),
                type:''
            }
        });
        setStatus(true)

        // db.collection("users").doc(uid).update({friends:firebase.firestore.FieldValue.arrayUnion(firebase.auth().currentUser.uid)})
        // db.collection("userfriend").doc(firebase.auth().currentUser.uid).collection("friends").doc(uid).set({})
        setTimeout(()=>setload(false), 1000)
    }
    //    console.log("chatID", FriendList, props)
    async function DeleteFriend(id){
        setload(true)
        // setStatus(false)
       const chatID =  FriendList?.map(async(item)=>{
            item?.users?.map(async(user)=>{
                if(user === id){
                    await db.collection("friends").doc(item.friend_id).delete();
                    props?.DeleteFriendList(id);
                    setStatus(false)
                }
            })
       });
    //    if(chatID?.length>0){
    //         if(chatID[0].friend_id){
    //             await db.collection("friends").doc(chatID[0].friend_id).delete();
    //             props?.DeleteFriendList(id);
    //             setStatus(false)
    //         }
    //    }
        
        // const send =  props.friend.find(res=>res.uid===props.uid?res.id:false);
        // if(send.id){
        //     // db.collection("userfriend").doc(firebase.auth().currentUser.uid).collection("friends").doc(id).delete()
        //     // db.collection("users").doc(firebase.auth().currentUser.uid).update({friends:firebase.firestore.FieldValue.arrayRemove(id)})
        //     // db.collection("friends").doc(send.id).delete();
        //     const col = doc(db, `friends/${send.id}`);
        //     deleteDoc(col);
        //     // db.collection("users").doc(id).update({friends:firebase.firestore.FieldValue.arrayRemove(firebase.auth().currentUser.uid)})
        // }
        setTimeout(()=>setload(false), 1000)
    }

    
    return (
        <HStack borderBottomColor={"whitesmoke"} justifyContent={"space-between"} borderBottomWidth={1} paddingX={3} padding={4} alignItems={"center"}>
            <HStack>
                <Avatar size={"40px"} source={{uri:props?.photoURL}} />
                <VStack ml={3}>
                    <Text fontWeight={"bold"} fontSize={16}>{props?.fullName?props?.fullName:props?.fullname}</Text>
                    <Text>{props?.username}</Text>
                </VStack>
            </HStack>
            {load === true?
            (
                <Buttons
                    loading={true}
                    loadingStyle={{width:100, height:15}}
                /> 
            )
            :(chatAlreadyExists(props.uid)?
               <HStack  justifyContent={"flex-end"} space={1}>
                    <Buttons
                        onPress={()=>DeleteFriend(props?.uid)} 
                        icon={
                        <FontAwesome name={"times"} style={{color:'black', fontSize:18,}} />
                        }
                        buttonStyle={{backgroundColor:"white", }}
                    />
                    <Buttons
                        icon={
                            <Feather name={"user-check"} style={{ fontSize:14,marginRight:10, color:'white'}} />
                        }
                        loading={load}
                        title={"Added"}
                        iconPosition={'left'}
                        titleStyle={{fontSize:14}}
                        buttonStyle={{paddingLeft:14, paddingRight:14}}
                        loadingStyle={{width:80, height:15}}
                    />
               </HStack>
                :
                <Buttons
                    onPress={()=>AddFriend(props.uid)}
                    icon={
                        <Feather name={"user-plus"} style={{ fontSize:14,marginRight:10, color:'white'}} />
                    }
                    loading={load}
                    title={"Add Freind"}
                    iconPosition={'left'}
                    titleStyle={{fontSize:14}}
                    buttonStyle={{paddingLeft:14, paddingRight:14}}
                    loadingStyle={{width:80, height:15}}
                />
            )}
        </HStack>
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
    currentUser:store.userState.currentUser,
})
const mapDispatchProps = (dispatch) => bindActionCreators({ fetchAllUser, DeleteFriendList, fetchFriends, fetchFriendsState, fetchrequestFriends, fetchUser}, dispatch);
 
export default connect(mapStateToProps, mapDispatchProps)(AddUserPage);