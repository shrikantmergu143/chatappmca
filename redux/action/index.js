import {  CLEAR_DATA, DELETE_CALL_FRIEND_LIST_USERS, EMAIL_STATE_CHANGE, FETCH_CALL_FRIEND_LIST_USERS, FETCH_CONTACT_LIST, FETCH_FRIENDS_STATE_CHANGE, FETCH_USER_FREINDS_STATE_CHNAGE, PASSWORD_STATE_CHANGE,FETCH_USER_FRIENDS_TATE_CHANGE, FETCH_ALL_USER_STATE_CHANGE, FULLNAME_STATE_CHANGE, USERNAME_STATE_CHANGE, USER_STATE_CHANGE } from "./../constants/index"
import firebase from "firebase/compat"
import "firebase/compat/auth";
import "firebase/compat/firestore";

export function fetchEmailChange (data){
    return((dispatch)=>{
        dispatch({type:EMAIL_STATE_CHANGE,payload:data});
    })
}
export function fetchPassword (payload){
    return((dispatch)=>{
        dispatch({type:PASSWORD_STATE_CHANGE,payload:payload});
    })
}
export function fetchFullName (payload){
    return((dispatch)=>{
        dispatch({type:FULLNAME_STATE_CHANGE,payload:payload});
    })
}
export function fetchUsername (payload){
    return((dispatch)=>{
        dispatch({type:USERNAME_STATE_CHANGE,payload:payload});
    })
}
export function fetchUser(){
    return((dispatch)=>{
        firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid).get().then((user)=>{
            if(user.exists){
                dispatch({type:USER_STATE_CHANGE,payload:user.data()})
            }else{
                console.log("user not authorisend")
            }
        })
    })
}
export function fetchAllUser(){
    return((dispatch, getState)=>{
        firebase.firestore().collection("users")
        .where("uid", "!=", firebase.auth().currentUser.uid)
        .onSnapshot((snapshot)=>{
            const usersList = snapshot.docs.map((doc)=>{
                const data = doc.data()
                const status = getState().userState?.currentUser?.friends?.find((res)=> res===data.uid);
                if(status){
                    return{ ...doc.data(),status:true}
                }
               else{
                return{ ...doc.data(),status:false}
               }
            })
            dispatch({type:FETCH_ALL_USER_STATE_CHANGE,payload:usersList})
            dispatch(fetchFriends())
        })
    })
}
export function fetchFriends(){
    return((dispatch,getState)=>{
       firebase.firestore()
       .collection("friends")
       .where("users", "array-contains", firebase.auth().currentUser.uid)
       .onSnapshot((snapshot)=>{
           const friends = snapshot.docs.map((doc)=>{
               const uid = doc.data().users.find((res)=>res!==firebase.auth().currentUser.uid)
               const users = getState().usersState.usersList.find((item)=>item.uid === uid);
               return{...doc.data(),id:doc.id,...users}
           })
           dispatch({type:FETCH_USER_FRIENDS_TATE_CHANGE, payload:friends})
       })
    })
}
export function fetchrequestFriends(){
    return((dispatch,getState)=>{
        firebase.firestore()
        .collection("friends")
        .where("users", "array-contains", firebase.auth().currentUser.uid)
        .onSnapshot((snapshot)=>{
            const friends = snapshot.docs.map((doc)=>{
                return{...doc.data()}
            }) 
            dispatch({type:FETCH_USER_FREINDS_STATE_CHNAGE, payload:friends})
        })
    })
}
export function fetchFriendsState(){
    return((dispatch,getState)=>{
       const data = getState().userState.friends;
       data.map((res)=>{
           res.uid!==firebase.auth().currentUser.uid &&
           dispatch({type:FETCH_FRIENDS_STATE_CHANGE,status:res.status,uid:res.uid})
       })
    })
}
export function FetchContactList(user){
    return((dispatch, getState)=>{
        const data = getState()?.usersState?.ContactList;
        const CheckUser = data?.filter((item)=>item.uid === user?.uid);
        if(CheckUser?.length === 0){
            data?.push(user)
            dispatch({type:FETCH_CONTACT_LIST,payload:data})
        }else{
            const AllUsers = data?.map((item)=>{
                if(item.uid === user?.uid){
                    return user;
                }else{
                    return item;
                }
            })
            dispatch({type:FETCH_CONTACT_LIST,payload:AllUsers})
        }        
    })
}
export function CallFetchFriendList(user){
    return((dispatch)=>{
        dispatch({type:FETCH_CALL_FRIEND_LIST_USERS, payload:user});
    })
}
export function DeleteFriendList(user){
    return((dispatch)=>{
        dispatch({type:DELETE_CALL_FRIEND_LIST_USERS, payload:user});
    })
}