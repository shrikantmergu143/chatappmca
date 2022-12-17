import React,{ useEffect, useLayoutEffect } from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import firebase from 'firebase/compat'
import { Entypo, FontAwesome, FontAwesome5, Ionicons } from '@expo/vector-icons'
import { connect } from 'react-redux'
import { StyleSheet, View,Text, Image,TextInput, Button,Dimensions,TouchableOpacity,ScrollView, Pressable, LogBox} from 'react-native'
import { bindActionCreators } from 'redux'
import { fetchUser, fetchAllUser, fetchFriends, DeleteFriendList, CallFetchFriendList, fetchFriendsState, FetchContactList, fetchrequestFriends } from './../redux/action/index';
import HomeScreen from "./main/HomePage/HomePage";
import { HStack, VStack, Box, Popover, Menu } from 'native-base';
import StatusPage from './main/StatusPage/StatusPage';
import MenuBarPage from "./main/MenuBar/MenuBarPage";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, addDoc, query, where, doc, getDoc } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from '../config/Firebase';

export const getRecipientEmail = (users, userLoggedIn) => users?.find((userToFilter) => userToFilter !== userLoggedIn);

const Tab = createMaterialTopTabNavigator();
LogBox.ignoreLogs(['Setting a timer']);

const screenWidth = Dimensions.get("window").width
const screenHeight = Dimensions.get("window").height
export const BlackComponent=()=>{
  return(null)
}

function Main(props){
  const userChatRef = query( 
    collection(db, "friends"),
    where("users", "array-contains", firebase.auth().currentUser.uid)
  );
  const [chatsSnapshot] = useCollection(userChatRef);
  const ContactFrd = chatsSnapshot?.docs?.map((item)=>({
    user_id:item.data().users.find((user) => user !== firebase.auth().currentUser.uid),
    id:item.id,
  }));
// const chatAlreadyExists = (recipientEmail) =>
  useLayoutEffect(()=>{
    props.navigation.setOptions({
      headerShown :true,
      headerTitle:"ChatHub",
      headerTitleStyle:{
        fontFamily:"font",
        fontSize:25
      },
      headerStyle:{
            borderBottomWidth: 0,
            borderBottomColor:"white"
      }, 
      headerShadowVisible: false,
      headerRight:()=>(
        <HStack marginRight={0} alignItems={"center"}>
            <TouchableOpacity onPress={()=>props.navigation.navigate("AddUser")} >
                <FontAwesome name={"user-plus"} style={{fontSize:20}} />
            </TouchableOpacity>
            {/* <TouchableOpacity onPress={()=>props.navigation.navigate("Menu")} style={{marginLeft:15}} >
                <Ionicons name={"ellipsis-vertical"} style={{fontSize:20}} />
            </TouchableOpacity> */}
           <MenuBarPage {...props}/>
        </HStack>
      )
    })
  },[!props.navigation]);

  useEffect(()=>{
    props.fetchUser();
    props.fetchAllUser();
    props.fetchFriends();
  },[!props.currentUser]);

  useEffect(()=>{
    props?.CallFetchFriendList(ContactFrd);
    // callFetchUsers();
  },[!ContactFrd]);
  
  // useEffect(()=>{
  //   callFetchUsers()
  // },[props?.friendlist]);

  const callFetchUsers = async() =>{
    // ContactFrd?.map(async(item)=>{
    //   const userChatRef = doc(db, `users/${item.user_id}`);
    //   const chatsSnapshot = await getDoc(userChatRef);
    //   props?.FetchContactList({...chatsSnapshot?.data(), friend_id:item?.id});
    // });
    // props?.ContactList?.map((item)=>{
    //   const result = ContactFrd?.filter((item1)=>item1.id === item.friend_id)?.length>0?true:false;
    //   if(result === false){
    //     props?.DeleteFriendList(item);
    //   }
    // });
  }

    return(
      <Tab.Navigator initialRouteName="Home"
        screenOptions={{ 
            tabBarColor:"white",
            tabBarLabelStyle: { fontSize: 15, fontWeight:"800"},
            tabBarItemStyle:{fontWeight:"800", fontSize:58},
            tabBarActiveTintColor: '#007eee',
            tabBarStyle: { backgroundColor: 'white',borderBottomColor:'grey', borderTopColor:'white',borderTopColor:0 },
            tabBarInactiveTintColor:'grey',

        }}
        style={{width:screenWidth,backgroundColor:"white"}} labeled={true }>
            <Tab.Screen  initialParams={props} name="Home" component={HomeScreen} options={{title:"Chats", }}/>
            <Tab.Screen name="Search" component={StatusPage} options={{title:"Status"}}/>
            <Tab.Screen name="Postss" component={HomeScreen} options={{title:"Calls"}} />
      </Tab.Navigator>
    )
}

const mapStateToProps = (store) => ({
  currentUser: store.userState.currentUser,
  usersList: store.usersState.usersList,
  friends:store.userState.friends,
  friendlist:store.usersState.friendlist,
  ContactList:store.usersState.ContactList,
})
const mapDispatchProps = (dispatch) => bindActionCreators({ fetchUser, DeleteFriendList, CallFetchFriendList, FetchContactList, fetchAllUser, fetchFriends, fetchFriendsState, fetchrequestFriends }, dispatch);

export default connect(mapStateToProps, mapDispatchProps)(Main);