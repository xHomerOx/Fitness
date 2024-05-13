import passport from "passport";
import GitHubStrategy from "passport-github2";
import jwt, { ExtractJwt } from "passport-jwt";
import { userModel } from "../dao/models/userModel.js";
import { createHash, isValidPassword } from "../utils/functionUtil.js";
import userManagerDB from "../dao/userManagerDB.js";
import cartManagerDB from "../dao/cartManagerDB.js";
import * as dotenv from "dotenv";
dotenv.config();

const userManagerService = new userManagerDB();
const cartManagerService = new cartManagerDB();

const JWTStrategy = jwt.Strategy;

const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies.auth ?? null;
  }
  return token;
};

const initializePassport = () => {
  const Cliend_Id = process.env.CLIENT_ID;
  const Secret_Id = process.env.SECRET_ID;
  const secretKey = process.env.SECRET_KEY;

  passport.use(
    "register",
    new JWTStrategy(
      {
        passReqToCallback: true,
        usernameField: "email",
        jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
        secretOrKey: secretKey,
      },
      async (req, username, password, done) => {
        const { firstName, lastName, email, age } = req.body;
        try {
          const user = await userManagerService.findUserEmail(username);
          if (user) {
            console.log("User already exist");
            return done(null, false);
          }

          const newUser = {
            firstName,
            lastName,
            email,
            age,
            password: createHash(password),
          };

          const registeredUser = await userManagerService.registerUser(newUser);
          const cart = await cartManagerService.createCart(registeredUser._id);
          const result = await userManagerService.updateUser(
            registeredUser._id,
            cart._id
          );

          return done(null, result);
        } catch (error) {
          console.log(error.message);
          return done(error.message);
        }
      }
    )
  );

  passport.use(
    "github",
    new GitHubStrategy(
      {
        clientID: Cliend_Id,
        clientSecret: Secret_Id,
        callbackURL: "http://localhost:8080/api/session/githubcallback",
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const user = await userModel.findOne({
            email: profile._json.email,
          });
          console.log(profile);
          if (!user) {
            const newUser = {
              id: profile._id,
              username: profile._json.login,
              firstName: profile._json.name,
              email: profile._json.email,
              role: "student",
            };

            const registeredUser = await userManagerService.registerUser(
              newUser
            );
            const cart = await cartManagerService.createCart(
              registeredUser._id
            );
            const result = await userManagerService.updateUser(
              registeredUser._id,
              cart._id
            );
            done(null, result);
          } else {
            done(null, user);
          }
        } catch (error) {
          return done(null, user);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user._id));

  passport.deserializeUser(async (id, done) => {
    const user = await userModel.findById(id);
    done(null, user);
  });
};

export default initializePassport;
