# 🏦 ByteBank - Controle Financeiro (Tech Challenge Mobile)

Este projeto é a solução para o Tech Challenge de desenvolvimento Mobile. O aplicativo **ByteBank** permite aos usuários gerenciar suas finanças de forma simples e visual, acompanhando entradas, saídas, saldos e gerando análises gráficas.

---

## ✨ Funcionalidades Implementadas

- **Autenticação Segura**: Cadastro e Login de usuários utilizando o Firebase Authentication.
- **Dashboard Dinâmico e Animado**: 
  - Tela inicial com saudações, saldo total e animações de transição (`Animated` API).
  - Carrossel de gráficos analíticos (Pizza, Barras e Linha) para análise de despesas, com filtro por período/mês.
- **Gestão de Transações**: 
  - Adicionar e Editar transações de receita ou despesa.
  - Validação avançada de formulários (valores maiores que zero, obrigatoriedade de descrição).
  - Auto-sugestão inteligente de categorias com base na descrição (ex: "Ifood" sugere a categoria "ALIMENTAÇÃO").
  - Anexo de comprovantes e recibos através de upload de imagens (Firebase Storage).
- **Extrato Avançado (Listagem)**:
  - Lista robusta contendo rolagem infinita/paginação simulada para otimizar leitura de grandes volumes de dados.
  - Filtros avançados por Período (Datas de início e fim) e Categorias.
  - Animações suaves de lista ao aplicar filtros (`LayoutAnimation`).

---

## 🛠 Dependências Necessárias

Para rodar este projeto, você precisará ter instalado em sua máquina:
- **Node.js** (versão 18 ou superior recomendada)
- **Gerenciador de pacotes**: `npm` ou `yarn`
- Aplicativo **Expo Go** instalado no seu celular (Android ou iOS) para testar no dispositivo físico, ou um emulador configurado no seu computador.

---

## ⚙️ Configuração do Firebase

O aplicativo utiliza o Firebase como Backend as a Service (BaaS) para Banco de Dados, Autenticação e Arquivos. Para executá-lo em seu ambiente local, é necessário configurar um projeto próprio no Firebase.

Para facilitar a correção e a execução do projeto pelos avaliadores, o app já está configurado e integrado a um projeto Firebase de testes. 

> **⚠️ Nota sobre Variáveis de Ambiente (.env)**
> 
> Em um cenário corporativo real, as chaves de configuração do Firebase seriam isoladas em um arquivo `.env`. No entanto, **para facilitar a avaliação deste Tech Challenge e permitir que o projeto seja "plug and play"**, optamos por embutir essas credenciais (que são públicas por natureza no front-end) diretamente no código-fonte (`src/services/firebaseConfig.ts`).
> 
> **Portanto, NÃO é necessário criar ou configurar nenhum arquivo `.env` para rodar a aplicação localmente.**
> 
> *A segurança real dos dados do aplicativo é garantida em nível de servidor através do **Firebase Authentication** e das **Regras de Segurança do Firestore (Security Rules)**, assegurando que um usuário só consiga ler e alterar as suas próprias transações.*

---

## 🚀 Como Executar o Projeto Localmente

Siga os passos abaixo para rodar o aplicativo na sua máquina:

**1. Clone o repositório:**
```bash
git clone https://github.com/cliomaas/postech-tech-challenge-mobile.git
cd postech-tech-challenge-mobile
```

**2. Instale as dependências:**
```bash
npm install
# ou
yarn install
```

**3. Inicie o servidor de desenvolvimento do Expo:**
```bash
npx expo start
```

**4. Abra o aplicativo:**
- **No celular físico:** Abra o aplicativo "Expo Go" e escaneie o QR Code exibido no seu terminal ou navegador.
- **No Simulador iOS:** Pressione a tecla `i` no terminal (requer Xcode instalado e aberto).
- **No Emulador Android:** Pressione a tecla `a` no terminal (requer Android Studio e Virtual Device configurados).
- **Na Web:** Pressione a tecla `w` no terminal para rodar diretamente no navegador.

---

## 💻 Principais Tecnologias Utilizadas

- **React Native** + **Expo**
- **Expo Router** (Navegação em abas baseada em arquivos)
- **Firebase SDK** (`firebase/auth`, `firebase/firestore`, `firebase/storage`)
- **React Native Gifted Charts** (Renderização dos gráficos)
- **Expo Image Picker** (Acesso à câmera/galeria)
- **React Native Community DateTimePicker** (Inputs de data nativos)