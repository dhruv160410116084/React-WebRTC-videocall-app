const pool = require('../dbConnection')




class UserController {

    async register(req,res,next){
        try {
            let data = req.body
            console.log(data)
            let user = await pool.query('INSERT INTO users (email,password,username,profile) values ($1,$2,$3,$4) Returning *',[data.email,data.password,data.username,'https://ui-avatars.com/api/?bold=true&background=ffffff&color=000000&name='+data.username])
            console.log(user)
            return res.send({success:true,data:user.rows})
        } catch (error) {
            next(error)
        }
    }

    async login(req,res,next){
        try {
            let data = req.body
            let user = await pool.query('SELECT * FROM users WHERE email=$1 and password=$2',[data.email,data.password])
            console.log(user.rows)
            if(user.rowCount == 1){
                return res.send({success:true,data:user.rows[0]})
            }
            return res.send({success:false,message:'User Not found'});

        } catch (error) {
            next(error)
        }
    }

    async  list(req,res,next){
        try {

            let skip = Number(req.query.skip) || 0;
            let limit = Number(req.query.limit) || 10

            let data = await pool.query('SELECT * FROM users OFFSET $1 LIMIT $2;',[skip,limit]);

            res.send(data.rows)
        } catch (error) {
           next(error)
        }
    }

}

module.exports= new UserController();