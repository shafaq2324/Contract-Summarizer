require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
const pool = require("./config/db");

pool.query("SELECT NOW()")
  .then(() => {
    console.log("Database Connected");
  })
  .catch((err) => {
    console.error("Database Error:", err);
  });