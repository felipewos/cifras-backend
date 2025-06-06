require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const app = express();

// Habilita CORS para qualquer origem
app.use(cors());
app.use(bodyParser.json());

// Rota de teste para ver se o backend está no ar
app.get("/cifra", (req, res) => {
  res.json({
    titulo: "Raridade",
    artista: "Anderson Freire",
    cifra: `
Tom: A
Intro: A9  F#m7  D9  E

A9            E/G#
Você é um espelho
      F#m7             D9
Que reflete a imagem do Senhor...
`
  });
});

// Rota usada pelo editor.html para enviar uma cifra como JSON
app.post('/enviar-cifra', async (req, res) => {
  const content = req.body;
  const title = content.title;

  if (!title || !content.lines) {
    return res.status(400).json({ message: "JSON inválido. Título ou linhas ausentes." });
  }

  const path = `cifras/${title.toLowerCase().replace(/ /g, "_")}.json`;
  const message = `Adicionar cifra ${title}`;
  const contentBase64 = Buffer.from(JSON.stringify(content, null, 2)).toString('base64');

  try {
    const response = await axios.put(
      `https://api.github.com/repos/${process.env.REPO_OWNER}/${process.env.REPO_NAME}/contents/${path}`,
      {
        message,
        content: contentBase64,
      },
      {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({ success: true, message: `Cifra '${title}' enviada com sucesso!`, url: response.data.content.html_url });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ success: false, message: error.response?.data?.message || error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
