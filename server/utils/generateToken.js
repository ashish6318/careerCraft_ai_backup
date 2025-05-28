import jwt from 'jsonwebtoken';

const generateToken = (res, userId, userRole) => {
  const token = jwt.sign({ userId, role: userRole }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });

  const isProduction = process.env.NODE_ENV === 'production';

  // res.cookie('token', token, {
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
  //   sameSite: 'strict', // Prevent CSRF attacks
  //   maxAge: (parseInt(process.env.COOKIE_EXPIRES_IN) || 30) * 24 * 60 * 60 * 1000, // Cookie expiry in milliseconds
  // });
  res.cookie('token', token, {
    httpOnly: true,
    //secure: process.env.NODE_ENV !== 'development',
    secure: isProduction, // Cookie will only be sent over HTTPS in production
    sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-site (production), 'lax' for same-site (development)
    maxAge: (parseInt(process.env.COOKIE_EXPIRES_IN) || 30) * 24 * 60 * 60 * 1000, // e.g., 30 days
    // path: '/', // Usually defaults to / which is fine
    // domain: isProduction ? 'your-base-domain.com' : undefined // Generally not needed for Vercel <-> Render
  });

  return token; // You might not need to return it if primarily using cookies
};

export default generateToken;
