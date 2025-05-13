# Guia de Build e Publicação do Kamy App usando EAS

## 1. Configuração Inicial

### Instalar o EAS CLI
\`\`\`bash
npm install -g eas-cli
\`\`\`

### Fazer login na sua conta Expo
\`\`\`bash
eas login
\`\`\`

### Configurar o projeto para EAS Build
\`\`\`bash
eas build:configure
\`\`\`

## 2. Configurar o arquivo eas.json

Crie ou atualize o arquivo `eas.json` na raiz do projeto:

\`\`\`json
{
  "cli": {
    "version": ">= 3.13.3"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium"
      }
    },
    "production": {
      "ios": {
        "resourceClass": "m-medium"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./path-to-your-key.json",
        "track": "production"
      },
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "your-app-store-connect-app-id",
        "appleTeamId": "your-apple-team-id"
      }
    }
  }
}
\`\`\`

## 3. Preparar os Assets

1. Certifique-se de que você tem todos os assets necessários:
   - `./assets/icon.png` (1024x1024)
   - `./assets/adaptive-icon.png` (1024x1024)
   - `./assets/splash.png` (1242x2436)
   - `./assets/notification-icon.png` (96x96)
   - `./assets/notification-sound.wav` (opcional)

2. Para iOS, você precisará do arquivo `GoogleService-Info.plist` do Firebase.
3. Para Android, você precisará do arquivo `google-services.json` do Firebase.

## 4. Criar um Build de Desenvolvimento

Para testar o aplicativo em um dispositivo físico:

\`\`\`bash
eas build --profile development --platform all
\`\`\`

Ou para uma plataforma específica:

\`\`\`bash
eas build --profile development --platform ios
eas build --profile development --platform android
\`\`\`

## 5. Criar um Build de Preview

Para distribuir internamente para testadores:

\`\`\`bash
eas build --profile preview --platform all
\`\`\`

## 6. Criar um Build de Produção

Para enviar às lojas:

\`\`\`bash
eas build --profile production --platform all
\`\`\`

## 7. Enviar para as Lojas

### Google Play Store

1. Crie uma conta de desenvolvedor do Google Play ($25 taxa única)
2. Prepare a ficha da loja (descrição, screenshots, etc.)
3. Envie o build para a Play Store:

\`\`\`bash
eas submit -p android --latest
\`\`\`

### Apple App Store

1. Crie uma conta Apple Developer ($99/ano)
2. Prepare a ficha da loja no App Store Connect
3. Envie o build para a App Store:

\`\`\`bash
eas submit -p ios --latest
\`\`\`

## 8. Atualizações Over-the-Air (OTA)

Para enviar atualizações sem passar pelas lojas:

\`\`\`bash
eas update --branch production --message "Descrição da atualização"
\`\`\`

## 9. Configuração de Notificações Push

1. Para Android, você já configurou o Firebase Cloud Messaging (FCM) ao adicionar o `google-services.json`.
2. Para iOS, você precisará configurar o Apple Push Notification service (APNs) no console do Firebase.

## 10. Resolução de Problemas Comuns

- **Erro de credenciais**: Verifique se você está logado com `eas login`
- **Erro de build**: Verifique os logs detalhados no console do EAS
- **Erro de envio**: Verifique se você configurou corretamente as credenciais da loja
- **Problemas com assets**: Verifique se todos os assets têm as dimensões corretas
