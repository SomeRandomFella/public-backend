const path = require("path");
const express = require("express");
const router = express.Router();

const games = require("../data/games");

const SWF_FOLDER = path.resolve(__dirname, "..", "swfs");
const IMAGE_FOLDER = path.resolve(__dirname, "..", "image");

const fs = require('fs');

router.get("/games", (req, res) => {
  const search = req.query.search || "";

  if (!search) {
    return res.json(games);
  } else if (search) {
    const q = normalize(search);
const searchedGames = games.filter(g =>
  normalize(g.name).includes(q) ||
  (g.keywords || []).some(k => normalize(k).includes(q)) ||
  normalize(g.name).startsWith(q) ||
  (g.keywords || []).some(k => normalize(k).startsWith(q))
);
    return res.json(searchedGames);
  }
});

router.get('/images/:id', (req, res) => {
    const { id } = req.params;
  const imageFile = path.join(IMAGE_FOLDER, `${id}.png`);

  fs.access(imageFile, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`Image not found: ${imageFile}`);
      return res.status(404).send('image aint a thing pal');
    }

    res.sendFile(imageFile);
  });
});

router.get("/swfs/:id", (req, res) => {
  const { id } = req.params;
  const file = path.join(SWF_FOLDER, `${id}.swf`);

  res.setHeader("Content-Type", "application/x-shockwave-flash");
  res.sendFile(file, (err) => {
    if (err) {
      console.error(err);
      res.status(404).send("swf doesnt exist!");
    }
  });
});

module.exports = router;
