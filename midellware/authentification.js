const jwt = require('jsonwebtoken');

module.exports = (req,res,next)=>{

    try{
    const token = req.headers.authorization.split(' ')[1]; // authorization:'Bearer TOKEN'
    
    if(!token){
        throw new Error('Authentication failed');
    }

    const decodedToken = jwt.verify(token,process.env.SECRET_CODE);
   
    req.userData={
        userId:decodedToken.id,
        userRole:decodedToken.user_level,
      };
    next();
    

}catch(err){
    res.status(403).json("Authentication failed");
}


};


// // const resultPayment = await axios({
// //     headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`},
// //     method: 'get',
// //     url,
// //     });