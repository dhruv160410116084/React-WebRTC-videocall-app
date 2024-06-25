module.exports= function errorHandler(error,req,res,next){
    try {
        console.log(error)
        res.send({success:false,data:error.message})
    } catch (error) {
        console.log(error)
    }
}