import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token || token == 'null' || token == 'undefined') return res.status(401).json({ error: 'No token provided, please log in' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded._id);

    if (!user || user.tokenVersion !== decoded.tokenVersion) {
      return res.sendStatus(401);
    }

    req.user = { _id: decoded._id };
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token, please log in' });
  }
}

export async function verifyTokenNotStrict(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token || token == 'null' || token == 'undefined'){
    next();
    return;
  };

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded._id);

    if (!user || user.tokenVersion !== decoded.tokenVersion) {
      return res.sendStatus(401);
    }

    req.user = { _id: decoded._id };
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token, please log in' });
  }
}
