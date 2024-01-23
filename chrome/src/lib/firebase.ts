'use client';

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: 'AIzaSyC2RnLU6JuD8laqwhwKz81gYRxMChuu_es',
    authDomain: 'pomotimer-fe5c2.firebaseapp.com',
    projectId: 'pomotimer-fe5c2',
    storageBucket: 'pomotimer-fe5c2.appspot.com',
    messagingSenderId: '181805257103',
    appId: '1:181805257103:web:6e8cd9127a6c22274d7bfa',
    measurementId: 'G-WWXJ6D4W6B',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// const analytics = getAnalytics(app);
