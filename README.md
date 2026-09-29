# MediStock — App Mobile

Aplicativo React Native (Expo + TypeScript) para gestão de estoque hospitalar: alertas, estoque, previsão de demanda com IA e logística entre hospitais. Consome a API do [MediStock_Back](https://github.com/luanaestanislau/MediStock_Back).

## Funcionalidades

| Tela | O que faz |
| --- | --- |
| Login / Cadastro / Matrícula | Acesso com e-mail institucional (JWT). A sessão fica salva e é restaurada ao reabrir o app |
| Home | Indicadores, alertas ativos, entregas e transferências |
| Alertas | Lista com filtro por prioridade |
| Estoque | Busca, filtro por nível, **cadastro, edição e exclusão** de itens e **registro de consumo** mensal |
| IA | Score de otimização, **gráfico de demanda projetada x média móvel** e sugestão de compra |
| Logística | Mapa da rede, sugestões de redistribuição da IA e **atualização de status** de entregas e transferências |

Todas as listas aceitam *pull-to-refresh* e mostram erros de carregamento com o botão "Tentar novamente".

## Como executar

Pré-requisitos: Node 20+, o backend em execução e o celular na **mesma rede Wi-Fi** do computador.

```bash
npm install
cp .env.example .env      # ajuste EXPO_PUBLIC_API_URL
npx expo start -c         # -c limpa o cache ao mudar o .env
```

No `.env`, use o IP do computador, não `localhost`:

```properties
EXPO_PUBLIC_API_URL=http://192.168.0.10:8080/api
```

Descubra o IP com `ipconfig getifaddr en0` (Mac) ou `ipconfig` (Windows). Abra o app pelo Expo Go (QR code). Se aparecer "Não foi possível conectar à API", teste `http://SEU_IP:8080/docs` no navegador do celular e confira o firewall.

## Scripts

| Comando | Função |
| --- | --- |
| `npm test` | Testes unitários (Jest) |
| `npm run typecheck` | Verificação de tipos (TypeScript) |
| `npm run lint` | ESLint (Expo) |

## Estrutura

```text
App.tsx                  Navegação (pilha de autenticação + abas)
src/
  config/                Domínios institucionais aceitos
  context/
    AuthContext.tsx      Sessão: login, cadastro, logout, restauração e expiração (401)
    DataContext.tsx      Dados da API e ações (estoque, consumo, logística, IA)
    AppContext.tsx       Provedores + hook useApp() usado pelas telas
  services/
    api.ts               Cliente HTTP (axios) com token e tratamento de 401
    domainServices.ts    Chamadas tipadas por domínio (auth, estoque, logística, IA...)
    mappers.ts           Resposta da API → modelo das telas
    session.ts           Persistência segura do token
  screens/               Telas
  components/            Componentes reutilizáveis (modais, gráfico, banners)
  types/                 ApiTypes (API) e ui (telas)
  utils/                 Funções puras testadas (filtros, erros, status)
__tests__/               Testes unitários
```

## Decisões de arquitetura

- **Camadas separadas:** as telas usam apenas `useApp()`. As chamadas HTTP ficam em `domainServices.ts`, a conversão de dados em `mappers.ts` e as regras puras em `utils/`, o que as deixa testáveis sem renderizar telas.
- **Dois contextos:** sessão (`AuthContext`) e dados (`DataContext`) mudam por motivos diferentes. Os dados são recriados a cada login e logout, então nada da sessão anterior permanece.
- **Sessão segura:** o token vai para o `expo-secure-store` (Keychain/Keystore). Um 401 durante o uso encerra a sessão com aviso.
- **Tipagem ponta a ponta:** os tipos de requisição e resposta espelham os DTOs do backend.

## Backend

Consulte o README do backend para subir a API e o Oracle. O e-mail de cadastro precisa ser de um domínio permitido (`fiap.com.br`, `hc.unicamp.br`, `hc.usp.br`, `einstein.br`, `hospital.gov.br`, `saude.sp.gov.br`) e a senha precisa ter no mínimo 8 caracteres.

