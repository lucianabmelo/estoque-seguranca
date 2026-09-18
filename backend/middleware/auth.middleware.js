const jwt = require("jsonwebtoken");

function verificarAutenticacao(req, res, next) {

  // Pega o token salvo no cookie durante o login
  const token = req.cookies.estocai_token;

  // Se não existir token, não está autenticado
  if (!token) {
    return res.status(401).json({
      erro: "Usuário não autenticado."
    });
  }

  try {

    // Confere se o token é verdadeiro
    const usuario = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Guarda os dados do usuário na requisição
    req.usuario = usuario;

    // Autoriza continuar
    next();

  } catch (erro) {

    return res.status(401).json({
      erro: "Sessão inválida ou expirada."
    });

  }
}

module.exports = verificarAutenticacao;