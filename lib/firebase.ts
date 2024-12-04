import { initializeApp } from "firebase/app";
import { getFirestore} from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDO0iDxevRiR-rStHbog_5hvQWrdzwi0jI",
  authDomain: "task-managed.firebaseapp.com",
  projectId: "task-managed",
  storageBucket: "task-managed.firebasestorage.app",
  messagingSenderId: "904248646252",
  appId: "1:904248646252:web:f3b031e169ec450bc25649"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app)

