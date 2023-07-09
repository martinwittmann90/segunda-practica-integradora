import passport from "passport";
import local from "passport-local";
import UserModel from "../DAO/models/user.model.js";
import { compareHash, createHash } from "../config/bcrypt.js";
import dotenv from "dotenv";
dotenv.config();
import GitHubStrategy from "passport-github2";
import fetch from 'node-fetch';


const localStrategy = local.Strategy;

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;


import MongoDBCarts from '../services/dbcarts.service.js'
const dbCarts = new MongoDBCarts();

export default function initPassport() {

    passport.use("register", new localStrategy({
        passReqToCallback: true,
        usernameField: "email",
    }, async (req, username, password, done) => {
        try {
            const { email, firstName, lastName, age, role } = req.body;
            let user = await UserModel.findOne({ email: username });
            if (user) {
                console.log("User already exists");
                return done(null, false);
            }
            const newCart = await dbCarts.createOne();
            const cartID = newCart.result.payload._id.toString();
            
            const newUser = {
                email,
                firstName,
                lastName,
                age: Number(age),
                role: "user",
                password: createHash(password),
                cart: cartID,
            };
            let userCreated = (await UserModel.create(newUser));
            console.log(userCreated);
            console.log("User Registration succesful");
            return done(null, userCreated);
        }
        catch (e) {
            console.log("Error in register");
            console.log(e);
            return done(e);
        }
    }));

    passport.use("login", new localStrategy({ usernameField: "email" }, async (username, password, done) => {
        try {
            const user = (await UserModel.findOne({ email: username }));
            if (!user) {
                console.log("User Not Found with username (email) " + username);
                return done(null, false);
            }
            if (!compareHash(password, user.password)) {
                console.log("Invalid Password");
                return done(null, false);
            }
            return done(null, user);
        }
        catch (err) {
            return done(err);
        }
    }));

    passport.use("github", 
    new GitHubStrategy({
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: "http://localhost:8080/api/sessions/githubcallback",
    }, async (accesToken, refreshToken, profile, done) => {
        try {
            const res = await fetch('https://api.github.com/user/emails', {
                headers: {
                    Accept: 'application/vnd.github+json',
                    Authorization: 'Bearer ' + accesToken,
                    'X-Github-Api-Version': '2022-11-28',
                },
            });
            const emails = await res.json();
            const emailDetail = emails.find((email) => email.verified == true);
            if (!emailDetail) {
                return done(new Error('cannot get a valid email for this user'));
            }
            profile.email = emailDetail.email;
            console.log(profile);
            let user = await UserModel.findOne({ email: profile.email });
            if (!user) {
                const newCart = await dbCarts.createOne();
                const cartID = newCart.result.payload._id.toString();
                const newUser = {
                    email: profile.email,
                    firstName: profile._json.name || profile._json.login || "noname",
                    lastName: "nolast",
                    age: 18,
                    role: "user",
                    password: "nopass",
                    cart: cartID,
                };
                let userCreated = await UserModel.create(newUser);
                console.log("User Registration succesful");
                return done(null, userCreated);
            }
            else {
                console.log("User already exists");
                return done(null, user);
            }
        }
        catch (e) {
            console.log("Error in Auth GitHub!");
            console.log(e);
            return done(e);
        }
    }));
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        let user = (await UserModel.findById(id));
        done(null, user);
    });
}