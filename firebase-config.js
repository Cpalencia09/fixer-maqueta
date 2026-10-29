// Pega aquí la configuración web de tu proyecto Firebase
// (Consola de Firebase → Configuración del proyecto → Tus apps → Web → firebaseConfig).
// Estos valores son públicos por diseño. La seguridad la dan las reglas de Firestore.
// Mientras apiKey empiece por "TU_", la app funciona en modo demo, sin servidor.
window.FIREBASE_CONFIG = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};
