import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBqnRM3r1q_kIfzS9L2Mw0O2WrzdTiTxvY",
    authDomain: "ggastos-ef46a.firebaseapp.com",
    projectId: "ggastos-ef46a",
    storageBucket: "ggastos-ef46a.appspot.com",
    messagingSenderId: "193615222628",
    appId: "1:193615222628:web:dcf323fda96bdc94fb4c71",
    databaseURL: "https://ggastos-ef46a-default-rtdb.firebaseio.com"
};


const app = initializeApp(firebaseConfig)
const database = getDatabase(app)
const auth = getAuth(app)


export {database, auth}