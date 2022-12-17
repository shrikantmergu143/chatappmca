import { Text, View, Box, Center, VStack, Pressable, Input, Button, Spacer, HStack, Avatar, FlatList, Spinner, ScrollView } from 'native-base'
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { fetchEmailChange, fetchPassword, fetchUsername, fetchFullName, fetchFriends } from './../../../redux/action';
import {KeyboardAvoidingView, Platform, StyleSheet, Dimensions, TouchableOpacity, Image} from "react-native"
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome } from "@expo/vector-icons";
import firebase from "firebase/compat";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import moment from 'moment';
import { Video, AVPlaybackStatus } from 'expo-av';
import { ListItem, Avatar as Avatars } from 'react-native-elements'
  import { Badge } from 'react-native-elements'
  import {    db  } from '../../../config/Firebase';
import {
    collection,
    doc,
    orderBy,
    query,
    setDoc,
    Timestamp,
    addDoc,
    where,
    updateDoc
  } from "firebase/firestore";
const screenWidth = Dimensions.get("window").width
const screenHeight = Dimensions.get("window").height

function AddUserPage(props) {
    const {last_messages} = props?.users;
    const Users_id = firebase.auth().currentUser.uid;
    const DeliveredMessages = props?.users[Users_id];
    const UnSeen = props?.users[`seen${Users_id}`];
    const UsersSeen = props?.users[`seen${props?.users?.uid}`];
    const UsersSeenDelivered = props?.users[props?.users?.uid];
    const Delivered = props?.users[Users_id];
    console.log("props", UnSeen)
    // useEffect(()=>{
    //     firebase.firestore()
    //     .collection("friends")
    //     .doc(props.users.id)
    //     .collection("last_messages")
    //     .orderBy("sendAt", "desc")
    //     .onSnapshot((snapshot)=>{
    //         const data = snapshot.docs.map((doc)=>{
    //             return {...doc.data(), id:doc.id};
    //         })
    //         if(data.length!==0){
    //             setMessage(data[0]);
    //         }
    //         else{
    //             setMessage({})
    //         }
    //     })
    // },[!last_messages])
    useEffect(()=>{
        if(DeliveredMessages){
            callAddDelivered()
        }
    },[]);
    const callAddDelivered = async () =>{
        // if(DeliveredMessages?.length>0){
        //     DeliveredMessages?.map(async(item)=>{
        //         const Delivered = doc(db, item);
        //         await setDoc(Delivered, {
        //             delivered:new Date().getTime()
        //         },{ merge: true });
        //     })
        //     db.collection("friends").doc(props?.users?.id).update({[Users_id]:[]})
        // }
    }
    function toDate(unix_timestamp) {
        let date = new Date(unix_timestamp * 1000);
        let currentDate = new Date();
        const timeDiff = currentDate.getTime() - date.getTime();
      
        if (timeDiff <= (24 * 60 * 60 * 1000)) {
          //Today
          return moment.utc(date).local().format('h:mm A');
        } else if (timeDiff <= (48 * 60 * 60 * 1000)) {
          // Yesterday
          return "Yesterday"
        }else if(timeDiff <=  (168 * 60 * 60 * 1000)) {
          // Less than week
          return moment.utc(date).local().format('dddd')
        } else {
          return moment.utc(date).local().format("DD/MM/YYYY")
        }
      }
    return (
        <ListItem
            leftContent={
                <Button
                style={styles.shadowProp}  width={"100%"} 
            >Delete</Button>
            }
            rightContent={
                <Button
                   style={styles.shadowProp} bgColor={"red.500"}
                >Delete</Button>
              }
            key={props?.users?.uid}
            onPress={()=>props?.navigation.navigate("Message",{...props?.users})} 
            tension={100}
            topDivider
            pad={10}
            animation
        >
            <Avatars size={40} rounded source={{uri:props?.users.photoURL}} />
            <ListItem.Content>
                <ListItem.Title style={{ fontWeight: 'bold', fontSize:18 }}>{props?.users.username}</ListItem.Title>
                <ListItem.Subtitle>
                {last_messages?.message ? (
                    last_messages.type==="text"?
                    <Text >{last_messages?.message}</Text>
                    :
                    last_messages.type==="image"?<Image source={{uri:last_messages?.message}} style={{height:20, width:26, borderRadius:5, borderColor:"whitesmoke", borderWidth:1}} />
                    :
                    last_messages.type==="video"&&
                    <Text>Video</Text>
                ):props?.users.fullname}
                </ListItem.Subtitle>
            </ListItem.Content>
            {last_messages?.sendAt&&
              <Text style={{position: 'absolute', top: 15, right: 20}} fontSize="xs" color="coolGray.800" _dark={{ color: 'warmGray.50'}} alignSelf="flex-start">{toDate(last_messages?.sendAt)}</Text>
            }
            {UnSeen?.length>0 && 
              <Badge value={UnSeen?.length} status="primary" 
                containerStyle={{ position: 'absolute', bottom: 15, right: 20 }}
              />}
        </ListItem>
    )
}
const styles = StyleSheet.create({
    form: {
        flex: 1,
        justifyContent: 'space-between',
        width: "100%",
        height: "100%"
    },
    video: {
        alignSelf: 'center',
        width: screenWidth*0.1,
        height: 20,
      },
    username:{
        fontSize:16,
        lineHeight:28
    },
    shadowProp: {
        shadowColor: "#000",
        shadowOffset:{  width: 10,  height: 10,  },
        shadowOpacity: 0.32,
        shadowRadius: 5.46,
        elevation: 9,
        hight:"100%"
      },
    
});

const mapStateToProps = (store) => ({
  friends:store.userState.friends,
})
const mapDispatchProps = (dispatch) => bindActionCreators({ fetchEmailChange, fetchFriends  }, dispatch);
 
export default connect(mapStateToProps, mapDispatchProps)(AddUserPage);