# Konfiguracja projektu SensitiveMinds

## Wymagania wstępne

- Node.js >= 18
- React Native CLI
- Android Studio (dla Android)
- Xcode (dla iOS, tylko na macOS)

## Instalacja

1. Sklonuj repozytorium:

```bash
git clone <repository-url>
cd SensitiveMinds
```

2. Zainstaluj zależności:

```bash
npm install
```

3. Dla iOS, zainstaluj CocoaPods:

```bash
cd ios && pod install && cd ..
```

## Konfiguracja Android

### Podpisywanie aplikacji (tylko dla release build)

1. Wygeneruj nowy klucz podpisujący:

```bash
keytool -genkey -v -keystore android/app/my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

2. Ustaw hasła w zmiennych środowiskowych lub w pliku `android/gradle.properties`:

```properties
MYAPP_RELEASE_STORE_PASSWORD=twoje_haslo_sklepu
MYAPP_RELEASE_KEY_PASSWORD=twoje_haslo_klucza
```

**WAŻNE**: Nigdy nie commituj rzeczywistych haseł do repozytorium!

## Konfiguracja API

URL API jest skonfigurowany w pliku `src/config/api.ts`. Możesz go zmienić według potrzeb:

```typescript
export const API_CONFIG = {
  BASE_URL: 'https://twoj-backend-url.com',
  // ...
};
```

## Uruchomienie

### Android

```bash
npm run android
```

### iOS

```bash
npm run ios
```

## Struktura projektu

```
src/
├── components/     # Komponenty React Native
├── screens/        # Ekrany aplikacji
├── store/          # Redux store i slice'y
├── types/          # Definicje TypeScript
├── utils/          # Narzędzia i hooki
└── config/         # Konfiguracja aplikacji
```

## Bezpieczeństwo

- Wszystkie wrażliwe dane (hasła, klucze) zostały usunięte z repozytorium
- Używaj zmiennych środowiskowych dla konfiguracji produkcyjnej
- Nigdy nie commituj plików `.keystore` ani haseł
