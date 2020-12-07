module.exports = async function(req,res,next){
    if(req.user.isVerified) next()
    else 
    return res.send("Kindly verify your email");
}