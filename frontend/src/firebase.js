import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBizCrIEm1z3HEa8tdzkgx7Ti7RxwQx3Tk",
  authDomain: "karigarr-pk.firebaseapp.com",
  projectId: "karigarr-pk",
  storageBucket: "karigarr-pk.firebasestorage.app",
  messagingSenderId: "253604079473",
  appId: "1:253604079473:web:951aeee1960dc59df738d0",
  measurementId: "G-EE1T2M403F",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
