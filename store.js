// import { createStore, applyMiddleware } from "redux";
import { legacy_createStore as createStore, applyMiddleware } from "redux";
import { combineReducers } from "redux";
import thunk from "redux-thunk";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { user } from "./redux/reducers/user";
import { users } from "./redux/reducers/users";
import AsyncStorage from '@react-native-async-storage/async-storage';

// const initialState = {};

const persistConfig = {
  key: "chathub-store",
  storage
};
const middleware = [thunk];

const rootReducer = combineReducers({
  userState: user,
  usersState: users
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = createStore(persistedReducer, applyMiddleware(...middleware));

export const persistor = persistStore(store);

export default store;
