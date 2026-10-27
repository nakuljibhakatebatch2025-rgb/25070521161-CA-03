import jwt from 'jsonwebtoken';

export function protect(req, res, next) {
  const header = req.headers.authorization || '';

  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  const token = header.slice('Bearer '.length).trim();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.id;
    return next();
  } catch {
    return res.status(401).json({ message: 'Not authorized, token is invalid or expired' });
  }
}
