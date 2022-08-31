
import {initializeApp} from 'firebase/app'
import  {getFirestore} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCBnQolzAP6c_OoOpVr8EwxGcMTT9nGeRw",
  authDomain: "finalproject2181212.firebaseapp.com",
  projectId: "finalproject2181212",
  storageBucket: "finalproject2181212.appspot.com",
  messagingSenderId: "593180577809",
  appId: "1:593180577809:web:4c11a883cc8742d78de1b0"
  };


export const app=initializeApp(firebaseConfig);
export const db=getFirestore();
  