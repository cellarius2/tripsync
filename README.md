# TripSync

Organizar uma viagem em grupo pode ficar confuso quando decisões, valores, documentos e tarefas se espalham por conversas, planilhas e mensagens soltas. O TripSync centraliza essa organização em uma experiência visual, colaborativa e prática, ajudando o grupo a acompanhar o que já está pronto e o que ainda precisa ser resolvido.

O projeto foi desenvolvido como uma aplicação fullstack, com frontend em React/TypeScript e backend em .NET, pensando em uma experiência moderna, responsiva e com identidade visual própria.

## Funcionalidades

- Cadastro e login de usuários
- Criação e gerenciamento de viagens
- Painel inicial com visão geral da viagem
- Gerenciamento de tripulantes
- Escolha de avatar para tripulantes
- Checklist colaborativo
- Controle financeiro e orçamento da viagem
- Documentos da viagem
- Sistema de votação para decisões em grupo
- Notificações e interações gamificadas
- Tema claro e escuro
- Interface responsiva
- Identidade visual própria 

## Tecnologias utilizadas

### Frontend

- React
- TypeScript
- Vite
- CSS
- Axios
- React Router
- Lucide React
- SignalR Client

### Backend

- .NET 8
- C#
- ASP.NET Core Web API
- Entity Framework Core
- PostgreSQL
- JWT/Auth
- SignalR
- Swagger

### Ferramentas

- Git/GitHub
- Swagger
- Vite
- Entity Framework Migrations

## Arquitetura do projeto

Estrutura principal usada no projeto:

```text
TripSync/
├── TripSync.API/
│   ├── Controllers/
│   ├── Data/
│   ├── DTOs/
│   ├── Enums/
│   ├── Helpers/
│   ├── Hubs/
│   ├── Migrations/
│   ├── Models/
│   ├── Services/
│   │   ├── Implementations/
│   │   └── Interfaces/
│   ├── Program.cs
│   └── appsettings.Example.json
│
└── TripSync.Frontend/
    └── frontend/
        ├── src/
        │   ├── assets/
        │   ├── components/
        │   ├── context/
        │   ├── data/
        │   ├── hooks/
        │   ├── pages/
        │   ├── routes/
        │   ├── services/
        │   ├── types/
        │   └── utils/
        ├── package.json
        └── .env.example
```

## Como rodar localmente

### Backend

Entre na pasta da API:

```bash
cd TripSync.API/TripSync.API
dotnet restore
dotnet ef database update
dotnet run
```

Antes de rodar, configure a connection string e a chave JWT em `appsettings.Development.json`, user-secrets ou variáveis de ambiente.

### Frontend

Entre na pasta do frontend:

```bash
cd TripSync.Frontend/frontend
npm install
npm run dev
```

Crie um arquivo `.env` local com base em `.env.example`.

## Status do projeto

Projeto em fase de finalização para portfólio, com foco em organização de código, refinamento visual e estabilidade das principais funcionalidades.

## Melhorias futuras

- Versão mobile dedicada
- Integração com calendário
- Exportação de dados da viagem
- Convites por link compartilhável
- Upload avançado de documentos
- Mais opções de notificações em tempo real

## Aprendizados

- Criação de API REST com ASP.NET Core
- Autenticação com JWT
- Integração frontend/backend
- Organização de estado no React
- Consumo de API com Axios
- Modelagem de dados com Entity Framework Core
- Migrations e persistência com PostgreSQL
- Design responsivo
- Tema claro/escuro
- Estruturação de projeto fullstack para portfólio

## Autor

Desenvolvido por Emily Cellarius.
