module.exports = {
  env: "staging",
  local: {
    server: "http://localhost:3000",
    frontend: "http://localhost:8080"
  },
  staging: {
    server: "https://api-kernel.herokuapp.com",
    frontend: "https://gratitude.kernel.community"
  },
  prod: {
    domain: "https://api.kernel.community",
    frontend: "https://gratitude.kernel.community"
  }
};
