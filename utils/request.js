var axios = require("axios");
let request =  axios.create({
  timeout: 20000,
  proxy: {
    host: "127.0.0.1",
    port: 7890,
  },
});

module.exports = request