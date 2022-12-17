import {  FETCH_CONTACT_LIST, DELETE_CALL_FRIEND_LIST_USERS, FETCH_CALL_FRIEND_LIST_USERS, CLEAR_DATA, FETCH_ALL_USER_STATE_CHANGE,FETCH_FRIENDS_STATE_CHANGE  } from "./../constants/index"

const initialState = {
    usersList:[],
    friendsList:[],
    ContactList:[],
    friendlist:[]
}

export const users = (state = initialState, action) => {
    switch (action.type) {
        case CLEAR_DATA:
            return initialState;
        case FETCH_ALL_USER_STATE_CHANGE:
            return {...state,usersList:action.payload}
        case FETCH_FRIENDS_STATE_CHANGE:
            return{
                ...state,
                usersList:state.usersList.map((res)=>
                    res.uid===action.uid ? {...res, status:action.status} : res
                )
            }
        case FETCH_CONTACT_LIST:
            return{
                ...state,
                ContactList:action.payload
            }
        case FETCH_CALL_FRIEND_LIST_USERS:
            return{
                ...state,
                friendlist:action?.payload
            }
        case DELETE_CALL_FRIEND_LIST_USERS:
            console.log( action?.payload)
            return{
                ...state,
                ContactList:state?.ContactList?.filter((item)=>item?.id !== action?.payload)
            }
        default:
            return state;
    }
}