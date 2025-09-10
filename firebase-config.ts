import { getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth, initializeAuth } from "firebase/auth";
// import { Auth, getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAUlD-G3S3LPjY9Su7v4sTlJMXOw72nmnE",
  authDomain: "greeb-transcript.firebaseapp.com",
  projectId: "greeb-transcript",
  storageBucket: "greeb-transcript.firebasestorage.app",
  messagingSenderId: "475668014214",
  appId: "1:475668014214:web:212b2af3e73e0b2d7ddd07",
  measurementId: "G-L2CKRBP7Z3"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
// const auth = getAuth(app);
let auth: Auth;
try {
    // auth = initializeAuth(app, {
    //     persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    // })
    auth = initializeAuth(app)

} catch {
  auth = getAuth(app);
}

const firestore = getFirestore(app);

export { app, auth, firestore };


// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyAUlD-G3S3LPjY9Su7v4sTlJMXOw72nmnE",
//   authDomain: "greeb-transcript.firebaseapp.com",
//   projectId: "greeb-transcript",
//   storageBucket: "greeb-transcript.firebasestorage.app",
//   messagingSenderId: "475668014214",
//   appId: "1:475668014214:web:212b2af3e73e0b2d7ddd07",
//   measurementId: "G-L2CKRBP7Z3"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

