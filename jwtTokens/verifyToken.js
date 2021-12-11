const jwt = require('jsonwebtoken');
const {
  createAccessToken,
  createRefreshToken,
} = require('../jwtTokens/createToken');
require('dotenv').config();

const verifyAccessToken = (accessToken) => {
  return jwt.verify(accessToken, process.env.PRIVATE_KEY_ACCESS);
};

const verifyRefreshToken = (refreshToken) => {
  return jwt.verify(refreshToken, process.env.PRIVATE_KEY_REFRESH);
};

const checkCookies = (req, res) => {
  const cookies = req.cookies;
  console.log('cookies', cookies);
  if (cookies) {
    invalidateTokens(res);
    res.statusCode = 200;
    res.send('');
  } else {
    res.statusCode = 401;
    res.send('Brak cookies');
  }
};

const invalidateTokens = (res) => {
  res.clearCookie('access-token');
  res.clearCookie('refresh-token');
};

const verifyAccess = (req, res) => {
  try {
    const accessToken = req.cookies['access-token'];
    const refreshToken = req.cookies['refresh-token'];
    try {
      const vat = verifyAccessToken(accessToken);
      console.log(vat);
      return vat;
    } catch {
      try {
        const vrt = verifyRefreshToken(refreshToken);
        console.log(vrt);
        if (vrt && vrt.id) {
          const newAccessToken = createAccessToken(vrt.id, vrt.type);
          const newRefreshToken = createRefreshToken(vrt.id, vrt.type);
          res.cookie('access-token', newAccessToken);
          res.cookie('refresh-token', newRefreshToken);
          return vrt;
        }
      } catch {
        invalidateTokens(res);
        return null;
      }
    }
  } catch (e) {
    invalidateTokens(res);
    return null;
  }
};

module.exports = {
  verifyAccessToken,
  verifyRefreshToken,
  invalidateTokens,
  verifyAccess,
  checkCookies,
};
