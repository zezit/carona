# Carpool - Sistema de Caronas Universitárias

Aplicação para coordenação e compartilhamento de caronas entre estudantes universitários.

## Estrutura de Pastas

```
/code
├── backend/              # API REST (Spring Boot)
│   ├── src/              # Código fonte
│   ├── pom.xml           # Dependências Maven
│   └── docker-compose.yml # Configuração do ambiente Docker
│
├── frontEnd/             # Aplicativo Mobile (React Native)
│   ├── api/              # Configuração e cliente para API
│   ├── assets/           # Imagens e recursos estáticos
│   ├── components/       # Componentes React reutilizáveis
│   ├── screens/          # Telas do aplicativo
│   └── App.js            # Componente principal
│
├── frontEndWeb/          # Interface Web (React)
│   ├── src/              # Código fonte
│   │   ├── components/   # Componentes React
│   │   ├── pages/        # Páginas da aplicação
│   │   ├── hooks/        # React hooks personalizados
│   │   └── context/      # Contextos React
│   └── package.json      # Dependências do projeto
│
├── docs/                 # Documentação
│   ├── mobile-dev-guide.md # Guia para desenvolvedores mobile
│   └── diagrams/         # Diagramas do sistema
│
└── carona-login/         # Tela de login (React)
    └── src/              # Código fonte
```

## Componentes do Sistema

### Backend (API REST)

- **Tecnologias:** Spring Boot, Spring Security, Spring Data JPA, MySQL
- **Documentação:** Acesse a documentação Swagger em `/api/swagger` quando a aplicação estiver em execução
- **Instruções de execução:** Veja o [guia para desenvolvedores](/docs/mobile-dev-guide.md)

### Frontend Mobile

- **Tecnologias:** React Native, Expo
- **Instruções de execução:** Veja o [guia para desenvolvedores mobile](/docs/mobile-dev-guide.md)

### Frontend Web

- **Tecnologias:** React, TailwindCSS
- **Funcionalidades:** Aprovação de usuários, gerenciamento administrativo

## Guias Específicos

- [Guia para Desenvolvedores Mobile](docs/mobile-dev-guide.md) - Instruções para configurar e executar a API e conectar aplicações mobile
- [Manual de Usuário](docs/user-manual.md) - Instruções para uso do aplicativo

## Requisitos de Sistema

### Para Desenvolvimento

- **Backend:** Java 21, Maven, Docker, Docker Compose
- **Frontend Mobile:** Node.js, npm ou yarn, Expo CLI
- **Frontend Web:** Node.js, npm ou yarn