// const LocalStrategy = require('passport-local').Strategy
// const passport = require('passport')
// const user = require('./schema')

// exports.initializePassport = (passport)=>{
//     passport.use(new LocalStrategy(async(username,password,done)=>{
//         try{
//             const User = await user.findOne({Username : username})
//             if(!User)
//             {
//                 return done(null,false,{message : "user not found"})
//             }
//             else if(User.password !== password)
//             {
//                 return done(null,false,{message : "Invalid password"})
//             }
//             return done(null,User)
//         }
//         catch(err)
//         {
//             return done(err)
//         }

//         passport.serializeUser((User,done)=>{
//             done(null,User.id)
//         })

//         passport.deserializeUser(async(id,done)=>{
//             try{
//                 const user = await findById(id) 
//                 done(null,user)
//             }
//             catch(err)
//             {
//                 done(err)
//             }
//         })
//     }))



// }
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const user = require('./schema');

exports.initializePassport = (passport) => {
  passport.use(
    new LocalStrategy({ usernameField: 'Username' }, async (username, password, done) => {
      try {
        const User = await user.findOne({ Username: username });
        if (!User) {
          return done(null, false, { message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, User.password);
        if (!isMatch) {
          return done(null, false, { message: "Invalid password" });
        }

        return done(null, User);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((User, done) => {
    done(null, User.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const foundUser = await user.findById(id);
      done(null, foundUser);
    } catch (err) {
      done(err);
    }
  });
};
