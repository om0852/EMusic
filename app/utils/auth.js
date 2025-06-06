import jwt from 'jsonwebtoken';

export const verifyAdmin = async (request) => {
  const token = request.cookies.get('token')?.value;
  if (!token) {
    throw new Error('Not authenticated');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || decoded.role !== 'admin') {
      throw new Error('Not authorized');
    }
    return decoded;
  } catch (error) {
    throw new Error('Not authorized');
  }
};

export const verifyUser = async (request) => {
  const token = request.cookies.get('token')?.value;
  if (!token) {
    throw new Error('Not authenticated');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      throw new Error('Not authorized');
    }
    return decoded;
  } catch (error) {
    throw new Error('Not authorized');
  }
};

export const verifyAuth = async (request) => {
  const token = request.cookies.get('token')?.value;
  if (!token) {
    throw new Error('Not authenticated');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId) {
      throw new Error('Invalid token');
    }
    return decoded;
  } catch (error) {
    throw new Error('Not authorized');
  }
}; 