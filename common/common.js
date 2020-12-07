const redis = require('redis');
const JWTR = require('jwt-redis').default;
const redisClient = redis.createClient();
const jwtr = new JWTR(redisClient);

module.exports = {
  jwtr: jwtr,
  baseUrl : "http://localhost:3000"
};
