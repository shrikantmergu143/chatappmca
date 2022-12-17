import { Text, View, Box, Center, VStack, FormControl, Input, Button, Divider, HStack, Image, Avatar, Spinner } from 'native-base'
import React, { useEffect, useLayoutEffect, useState, useRef } from 'react';
import { fetchEmailChange, fetchPassword, fetchUsername, fetchFullName, fetchFriends } from './../../../redux/action';
import {KeyboardAvoidingView, SafeAreaView, Platform, StyleSheet, Dimensions, TouchableOpacity, ScrollView, FlatList, Alert} from "react-native"
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { StatusBar } from 'expo-status-bar';
import { Entypo, FontAwesome, AntDesign, FontAwesome5, Feather, MaterialCommunityIcons, Ionicons, MaterialIcons } from "@expo/vector-icons";
import firebase from "firebase/compat";
import "firebase/compat/auth";
import { ListItem, Avatar as Avatars } from 'react-native-elements'
import "firebase/compat/firestore";
import "firebase/compat/storage";
import * as ImagePicker from 'expo-image-picker';
import { Video, AVPlaybackStatus } from 'expo-av';
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
export function UUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}
function AddUserPage(props) {
    const [load,setload] = useState(true)
    const [users,setusers] = useState(props.route.params)
    const [message, setMessage] = useState('');
    const [chatList, setChatList] = useState([]);
    const [image, setImage] = useState(null);
    const [select,setSelect] = useState('');
    const scrollViewRef = useRef();
    console.log("props.route.params.id", )

    useLayoutEffect(()=>{
        props.navigation.setOptions({
            headerTitle:"",
            headerRight:()=>select===""?(
                <HStack space={3}>
                    <TouchableOpacity>
                        <MaterialIcons name={"add-ic-call"} style={{fontSize:20}} />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Ionicons name={"ellipsis-vertical"} style={{fontSize:20}} />
                    </TouchableOpacity>
                </HStack>
            ):(
                <HStack space={6} alignItems={"center"}>
                    <TouchableOpacity onPress={()=>{
                         const data = createThreeButtonAlert()
                         console.log(data)
                        }}>
                        <AntDesign name={"back"} style={{fontSize:20}} />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <AntDesign name={"star"} style={{fontSize:20}} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>createThreeButtonAlert()}>
                        <MaterialCommunityIcons name={"delete"} style={{fontSize:20}} />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Entypo name={"forward"} style={{fontSize:20}} />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Ionicons name={"ellipsis-vertical"} style={{fontSize:20}} />
                    </TouchableOpacity>
                </HStack>
            ),
            headerLeft:()=>(
                <HStack alignItems={"center"} marginLeft={0} space={1}>
                    <Button variant={"unstyled"} ml={-4} onPress={()=>select===""?props.navigation.goBack():setSelect("")}>
                        <HStack alignItems={"center"} space={1}>
                            <AntDesign name={"left"} style={{fontSize:20, fontWeight:"900"}} />
                            {
                            select!==""?<Text style={{fontSize:16, fontWeight:'bold', marginLeft:3}}>1</Text>:
                            <Avatars size={40} rounded source={{uri:users.photoURL}}  />
                            }
                        </HStack>
                    </Button>
                    {select===""&&<ListItem.Content>
                        <ListItem.Title style={{ fontWeight: 'bold' }}>{users?.username}</ListItem.Title>
                        <ListItem.Subtitle>{users?.fullName?users?.fullName:users?.fullname}</ListItem.Subtitle>
                    </ListItem.Content>}
                </HStack>
            ),
            title:""
        })
    },[!select])

    useEffect(()=>{
        setTimeout(()=>{
            setload(false)
        },4000)
    },[]);
    useEffect(()=>{
        firebase.firestore()
        .collection("friends")
        .doc(props.route.params.id)
        .collection("message")
        .orderBy("sendAt", "asc")
        .onSnapshot((snapshot)=>{
            const chat = snapshot.docs.map((doc)=>{
                const link = `friends/${props.route.params.id}/message/${doc.id}`;
                if(doc.data()?.sendTo === firebase.auth().currentUser.uid && (! doc.data()?.seen)){
                    callAddDelivered(link, doc.data());
                }
                return {...doc.data(),id:doc.id};
            });
            setChatList(chat);
            AddSeenMessages(props.route.params.id)
        })
    },[]);

    const callAddDelivered = async (item, messages) =>{
        const Delivered = doc(db, item);
        const data ={
            ...messages
        }
        if(!data?.seen){
            data.seen = new Date().getTime()
        }
        if(!data?.delivered){
            data.delivered = new Date().getTime()
        }
        const responce = await setDoc(Delivered, data ,{ merge: true })
    }
    const AddSeenMessages = async (id) =>{
        db.collection("friends").doc(id).update({[`seen${firebase.auth().currentUser.uid}`]:[], [firebase.auth().currentUser.uid]:[]})
    }

    async function sendMessage(id){
        const uuid = UUID()
        if(message.length!==0){
            const data = {
                message:message,
                sendTo:props.route.params.uid,
                sendBy:firebase.auth().currentUser.uid,
                readBy:true,
                readTo:false,
                sendAt:new Date().getTime(),
                type:'text',
                delivered:null,
                seen:null
            }
            setMessage("")
            firebase.firestore()
            .collection("friends")
            .doc(id)
            .collection("message")
            .doc(uuid)
            .set(data);
            scrollViewRef.current.scrollToEnd({ animated: true })
            await SetMessagesData(data, id, uuid);
        }
    }
    async function SetMessagesData(data, id, uuid){
        const link = `friends/${id}/message/${uuid}`
        const colRef = doc(db, `friends/${id}`);
            await setDoc(colRef, {
                last_messages:data,
                [props.route.params.uid]:firebase.firestore.FieldValue.arrayUnion(link),
                [`seen${props.route.params.uid}`]:firebase.firestore.FieldValue.arrayUnion(link)
            },{ merge: true });
    }
    function deleteMessage(cid, id){
            firebase.firestore()
            .collection('friends')
            .doc(cid)
            .collection("message")
            .doc(id)
            .delete()
            setSelect("")
    }
   async function deleteMessageImage(cid, id, image){
            await firebase.storage().ref().child(image).delete().then(() => {
                firebase.firestore().collection('friends').doc(cid).collection("message").doc(id).delete()
                console.log("delete");
            }).catch((error) => {
                console.log("file Not Exist", error);
            });
            setSelect("")
    }
    const uploadImage = async (data) => {
        if(data.uri){
          const childPath = `message/${firebase.auth().currentUser?.uid}/${Math.random().toString(36)}`;
          const response = await fetch(data.uri);
          const blob = await response.blob();
    
          const task = firebase
              .storage()
              .ref()
              .child(childPath)
              .put(blob);
            const taskProgress = snapshot => {
                console.log(`transferred: ${snapshot.bytesTransferred}`)
            }
        
            const taskCompleted = () => {
                task.snapshot.ref.getDownloadURL().then((snapshot) => {
                  SendNewPost(snapshot, childPath, data.type);
                })
            }
        
            const taskError = snapshot => {
                console.log(snapshot)
            }
        
            task.on("state_changed", taskProgress, taskError, taskCompleted);
        }else{
          alert("await to upload")
        }
      }
    async function SendNewPost(img, childPath, type){
        const uuid = UUID()
        const data = {
            message:img,
            sendTo:props.route.params.uid,
            sendBy:firebase.auth().currentUser.uid,
            readBy:true,
            readTo:false,
            sendAt:new Date().getTime(),
            type:type,
            image:childPath
        }
        setMessage("")
        firebase.firestore()
        .collection("friends")
        .doc(props.route.params.id)
        .collection("message")
        .doc(uuid)
        .set(data);
        scrollViewRef.current.scrollToEnd({ animated: true })
        await SetMessagesData(data, props.route.params.id, uuid);
    }
    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: true,
          quality: 1,
        });
        if (!result.cancelled) {
            uploadImage(result);
        }
    };

    if(load){
        return(
            <View style={{flex:1,display:"flex",alignItems:'center',justifyContent:'center'}}>
                <Spinner size={40}/>
            </View>
        )
    }
    const createThreeButtonAlert = () =>
        Alert.alert(
        "Are You Sure",
        "Do you want to Delete?",
        [
            {
            text: "Cancel",
            onPress: () => console.log(""),
            style: "cancel"
            },
            { text: "OK", onPress: () =>  select?.type==='text'?deleteMessage(props.route.params.id,select?.id):deleteMessageImage(props?.route?.params?.id,select?.id,select?.image) }
        ]
        );
    console.log("firebase.firestore.FieldValue.serverTimestamp()", firebase.firestore)
    const ChatListItem = ({item, index})=>{
        return(
             <View
                onLayout={(event)=>{
                    const layout = event.nativeEvent.layout;
                }}
                key={index.toString()}
             >
                {item.type==="text"?
                    item?.sendBy===firebase.auth().currentUser.uid?
                        <HStack m={2} alignItems={'center'} justifyContent={"flex-end"}>
                            <TouchableOpacity onLongPress={()=>setSelect(item)}>
                                <Box   borderTopRightRadius={30} borderBottomLeftRadius={30} borderTopLeftRadius={30} paddingX={6} paddingY={3} bg={"purple.500"}>
                                    <Text color={"white"} fontSize={15}>{item.message}</Text>
                                </Box>
                            </TouchableOpacity>
                        </HStack>
                    :
                        <HStack m={2}>
                            <TouchableOpacity >

                            <Box  borderTopRightRadius={30} borderBottomRightRadius={30} borderTopLeftRadius={30} paddingX={6} paddingY={3} bg={"purple.200"}>
                                <Text color={"black"} fontSize={15}>{item.message}</Text>
                            </Box>
                            </TouchableOpacity>
                        </HStack>
                :
                item.type==="image"?
                    item?.sendBy===firebase.auth().currentUser.uid?
                        <HStack  m={2}  alignItems={'center'} justifyContent={"flex-end"}>
                            <TouchableOpacity onLongPress={()=>setSelect(item)}>
                                <Image alt={".."} source={{uri:item?.message}} style={{height:260, resizeMode: "center", width:screenWidth*0.5, borderRadius:15, shadowColor: '#666',
                                    shadowOffset: { width: 3, height: 5 },
                                    shadowOpacity: 3,
                                    shadowRadius: 10,  
                                    elevation: 5}}/>
                            </TouchableOpacity>
                        </HStack>
                    :
                        <HStack m={2}>
                            <TouchableOpacity >
                                <Image alt={".."} source={{uri:item?.message}} style={{height:260, resizeMode: "center", width:screenWidth*0.5, borderRadius:15, shadowColor: '#666',
                                    shadowOffset: { width: 3, height: 5 },
                                    shadowOpacity: 3,
                                    shadowRadius: 10,  
                                    elevation: 5}}/>
                            </TouchableOpacity>
                        </HStack>
                :item.type==="video"&&
                item?.sendBy===firebase.auth().currentUser.uid?
                        <HStack  m={2}  alignItems={'center'} justifyContent={"flex-end"}>
                            <TouchableOpacity onLongPress={()=>setSelect(item)}>
                            <Video
                            style={styles.video}
                            source={{
                            uri: item?.message,
                            }}
                            useNativeControls
                            resizeMode="contain"
                        />
                            </TouchableOpacity>
                        </HStack>
                :
                        <HStack m={2}>
                            <TouchableOpacity >
                            <Video
                                style={styles.video}
                                source={{
                                uri: item?.message,
                                }}
                                useNativeControls
                                resizeMode="contain"
                            />
                            </TouchableOpacity>
                        </HStack>
                }
            </View>
        )
    }
    return (
        <SafeAreaView style={{ flex:1}}>
            <View style={{ height:"100%", paddingBottom:70}}>
                <ScrollView
                    ref={scrollViewRef}
                    onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
                >
                {chatList?.map((item, index)=>ChatListItem({item:item, index:index}))}
                    {/* <FlatList
                        keyExtractor={(item, index) => index.toString()}
                        style={{height:"100%"}}
                        data={chatList}
                        renderItem={({item})=>ChatListItem({item:item})}
                    /> */}
                </ScrollView>
            </View>
            <View style={{position: 'absolute', left: 0, right: 0, bottom: 3, paddingTop:0,display:"flex",alignItems:'center',height:50}}>
            <HStack style={{width:screenWidth}} alignItems={'center'} justifyContent={"space-between"} paddingX={2} display={'flex'}  >
                <TouchableOpacity onPress={()=>pickImage()} style={{height:40,width:40,borderRadius:20,display:'flex',alignItems:"center",justifyContent:'center',backgroundColor:'white'}}>
                    <Entypo name={"attachment"} style={{fontSize:20}} />
                </TouchableOpacity>
                <Input placeholder={"Chat with  "+ users.username} multiline={true} onSubmitEditing={()=>sendMessage(props.route.params.id)} value={message} onChangeText={(e)=>setMessage(e)} height={39} pl={5} variant="rounded"  w="75%" bg={"white"}/>
                <TouchableOpacity onPress={()=>sendMessage(props.route.params.id)} style={{height:40,width:40,borderRadius:20,display:'flex',alignItems:"center",justifyContent:'center'}}>
                    <MaterialCommunityIcons name={"send"} style={{fontSize:26, color:"#147df1"}} />
                </TouchableOpacity>
            </HStack>
            </View>
        </SafeAreaView>
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
        width: screenWidth*0.5,
        height: 200,
      },
});

const mapStateToProps = (store) => ({})
const mapDispatchProps = (dispatch) => bindActionCreators({ fetchEmailChange, fetchFriends  }, dispatch);
 
export default connect(mapStateToProps, mapDispatchProps)(AddUserPage);