const jwt = require("jsonwebtoken")

const verifyToken = (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No autorizado, formato de token inválido" });
  }


  const token = authHeader.split(" ")[1];

  
  if (!token) {
    return res.status(401).json({ message: "No autorizado, se requiere token" });
  }

  try {
    
    const decoded = jwt.verify(token, "az_AZ");
    console.log("Token válido:", decoded);  
    req.user = decoded;  
    next(); 
  } catch (error) {
    console.error("Error al verificar el token:", error);
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};

module.exports = verifyToken;
