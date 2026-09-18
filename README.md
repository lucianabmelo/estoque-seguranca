ESTOCAÍ — Sistema de Controle de Estoque

Sistema web acadêmico desenvolvido para a disciplina de Segurança em Sistemas de Informação.
O ESTOCAÍ é um sistema de gerenciamento de estoque voltado para produtos de tecnologia, desenvolvido com front-end e back-end, aplicando conceitos de autenticação, validação de dados, controle de acesso, auditoria, proteção de rotas e princípios de segurança da informação.
O projeto também aplica conceitos da Tríade CID — Confidencialidade, Integridade e Disponibilidade no desenvolvimento do back-end.
Tecnologias
•	HTML5
•	JavaScript
•	Tailwind CSS
•	Node.js
•	Express
•	Middleware
•	API REST
•	Git
•	GitHub
•	Visual Studio Code
•	Vercel

Funcionalidades do projeto:
Autenticação:
•	Login de funcionário por matrícula e senha.
•	Campos obrigatórios.
•	Senha mascarada por padrão.
•	Limite de caracteres nos campos.
•	Validação das credenciais.
•	Controle de sessão/acesso do usuário.
•	Timeout de inatividade de 2 minutos.
•	Confirmação antes do logout.
•	Proteção de acesso através do back-end.

Controle de estoque
O sistema permite:
•	Cadastro de produtos.
•	Listagem de produtos.
•	Pesquisa de produtos.
•	Atualização de produtos.
•	Exclusão de produtos.
•	Controle da quantidade em estoque.
•	Confirmação antes da exclusão.
•	Validação dos dados antes das operações.
A tabela de produtos apresenta as informações na seguinte ordem:
Categoria / Marca / Nome / SKU / Quantidade


Dados dos produtos
Os produtos possuem informações como:
•	Nome
•	Marca
•	Categoria
•	SKU
•	GTIN/EAN
•	Descrição
•	Unidade de medida
•	Quantidade

Categorias permitidas:
•	Gabinete
•	Monitor
•	Mouse
•	Processador
•	Teclado

Validação de dados
•	Campos obrigatórios com “required”.
•	Limites máximos de caracteres.
•	Inputs adequados de entrada.
•	Máscaras para determinados campos.
•	Validação de SKU.
•	Validação de GTIN/EAN (código de barras).
•	Validação de quantidade.
•	Bloqueio de operações quando os dados são inválidos.

Back-end
O sistema possui uma estrutura de back-end responsável pelo processamento das requisições e aplicação das regras de segurança.
Foram implementados:
•	Servidor utilizando Node.js.
•	Rotas específicas para as operações do sistema.
•	Middleware para validação e controle das requisições.
•	Tratamento dos dados recebidos pelo servidor.
•	Proteção das operações sensíveis.
•	Tratamento de erros.
