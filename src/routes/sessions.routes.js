import express from 'express';
import passport from "passport";
import UserService from "../services/dbuser.service.js";

const usersService = new UserService();

const sessionsRouter = express.Router();

sessionsRouter.post("/register", passport.authenticate("register", { failureRedirect: "failRegister" }), async (req, res) => {
    req.session.user = {
        _id: req.user._id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        rol: req.user.rol,
        age: req.user.age,
        cart: req.user.cart,
    };
    return res.status(201).json({ status: "success", message: "User created successfully", payload: req.user });
});
sessionsRouter.get("/failRegister", (req, res) => {
    return res.status(400).json({ status: "error", message: "Error adding user" });
});
sessionsRouter.post("/login", passport.authenticate("login", { failureRedirect: "faillogin" }), async (req, res) => {
    if (!req.user) {
        req.session.user = {
            _id: req.user._id,
            email: req.user.email,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            rol: req.user.rol,
            age: req.user.age,
            cart: req.user.cart,
          };
        return res.status(400).json({ error: "Invalid Credentials" });
    }
    const { _id, email, firstName, lastName, age, role } = req.user;
    req.session.user = { _id, email, firstName, lastName, age, role };
    return res.status(200).json({ status: "success", message: "User logged in successfully", payload: req.user });
});
sessionsRouter.get("/faillogin", (req, res) => {
    return res.status(400).json({ status: "error", message: "Wrong user or password" });
});

sessionsRouter.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

sessionsRouter.get("/githubcallback", passport.authenticate("github", { failureRedirect: "/login" }), (req, res) => {
    req.session.user = req.user;
    res.redirect("/products");
});

sessionsRouter.get("/logout", async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ status: "error", message: "Error! Couldn't logout!" });
        }
        res.clearCookie("connect.sid");
        return res.status(200).json({ status: "success", message: "Logout succesfully!" });
    });
});

sessionsRouter.get("/current", (req, res) => {
    console.log(req.session);
    return res.status(200).json({ user: req.session.user });
  });

sessionsRouter.get("/", (req, res) => {
    return res.render("profile", req.session.user = {
        _id: req.user._id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        role: req.user.role,
        age: req.user.age,
        cart: req.user.cart,
      });
});
export default sessionsRouter;