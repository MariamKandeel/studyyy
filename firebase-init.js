// BlueFlow Firebase connection
// Firebase configuration for project: studyyy-2005
const firebaseConfig = {
  apiKey: "AIzaSyBMiNegcDmkWuc9RNqtZ7ueteaqDuwao0s",
  authDomain: "studyyy-2005.firebaseapp.com",
  projectId: "studyyy-2005",
  storageBucket: "studyyy-2005.firebasestorage.app",
  messagingSenderId: "314544907104",
  appId: "1:314544907104:web:ea1d46623d79941e137405",
  measurementId: "G-75E4CGZZ4G"
};

firebase.initializeApp(firebaseConfig);
const blueflowAuth = firebase.auth();
const blueflowDb = firebase.firestore();

window.BlueFlowFirebase = {
  auth: blueflowAuth,
  db: blueflowDb,
  tasksCollection(uid) {
    return blueflowDb.collection("users").doc(uid).collection("tasks");
  },
  eventsCollection(uid) {
    return blueflowDb.collection("users").doc(uid).collection("events");
  }
};
