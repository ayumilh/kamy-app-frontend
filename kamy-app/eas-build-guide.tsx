/**
 * Guia de Publicação do Kamy App usando EAS Build
 *
 * Este arquivo serve como documentação para o processo de build e publicação.
 */

// 1. Configure o EAS CLI
// npm install -g eas-cli

// 2. Faça login na sua conta Expo
// eas login

// 3. Configure o projeto para EAS Build
// eas build:configure

// 4. Crie o arquivo eas.json na raiz do projeto
/*
{
  "cli": {
    "version": ">= 3.13.3"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
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
*/

// 5. Crie um build de produção para Android
// eas build --platform android --profile production

// 6. Crie um build de produção para iOS
// eas build --platform ios --profile production

// 7. Envie para as lojas
// eas submit -p android --latest
// eas submit -p ios --latest

// 8. Configuração da Google Play Console
// - Crie uma conta de desenvolvedor (taxa única de $25)
// - Crie um novo aplicativo
// - Configure a ficha da loja (descrição, screenshots, etc.)
// - Faça upload do APK/AAB gerado pelo EAS Build
// - Preencha o questionário de classificação de conteúdo
// - Publique na loja

// 9. Configuração da App Store Connect
// - Crie uma conta Apple Developer (taxa anual de $99)
// - Crie um novo aplicativo no App Store Connect
// - Configure a ficha da loja (descrição, screenshots, etc.)
// - Faça upload do IPA gerado pelo EAS Build usando o Transporter
// - Preencha o questionário de classificação de conteúdo
// - Envie para revisão da Apple
// - Após aprovação, publique na App Store
