ESTOCAÍ — PROJETO FRONT-END

Como executar:
1. Extraia a pasta.
2. Abra o arquivo index.html no navegador.
3. É necessário acesso à internet apenas para carregar o Tailwind CSS via CDN.

Login de demonstração:
Matrícula: func123
Senha: 2026

Recursos implementados:
- Limite de caracteres em login, senha e campos do produto.
- Campos obrigatórios com required.
- Máscaras/sanitização para SKU e GTIN/EAN.
- Tipos de input adequados: password, number, search e inputmode numeric.
- Senha mascarada por padrão.
- Timeout de inatividade de 5 minutos.
- Popups de confirmação para exclusão e saída.
- Botões desabilitados durante login, cadastro/edição e exclusão.
- SKU, GTIN/EAN, descrição e unidade de medida.
- Logs de auditoria com usuário, data, hora, ação, produto e detalhes.
- Tabela de produtos na ordem: categoria / marca / nome / SKU / quantidade.
- 4 produtos iniciais.
- Categorias permitidas: Gabinete, Monitor, Mouse, Processador e Teclado.

IMPORTANTE:
Este é um projeto exclusivamente front-end. As validações melhoram UX e reduzem entradas inválidas, mas autenticação, proteção real contra ataques e integridade de logs exigem back-end, banco de dados, HTTPS e controles de autorização no servidor.
