# Sistema de Gerenciamento de Segurança - Wayne Enterprises

Este é um projeto full stack que simula um sistema de controle de acesso e gerenciamento de recursos para as Indústrias Wayne. A aplicação foi construída do zero, implementando um back-end seguro em Python/Flask e um front-end interativo em JavaScript puro.

O sistema permite que usuários com diferentes níveis de permissão (ex: 'Funcionário', 'Gerente', 'Administrador') façam login, gerenciem um inventário de recursos e visualizem estatísticas sobre o sistema.

## Demonstração (Screenshots)

*(Recomendação: Tire screenshots da sua aplicação e coloque-as aqui. Por exemplo: a tela de login, o dashboard com a tabela e o modal de edição, e a página de gráficos.)*

![Tela de Login](caminho/para/seu/screenshot_login.png)
![Dashboard de Recursos](caminho/para/seu/screenshot_dashboard.png)
![Página de Gráficos](caminho/para/seu/screenshot_graficos.png)

## Funcionalidades Implementadas

* **Autenticação Segura:** Sistema de login com senhas criptografadas (Bcrypt) e autenticação baseada em Tokens (JWT).
* **Controle de Acesso por Nível:** O sistema diferencia o que 'Funcionários', 'Gerentes' e 'Administradores' podem fazer (Autorização).
* **Gerenciamento de Recursos (CRUD Completo):**
    * **Criar (Create):** Adicionar novos recursos através de um formulário em modal.
    * **Ler (Read):** Listar todos os recursos numa tabela.
    * **Atualizar (Update):** Editar recursos existentes (com o modal pré-preenchido).
    * **Deletar (Delete):** Remover recursos com um modal de confirmação customizado.
* **Dashboard de Visualização:** Uma página dedicada (`/graficos.html`) que exibe um gráfico de pizza (usando Chart.js) com as estatísticas de status dos recursos, consumindo um endpoint de estatísticas da API.
* **Interface de Usuário (UI) Polida:**
    * Notificações "Toast" customizadas para feedback de sucesso e erro (substituindo os `alert()`s).
    * Modais customizados para formulários e confirmações (substituindo o `confirm()`).
    * Proteção de rotas no front-end (usuários não logados são redirecionados para o login).

## Tecnologias Utilizadas

Este projeto foi construído utilizando as seguintes tecnologias:

### **Back-end**
* **Python:** Linguagem principal para a lógica do servidor.
* **Flask:** Micro-framework web para a criação da API RESTful.
* **MySQL:** Banco de dados relacional para armazenamento persistente dos dados.
* **PyJWT:** Para a geração e validação de JSON Web Tokens (JWT) de autenticação.
* **Bcrypt:** Para o hashing seguro de senhas de usuários.
* **mysql-connector-python:** Driver para a comunicação entre o Python e o MySQL.
* **Flask-Cors:** Para permitir a comunicação entre o back-end e o front-end em domínios diferentes.

### **Front-end**
* **HTML5:** Para a estrutura semântica das páginas.
* **CSS3:** Para toda a estilização, incluindo Flexbox, `position: fixed` para modais e cabeçalhos, e animações de transição.
* **JavaScript (ES6+):** Para toda a lógica do lado do cliente, incluindo:
    * `fetch API` para a comunicação assíncrona com o back-end.
    * Manipulação do DOM para criar e atualizar a interface dinamicamente.
    * `async/await` para um código assíncrono mais limpo.
    * `localStorage` para persistência do token de autenticação no navegador.
* **Chart.js:** Biblioteca para a renderização de gráficos interativos.

### **Ferramentas de Desenvolvimento**
* **Git & GitHub:** Para controle de versão.
* **VS Code:** Editor de código principal.
* **Postman:** Para testes e depuração da API back-end.
* **MySQL Workbench:** Para modelagem e administração do banco de dados.

## Como Executar o Projeto Localmente

Siga os passos abaixo para configurar e executar o projeto na sua máquina.

### Pré-requisitos
* Python 3.x
* Servidor MySQL (ex: MySQL Community Server)
* Git

### 1. Clonar o Repositório
```bash
git clone [https://github.com/seu-usuario/seu-repositorio.git](https://github.com/seu-usuario/seu-repositorio.git)
cd seu-repositorio