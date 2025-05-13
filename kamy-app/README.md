# Kamy App

Kamy é um aplicativo de gerenciamento de tarefas colaborativo desenvolvido com React Native e Expo, utilizando um backend com Prisma e PostgreSQL.

## Arquitetura

O projeto está dividido em duas partes principais:

1. **Backend**: API RESTful construída com Node.js, Express, Prisma e PostgreSQL
2. **Frontend**: Aplicativo móvel construído com React Native e Expo

### Backend

O backend utiliza as seguintes tecnologias:

- **Node.js e Express**: Para criar a API RESTful
- **Prisma**: ORM para interagir com o banco de dados
- **PostgreSQL**: Banco de dados relacional
- **JWT**: Para autenticação
- **Bcrypt**: Para criptografia de senhas
- **Zod**: Para validação de dados

### Frontend (App)

O aplicativo móvel utiliza as seguintes tecnologias:

- **React Native**: Framework para desenvolvimento móvel
- **Expo**: Plataforma para simplificar o desenvolvimento React Native
- **React Navigation**: Para navegação entre telas
- **Async Storage**: Para armazenamento local
- **Expo Notifications**: Para notificações push

## Configuração do Projeto

### Backend

1. Clone o repositório do backend
2. Instale as dependências: `npm install`
3. Crie um arquivo `.env` baseado no `.env.example`
4. Configure a URL do banco de dados PostgreSQL no arquivo `.env`
5. Execute as migrações do Prisma: `npm run prisma:migrate`
6. Inicie o servidor: `npm run dev`

### Frontend (App)

1. Clone o repositório do aplicativo
2. Instale as dependências: `npm install`
3. Atualize a URL da API no arquivo `src/services/api.ts`
4. Inicie o aplicativo: `npm start`

## Funcionalidades

- Autenticação de usuários (registro, login, recuperação de senha)
- Criação e gerenciamento de grupos
- Criação e atribuição de tarefas
- Notificações em tempo real
- Tema claro e escuro
- Interface moderna e responsiva

## Estrutura do Projeto

### Backend

\`\`\`
kamy-backend/
├── prisma/
│   └── schema.prisma     # Esquema do banco de dados
├── src/
│   ├── lib/              # Utilitários e configurações
│   ├── middleware/       # Middlewares Express
│   ├── routes/           # Rotas da API
│   └── index.ts          # Ponto de entrada do servidor
├── .env                  # Variáveis de ambiente
└── package.json          # Dependências e scripts
\`\`\`

### Frontend (App)

\`\`\`
kamy-app/
├── assets/               # Imagens, fontes e outros recursos
├── src/
│   ├── components/       # Componentes reutilizáveis
│   ├── contexts/         # Contextos React (auth, theme, notifications)
│   ├── navigation/       # Configuração de navegação
│   ├── screens/          # Telas do aplicativo
│   ├── services/         # Serviços de API
│   ├── types/            # Definições de tipos TypeScript
│   └── utils/            # Funções utilitárias
├── App.tsx               # Ponto de entrada do aplicativo
└── package.json          # Dependências e scripts
\`\`\`

## Implantação

### Backend

O backend pode ser implantado em serviços como:

- Vercel
- Heroku
- Railway
- Render

Certifique-se de configurar as variáveis de ambiente necessárias.

### Frontend (App)

Para criar builds para Android e iOS, use o Expo Application Services (EAS):

\`\`\`bash
# Configurar EAS
npm install -g eas-cli
eas login
eas build:configure

# Criar build de desenvolvimento
eas build --profile development --platform all

# Criar build de produção
eas build --profile production --platform all

# Enviar para as lojas
eas submit -p android --latest
eas submit -p ios --latest
\`\`\`

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.
