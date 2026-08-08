# UniDwell Expo Go Mobile Runner

This folder contains the Expo Go wrapper for running the **UniDwell** application inside the **Expo Go** mobile app on iOS & Android devices.

---

## 🚀 How to Run in Expo Go

### Step 1: Install Dependencies
Open a terminal in the `expo-wrapper` folder and run:
```bash
cd expo-wrapper
npm install
```

### Step 2: Ensure Vite Dev Server is Running
In your main project folder, make sure the Vite development server is running:
```bash
npm run dev
```
*(Verify your computer and phone are connected to the same Wi-Fi network, e.g., `http://192.168.137.51:5173/`)*

### Step 3: Start Expo CLI
In the `expo-wrapper` folder, start the Expo server:
```bash
npx expo start
```

### Step 4: Scan QR Code with Expo Go
1. Download **Expo Go** from the **Apple App Store** or **Google Play Store**.
2. Open Expo Go on your mobile device.
3. Scan the **QR code** displayed in your terminal.
4. UniDwell will immediately load and run inside Expo Go on your phone!

---

## 📱 Architecture Note
This wrapper uses `react-native-webview` to render the full UniDwell web application with 100% of all UI styles, Framer Motion animations, dark modes, glassmorphism, and Zustand local persistence completely intact inside Expo Go.
