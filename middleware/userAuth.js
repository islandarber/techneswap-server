import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
    const secretToken = process.env.SECRET_TOKEN;

    const authHeader = req.headers.authorization;

    if(!authHeader){
     return res.sendStatus(401)
    }

    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, secretToken, (err, user) => {
     if(err){
          return res.sendStatus(403)
     }
     // Console to check token result after being recorded by jwt.verify method
     console.log(user, 'token decoded')
     req.user = user;
     next()

    })

 
 }