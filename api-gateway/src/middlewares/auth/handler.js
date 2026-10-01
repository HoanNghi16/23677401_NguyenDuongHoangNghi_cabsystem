export const authenticate = (req, res, next) =>{
    try {
        let access = req.query.token;
        if (!access){
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(401).json({
                    message: "Vui lòng đăng nhập!"
                });
            }

            const [type, token] = authHeader.split(" ");

            if (type !== "Bearer" || !token) {
                return res.status(401).json({
                    message: "Token không hợp lệ!"
                });
            }
            access = token;
        }

        const payload = jwt.verify(
            access,
            process.env.JWT_ACCESS_SECRET
        );

        req.user = payload;

        next();
    } catch (error) {
        return res.status(401).json({
            message: error.message || "Token không hợp lệ!"
        });
    }
}


export const authorize = (req, res, next)=>{
    
}