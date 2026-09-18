const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
require("dotenv").config();

const app = express();

// Permite receber JSON do frontend
app.use(express.json());

// Permite trabalhar com cookies
app.use(cookieParser());

// Segurança básica
app.use(
  helmet({
    contentSecurityPolicy: false
  })
);

// Entrega os arquivos HTML, CSS e JS da pasta public
app.use(express.static(path.join(__dirname, "public")));
app.use("/api/auth", require("./backend/routes/auth.routes"));
app.use("/api/produtos", require("./backend/routes/produtos.routes"));

// Rota de teste do backend
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    sistema: "Estocaí"
  });
});

// Porta do servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});