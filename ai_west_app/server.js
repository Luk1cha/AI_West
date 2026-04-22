const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

// სენსორების ემულაცია
app.get("/sensor", (req, res) => {
  res.json({
    soilMoisture: Math.floor(Math.random() * 100),
    temperature: 25,
    humidity: 60,
  });
});

// წყლის კონტროლი
app.post("/water", (req, res) => {
  console.log("Water toggled!", req.body);
  res.json({ success: true });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
