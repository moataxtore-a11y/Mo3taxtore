import toast from 'react-hot-toast';

// REPLACE with your Firebase project config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

let app = null;
let messaging = null;
let warningShown = false;

// Initialize messaging only if supported and lazy load firebase
const initializeMessaging = async () => {
  if (messaging) return messaging;
  
  try {
    const { isSupported } = await import('firebase/messaging');
    const supported = await isSupported();
    
    if (supported) {
      if (!app) {
        const { initializeApp } = await import('firebase/app');
        app = initializeApp(firebaseConfig);
      }
      const { getMessaging } = await import('firebase/messaging');
      messaging = getMessaging(app);
      return messaging;
    }
  } catch (err) {
    console.error("Firebase init error", err);
  }

  if (!warningShown) {
    console.warn("Notifications are not supported in this browser (likely due to insecure context/HTTP).");
    warningShown = true;
  }
  return null;
};

export const requestNotificationPermission = async () => {
  try {
    const msg = await initializeMessaging();
    if (!msg) return null;

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const { getToken } = await import('firebase/messaging');
      const token = await getToken(msg, { 
        vapidKey: 'YOUR_VAPID_KEY' // REPLACE with your VAPID key from Firebase Settings
      });
      console.log('Push notification token:', token);
      return token;
    }
  } catch (error) {
    console.error('An error occurred while requesting notification permission:', error);
  }
};

export const onMessageListener = async () => {
    const msg = await initializeMessaging();
    if (!msg) return new Promise(() => {}); // Never resolve if not supported

    return new Promise(async (resolve) => {
        const { onMessage } = await import('firebase/messaging');
        onMessage(msg, (payload) => {
            console.log("Foreground message received:", payload);
            toast.success(`${payload.notification.title}: ${payload.notification.body}`);
            resolve(payload);
        });
    });
};
