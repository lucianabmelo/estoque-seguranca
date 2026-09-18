const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

// LOGIN
router.post("/login", async (req, res) => {

  const { email, senha } = req.body;

  // Verifica campos obrigatórios
  if (!email || !senha) {
    return res.status(400).json({
      erro: "E-mail e senha são obrigatórios."
    });
  }

  // Verifica o e-mail
  if (email.toLowerCase() !== process.env.USER_EMAIL.toLowerCase()) {
    return res.status(401).json({
      erro: "E-mail ou senha inválidos."
    });
  }

  // Compara a senha digitada com o hash
  const senhaCorreta = await bcrypt.compare(
    senha,
    process.env.USER_PASSWORD_HASH
  );

  if (!senhaCorreta) {
    return res.status(401).json({
      erro: "E-mail ou senha inválidos."
    });
  }

  // Cria uma sessão assinada
  const token = jwt.sign(
    {
      email: process.env.USER_EMAIL
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "2h"
    }
  );

  // Guarda o token em cookie protegido
  res.cookie("estocai_token", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 2 * 60 * 60 * 1000
  });

  return res.status(200).json({
    mensagem: "Acesso realizado com sucesso.",
    usuario: process.env.USER_EMAIL
  });
});


// LOGOUT
router.post("/logout", (req, res) => {

  res.clearCookie("estocai_token");

  return res.status(200).json({
    mensagem: "Sessão encerrada."
  });

});

// DESBLOQUEAR SISTEMA
router.post("/unlock", async (req, res) => {

  const { senha } = req.body;

  if (!senha) {
    return res.status(400).json({
      erro: "A senha é obrigatória."
    });
  }

  const senhaCorreta = await bcrypt.compare(
    senha,
    process.env.USER_PASSWORD_HASH
  );

  if (!senhaCorreta) {
    return res.status(401).json({
      erro: "Senha incorreta."
    });
  }

  return res.status(200).json({
    mensagem: "Sistema desbloqueado."
  });

});

module.exports = router;