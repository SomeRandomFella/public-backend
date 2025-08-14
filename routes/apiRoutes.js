const express = require("express");
const router = express.Router();

require("dotenv").config();

const VERSION = process.env.VERSION;
const API_KEY = process.env.API_KEY;

const aiController = require("../controllers/aiController");

router.post("/kickstart", (req, res) => {
  res.send("server is running");
});

router.get("/version", (req, res) => {
  res.send(VERSION);
});

router.post("/ai", (req, res) => {
  aiController.sendPromptAi(req, res, API_KEY);
});

module.exports = router;
