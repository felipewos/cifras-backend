require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

app.post('/enviar-cifra', async (req, res) => {
  const { title, content } = req.body;

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

    res.json({ success: true, url: response.data.content.html_url });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ success: false, error: error.response?.data?.message || error.message });
  }
});

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});
