# SensitiveMinds 🧠

[![React Native](https://img.shields.io/badge/React_Native-0.78.0-61DAFB?style=for-the-badge&logo=react)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.4-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.6.0-764ABC?style=for-the-badge&logo=redux)](https://redux-toolkit.js.org/)
[![React Navigation](https://img.shields.io/badge/React_Navigation-7.0.14-FF6B6B?style=for-the-badge&logo=react-navigation)](https://reactnavigation.org/)

SensitiveMinds is a dedicated application created for the needs of a research project conducted by psychology students. Its purpose is to streamline the process of collecting data about patients and conducted visits.

The application was designed as a tool for internal use among project participants. Although it is publicly available on Google Play, its functionality is limited exclusively to logged-in users. Accounts in the application can only be held by persons participating in the project, which ensures complete security and confidentiality of collected data.

## 📱 Download

- **Google Play**: [SensitiveMinds](https://play.google.com/store/apps/details?id=com.danielsledz.sensitiveminds)
- **App Store**: [SensitiveMinds](https://apps.apple.com/pl/app/sensitiveminds/id6743448928)

## 🌟 Features

- **Cross-Platform**: Native performance on both iOS and Android
- **Modern Architecture**: Built with React Native 0.78.0 and TypeScript
- **State Management**: Redux Toolkit for predictable state management
- **Authentication**: JWT-based authentication with automatic token refresh
- **Patient Management**: Complete patient tracking and management system
- **Visit Management**: Therapeutic visit management system
- **Therapeutic Exercises**: Cognitive exercise progress tracking
- **Center Grouping**: Organization of patients by therapeutic centers
- **Sorting**: Advanced patient sorting options

## 📱 Application Functions

- **Patient Information Registration**: Recording comprehensive patient data
- **Weekly Visit Monitoring**: Tracking and managing therapeutic sessions
- **Secure Data Storage**: Privacy-compliant data protection
- **Intuitive Interface**: Simple and user-friendly design for easy data entry

SensitiveMinds is a modern tool supporting the data analysis and monitoring process, providing convenience and security for users.

> **ℹ️ Note**: The application is not intended for general use. Only persons with accounts assigned to the project have login capabilities.

## 🛠️ Tech Stack

- **Framework**: React Native 0.78.0
- **Language**: TypeScript 5.0.4
- **State Management**: Redux Toolkit 2.6.0, React Redux 9.2.0
- **Navigation**: React Navigation 7.0.14, Native Stack 7.2.0, Bottom Tabs 7.2.1
- **Storage**: AsyncStorage 2.1.2
- **UI Components**: React Native Paper 5.13.1, React Native Elements 0.0.0-edge.2
- **Forms**: React Native Picker 2.11.0, DateTimePicker 8.3.0
- **HTTP Client**: Axios 1.8.1
- **Authentication**: JWT Decode 4.0.0
- **Testing**: Jest 29.6.3, React Test Renderer 19.0.0
- **Linting**: ESLint 8.19.0 with React Native config
- **Formatting**: Prettier 2.8.8

## 📁 Project Structure

```
├── src/                    # Source code
│   ├── config/            # Application configuration
│   │   └── api.ts         # API configuration
│   ├── screens/           # Application screens
│   │   ├── Login.tsx      # Login screen
│   │   ├── Nav.tsx        # Navigation configuration
│   │   ├── Patients.tsx   # Patient list
│   │   ├── PatientDetails.tsx # Patient details
│   │   ├── AddPatientScreen.tsx # Add patient
│   │   ├── EditPatient.tsx # Edit patient
│   │   ├── AddVisitScreen.tsx # Add visit
│   │   ├── EditVisitScreen.tsx # Edit visit
│   │   └── VisitDetailsScreen.tsx # Visit details
│   ├── store/             # Redux store configuration
│   │   ├── store.ts       # Main store configuration
│   │   └── slices/        # Redux slices
│   │       ├── authSlice.ts # Authentication state
│   │       ├── patientsSlice.ts # Patient state
│   │       └── visitsSlice.ts # Visit state
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
│       └── MyApi.ts       # Hook for API data fetching
├── android/               # Android-specific configuration
├── ios/                   # iOS-specific configuration
├── __tests__/             # Test files
└── public/                # Public assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd SensitiveMinds
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **For iOS, install CocoaPods**

   ```bash
   cd ios && pod install && cd ..
   ```

## 🔧 Configuration

### API Configuration

The API URL is configured in the `src/config/api.ts` file. You can change it according to your needs:

```typescript
export const API_CONFIG = {
  BASE_URL: 'https://your-backend-url.com',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};
```

### Android Configuration

#### App Signing (only for release builds)

1. Generate a new signing key:

   ```bash
   keytool -genkey -v -keystore android/app/my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```

2. Set passwords in environment variables or in the `android/gradle.properties` file:

   ```properties
   MYAPP_RELEASE_STORE_PASSWORD=your_store_password
   MYAPP_RELEASE_KEY_PASSWORD=your_key_password
   ```

**IMPORTANT**: Never commit actual passwords to the repository!

## 📝 Available Scripts

- `npm start` - Start React Native development server
- `npm run android` - Run application on Android device/emulator
- `npm run ios` - Run application on iOS device/simulator
- `npm test` - Run Jest tests
- `npm run lint` - Run ESLint for code quality

## 🎨 Styling

The application uses React Native Paper for UI components. Custom styles can be added in:

- Individual component files
- Shared style constants in `src/constants/`
- Theme configuration for consistent design

## 📱 Application Features

### Patient Management

- Display patient list grouped by centers
- Add new patients
- Edit patient data
- Detailed patient information
- Sort by room and bed number

### Visit Management

- Add new therapeutic visits
- Edit existing visits
- Track cognitive exercises:
  - Memory exercises
  - Arithmetic exercises
  - Reading exercises
  - Stroop Test
- Visit notes

### Authentication

- Secure JWT login
- Automatic token refresh
- Logout with confirmation

## 🔧 Development

### Code Quality

The project uses ESLint and Prettier for code quality and formatting:

```bash
# Check for linting errors
npm run lint

# Auto-fix linting issues
npx eslint . --fix
```

### Testing

Run tests using Jest:

```bash
npm test
```

## 🔒 Security

- All sensitive data (passwords, keys) have been removed from the repository
- Use environment variables for production configuration
- Never commit `.keystore` files or passwords

## 📄 License

This project is private and proprietary. All rights reserved.

## 📞 Contact

**SensitiveMinds**

- Author: Daniel Śledź
- Frontend Repository: [SensitiveMinds](https://github.com/DanielSledz03/SensitiveMinds)
- Backend Repository: [SensitiveMinds Backend](https://github.com/DanielSledz03/SensitiveMinds-Backend)

---

<div align="center">
  <p>Built with ❤️ for efficient therapy management</p>
  <p>Modern mobile solutions for modern healthcare</p>
</div>
