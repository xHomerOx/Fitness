import { Router } from "express";
import userManagerDB from "../dao/userManagerDB.js";
import passport from "passport";

const sessionRouter = Router();

const userManagerService = new userManagerDB();

sessionRouter.get("/users", async (req, res) => {
  try {
    const result = await userManagerService.getUsers();
    res.send({ users: result });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

sessionRouter.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    res.send({
      user: req.user,
    });
  }
);

sessionRouter.post(
  "/register",
  passport.authenticate("register", {
    failureRedirect: "/api/session/failRegister",
  }),
  async (req, res) => {
    res.redirect("/login");
  }
);

sessionRouter.get("/failRegister", (req, res) => {
  res.status(400).send({
    status: "error",
    message: "Failed Register",
  });
});

sessionRouter.post("/login", (req, res) => {
  const token = req.user.generateAuthToken();
  if (!token) {
    return res.status(401).send({
      status: "error",
      message: "Error login!",
    });
  }
  res.cookie("auth", token, { maxAge: 60 * 60 * 1000, httpOnly: true });
  res.redirect("/user");
});

sessionRouter.get("/failLogin", (req, res) => {
  res.status(400).send({
    status: "error",
    message: "Failed Login",
  });
});

sessionRouter.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] }),
  (req, res) => {
    res.send({
      status: "success",
      message: "Success",
    });
  }
);

sessionRouter.get(
  "/githubcallback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  (req, res) => {
    req.session.user = req.user;
    res.redirect("/user");
  }
);

sessionRouter.get("/logout", (req, res) => {
  req.session.destroy((error) => {
    res.clearCookie("auth");
    res.redirect("/login");
  });
});

export default sessionRouter;
