const jwtPrivateKey = process.env.JWTPRIVATEKEY


module.exports = function(){
    if(!jwtPrivateKey){
        throw new Error('FATAL ERROR OCCURED: jwtPrivateKey is not defined');
    }
}