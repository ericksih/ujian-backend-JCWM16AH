const jwt = require("jsonwebtoken");

module.exports = {
  createToken: (payload) => {
    return jwt.sign(payload, "backend");
  },

  readToken: (request, response, next) => {
    console.log("Request read token", request.token);
    jwt.verify(request.token, "backend", (error, decoded) => {
      if (error) {
        return response.status(401).send("User Not Authorized");
      }
      request.user = decoded;
      next();
    });
  },
};
