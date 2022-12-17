import firebase from 'firebase/compat/app';
import "firebase/compat/auth";
require('firebase/compat/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyAazTQtbVUpAKbNvbX-7Lq9-DOHCSYmOkc",
    authDomain: "my-instagram-clone-143.firebaseapp.com",
    databaseURL: "https://my-instagram-clone-143-default-rtdb.firebaseio.com",
    projectId: "my-instagram-clone-143",
    storageBucket: "my-instagram-clone-143.appspot.com",
    messagingSenderId: "90861503110",
    appId: "1:90861503110:web:9a57a27fdcad76912a8707"
};

firebase.initializeApp(firebaseConfig);
export const db = firebase.firestore();
const auth = firebase.auth();
export default auth;