import { Text, View, Box, Center, VStack, FormControl, Input, Button, Divider, HStack, Menu } from 'native-base'
import React, { useLayoutEffect, useState } from 'react';
import { fetchEmailChange, fetchPassword, fetchUsername, fetchFullName } from './../../../redux/action';
import {KeyboardAvoidingView, Platform, StyleSheet, Dimensions, TouchableOpacity} from "react-native"
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import firebase from "firebase/compat";
import "firebase/compat/auth";
import "firebase/compat/firestore"
const screenWidth = Dimensions.get("window").width
const screenHeight = Dimensions.get("window").height

function AddUserPage(props) {

    return (
      <Menu  w="180"  style={{
              position:"relative",
              top:40,
              right:2,
              backgroundColor:"white"
            }} trigger={triggerProps => {
                return <TouchableOpacity  style={{marginLeft:15}} accessibilityLabel="More options menu" {...triggerProps}>
                         <Ionicons name={"ellipsis-vertical"} style={{fontSize:20}} />
                      </TouchableOpacity>;
              }}>
            <Menu.Item onPress={()=>props.navigation.navigate("AddUser")} style={{borderBottomColor:"whitesmoke",borderBottomWidth:1}}>
                <FontAwesome name={"user-plus"} style={{fontSize:16,color:"grey"}}  />
                <Text ml={1} fontSize={14} fontWeight={"bold"}>Add Friend</Text>
            </Menu.Item>
            <Menu.Item style={{borderBottomColor:"whitesmoke",borderBottomWidth:1}}>
                <FontAwesome name={"user"} style={{fontSize:16,color:"grey"}}  />
                <Text ml={1} fontSize={14} fontWeight={"bold"}>Personal Account</Text>
            </Menu.Item>
            <Menu.Item style={{borderBottomColor:"whitesmoke",borderBottomWidth:1}}>
                <Ionicons name={"settings-outline"} style={{fontSize:16,color:"grey"}}  />
                <Text ml={1} fontSize={14} fontWeight={"bold"}>Setting Account</Text>
            </Menu.Item>
            <Menu.Item onPress={()=>firebase.auth().signOut()} style={{borderBottomColor:"whitesmoke",borderBottomWidth:1}}>
                <Ionicons name={"log-out-outline"} style={{fontSize:16,color:"grey"}}  />
                <Text ml={1} fontSize={14} fontWeight={"bold"}>Log Out</Text>
            </Menu.Item>
      </Menu>
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
    email:store.userState.email,
})
const mapDispatchProps = (dispatch) => bindActionCreators({ fetchEmailChange,  }, dispatch);
 
export default connect(mapStateToProps, mapDispatchProps)(AddUserPage);