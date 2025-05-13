/**
 * Guia de Configuração do Firebase para o Kamy App
 *
 * Este arquivo serve como documentação para configurar o Firebase.
 */

// 1. Crie um projeto no Firebase Console
// Acesse https://console.firebase.google.com/

// 2. Adicione um aplicativo Android
// - Pacote: com.yourcompany.kamy
// - Apelido: Kamy Android
// - Baixe o arquivo google-services.json e coloque-o na pasta android/app/

// 3. Adicione um aplicativo iOS
// - Bundle ID: com.yourcompany.kamy
// - Apelido: Kamy iOS
// - Baixe o arquivo GoogleService-Info.plist e adicione-o ao projeto Xcode

// 4. Ative a Autenticação
// - Vá para Authentication > Sign-in method
// - Ative o provedor "Email/Password"

// 5. Configure o Firestore
// - Vá para Firestore Database > Create Database
// - Comece em modo de teste
// - Escolha a região mais próxima dos seus usuários

// 6. Configure as regras de segurança do Firestore
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Autenticação necessária para todas as operações
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Regras específicas para coleções
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /groups/{groupId} {
      allow read: if request.auth != null && request.auth.uid in resource.data.members;
      allow write: if request.auth != null && (
        request.auth.uid == resource.data.ownerId || 
        request.auth.uid in resource.data.members
      );
    }
    
    match /tasks/{taskId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
*/
