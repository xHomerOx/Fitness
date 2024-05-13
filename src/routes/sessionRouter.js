import { Router } from "express";
import userManagerDB from "../dao/userManagerDB.js";
import passport from "passport";

const sessionRouter = Router();

const userManagerService = new userManagerDB();

sessionRouter.get("/users", async (_req, res) => {
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

sessionRouter.post(
  "/register",
  async (req, res) => {
    await userManagerService.registerUser(req.body);

    res.render("login", {
      title: "YesFitness | Login",
      style: "index.css",
      failLogin: req.session.failLogin ?? false,
    });
  }
);

sessionRouter.get("/failRegister", (_req, res) => {
  res.status(400).send({
    status: "error",
    message: "Failed Register",
  });
});

sessionRouter.post("/login", async (_req, res) => {
  const token = await userManagerService.getUsers();
  if (!token) {
    return res.status(401).send({
      status: "error",
      message: "Error login!",
    });
  }
  res.cookie("auth", token, { maxAge: 60 * 60 * 1000, httpOnly: true });
  res.redirect("/user");
});

sessionRouter.get("/failLogin", (_req, res) => {
  res.status(400).send({
    status: "error",
    message: "Failed Login",
  });
});

sessionRouter.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] }),
  (_req, res) => {
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
  req.session.destroy((_error) => {
    res.clearCookie("auth");
    res.redirect("/login");
  });
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

export default sessionRouter;
