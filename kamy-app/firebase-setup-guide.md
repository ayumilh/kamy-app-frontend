# Configuração do Firebase para o Kamy App

## 1. Criar um projeto no Firebase Console

1. Acesse https://console.firebase.google.com/
2. Clique em "Adicionar projeto"
3. Dê um nome ao projeto (ex: "Kamy App")
4. Siga as instruções para criar o projeto

## 2. Configurar o Firebase Authentication

1. No console do Firebase, vá para "Authentication" no menu lateral
2. Clique em "Começar"
3. Ative o provedor "Email/Senha"
4. Salve as alterações

## 3. Configurar o Firestore Database

1. No console do Firebase, vá para "Firestore Database" no menu lateral
2. Clique em "Criar banco de dados"
3. Escolha o modo de inicialização (recomendado: modo de teste para desenvolvimento)
4. Escolha a região mais próxima dos seus usuários
5. Clique em "Ativar"

## 4. Configurar o Firebase para Android

1. No console do Firebase, clique no ícone de engrenagem (⚙️) ao lado de "Visão geral do projeto" e selecione "Configurações do projeto"
2. Vá para a aba "Seus aplicativos" e clique em "Adicionar aplicativo"
3. Selecione a plataforma Android
4. Insira o pacote do aplicativo: `com.yourcompany.kamy` (deve corresponder ao valor em app.json)
5. Insira um apelido para o aplicativo (opcional)
6. Clique em "Registrar aplicativo"
7. Baixe o arquivo `google-services.json`
8. Coloque o arquivo na raiz do seu projeto
9. Siga as instruções para configurar o Gradle (já configurado no projeto Expo)

## 5. Configurar o Firebase para iOS

1. No console do Firebase, clique no ícone de engrenagem (⚙️) ao lado de "Visão geral do projeto" e selecione "Configurações do projeto"
2. Vá para a aba "Seus aplicativos" e clique em "Adicionar aplicativo"
3. Selecione a plataforma iOS
4. Insira o ID do pacote: `com.yourcompany.kamy` (deve corresponder ao valor em app.json)
5. Insira um apelido para o aplicativo (opcional)
6. Clique em "Registrar aplicativo"
7. Baixe o arquivo `GoogleService-Info.plist`
8. Este arquivo será necessário durante o processo de build com o EAS

## 6. Configurar as regras do Firestore

1. No console do Firebase, vá para "Firestore Database" no menu lateral
2. Clique na aba "Regras"
3. Substitua as regras existentes pelas seguintes:

\`\`\`
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
    
    match /notifications/{notificationId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow write: if request.auth != null;
    }
  }
}
\`\`\`

## 7. Atualizar as credenciais do Firebase no App

1. No arquivo `App.tsx`, substitua o objeto `firebaseConfig` com as credenciais do seu projeto:

\`\`\`typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};
\`\`\`

Você pode encontrar essas informações no console do Firebase, nas configurações do projeto, na seção "Seus aplicativos".
