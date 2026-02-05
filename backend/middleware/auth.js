import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
    // Get token from header (Format: "Bearer TOKEN_STRING")
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Access Denied: No Token Provided" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or Expired Token" });
        }

        // Add the decoded user data (username, etc.) to the request object
        req.user = user;
        next(); // Move to the actual route handler
    });
};