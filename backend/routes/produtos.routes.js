const express = require("express");

const verificarAutenticacao =
  require("../middleware/auth.middleware");

const router = express.Router();

router.post("/validar",verificarAutenticacao,(req, res) => {

  const {
    categoria,
    marca,
    nome,
    sku,
    quantidade,
    gtin,
    unidade,
    descricao
  } = req.body;

  // Campos obrigatórios
  if (
    !categoria ||
    !marca ||
    !nome ||
    !sku ||
    quantidade === undefined ||
    !gtin ||
    !unidade ||
    !descricao
  ) {
    return res.status(400).json({
      erro: "Todos os campos obrigatórios devem ser preenchidos."
    });
  }

  // SKU
  if (!/^[A-Z0-9_-]{3,20}$/.test(sku)) {
    return res.status(400).json({
      erro: "SKU inválido."
    });
  }

  // Quantidade
  const qtd = Number(quantidade);

  if (
    !Number.isInteger(qtd) ||
    qtd < 0 ||
    qtd > 99999
  ) {
    return res.status(400).json({
      erro: "Quantidade inválida."
    });
  }

  // GTIN
  if (!/^[0-9]{8,14}$/.test(gtin)) {
    return res.status(400).json({
      erro: "GTIN/EAN inválido."
    });
  }

  // Marca
  if (marca.length < 2 || marca.length > 40) {
    return res.status(400).json({
      erro: "Marca inválida."
    });
  }

  // Nome
  if (nome.length < 2 || nome.length > 80) {
    return res.status(400).json({
      erro: "Nome do produto inválido."
    });
  }

  // Descrição
  if (descricao.length < 5 || descricao.length > 300) {
    return res.status(400).json({
      erro: "Descrição inválida."
    });
  }

  return res.status(200).json({
    mensagem: "Produto validado com sucesso.",
    produtoValido: true
  });

});

module.exports = router;