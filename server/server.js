require("dotenv").config();

const express = require("express");
const app = express();
const axios = require("axios");
const cors = require("cors"); // cors 패키지 추가
const port = 8080;

const token = {
  user_id: 1110412050371302000,
  access_token: process.env.access_token,
  refresh_token: process.env.refresh_token,
  expires_in: 7776000,
};

let imgsData = null;
let figmaData = null;
const fileKey = "jQFVzHVxQU8N2yLoLscuFq";

const getImgs = async () => {
  const response = await axios.get(
    `https://api.figma.com/v1/files/${fileKey}/images`,
    {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
      },
    }
  );
  return response.data;
};

const getFile = async () => {
  const response = await axios.get(
    `https://api.figma.com/v1/files/${fileKey}`,
    {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
      },
    }
  );
  return response.data;
};

// CORS 미들웨어를 전역적으로 적용
app.use(cors());

app.get("/get_infos", async (req, res) => {
  if (!imgsData && !figmaData) {
    const [file, imgs] = await Promise.all([getFile(), getImgs()]);
    imgsData = imgs;
    figmaData = file;
  }

  const info = {
    data: {
      figma: figmaData,
      images: imgsData,
    },
  };

  res.json(info);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
