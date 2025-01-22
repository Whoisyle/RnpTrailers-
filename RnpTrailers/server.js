const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.static("public"));
app.use(express.json());

const serverTrailers = [];

app.get("/trailers", (req, res) => {
  res.json(serverTrailers);
});

app.post("/trailers", (req, res) => {
  const { name, type, price } = req.body;
  const trailer = { id: Date.now(), name, type, price };
  serverTrailers.push(trailer);
  res.status(201).json(trailer);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
