module.exports = {
  env: "prod",
  local: {
    server: "http://localhost:3000",
    frontend: "http://localhost:8080"
  },
  staging: {
    server: "https://api-kernel.herokuapp.com",
    frontend: "https://gratitude.kernel.community"
  },
  prod: {
    server: "http://167.71.9.209",
    frontend: "https://gratitude.kernel.community"
  }
};
