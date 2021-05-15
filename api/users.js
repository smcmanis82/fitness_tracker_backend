const express = require("express");
const usersRouter = express.Router();

const {
  createUser,
  getUser,
  getUserByUsername,
  getPublicRoutinesByUser,
} = require("../db");

const jwt = require("jsonwebtoken");
const { requireUser } = require("./utils");
const { JWT_SECRET } = process.env;

usersRouter.post("/register", async (req, res, next) => {
  //  Create a new user. Require username and password, and hash password before saving user to DB. Require all passwords to be at least 8 characters long.
  //  Throw errors for duplicate username, or password-too-short.
  const { username, password } = req.body;
  try {
    const _user = await getUserByUsername(username);

    if (_user) {
      throw Error("Username already exists.");
    }

    if (password.length < 8) {
      throw Error("Password must be at least 8 characters long.");
    }

    const user = await createUser({ username, password });

    if (!user) {
      throw Error(`Error creating user.`);
    } else {
      const token = jwt.sign(
        {
          id: user.id,
          username,
        },
        JWT_SECRET,
        {
          expiresIn: "1w",
        }
      );

      res.send({
        message: "You have successfully registered!",
        user,
        token,
      });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

usersRouter.post("/login", async (req, res, next) => {
  //  Log in the user. Require username and password, and verify that plaintext login password matches the saved hashed password before returning a JSON Web Token.
  //  Keep the id and username in the token.
  const { username, password } = req.body;

  if (!username || !password) {
    next({
      message: "Please enter both a username and password.",
    });
  }

  try {
    const user = await getUser({ username, password });

    if (user) {
      const token = jwt.sign(user, JWT_SECRET, { expiresIn: "1w" });

      res.send({
        message: "You have logged in!",
        id: user.id,
        username,
        token,
      });
    } else {
      next({
        message: "Username or password you entered is incorrect.",
      });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

usersRouter.get("/me", requireUser, async (req, res, next) => {
  //  Send back the logged-in user's data if a valid token is supplied in the header.
  try {
    res.send(req.user);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

usersRouter.get("/:username/routines", async (req, res, next) => {
  //  Get a list of public routines for a particular user.
  try {
    const { username } = req.params;
    const publicRoutinesUser = await getPublicRoutinesByUser({ username });

    if (!publicRoutinesUser) {
      throw Error(`User does not have public routines.`);
    }

    res.send(publicRoutinesUser);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// export the api router
module.exports = usersRouter;
