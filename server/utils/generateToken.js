import jwt from 'jsonwebtoken';

const generateToken = (res, userId, userRole) => {
  const token = jwt.sign({ userId, role: userRole }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
    sameSite: 'strict', // Prevent CSRF attacks
    maxAge: (parseInt(process.env.COOKIE_EXPIRES_IN) || 30) * 24 * 60 * 60 * 1000, // Cookie expiry in milliseconds
  });

  return token; // You might not need to return it if primarily using cookies
};

export default generateToken;
