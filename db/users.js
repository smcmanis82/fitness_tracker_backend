const client = require("./client");
const bcrypt = require("bcrypt");

async function createUser({ username, password }) {
  //  make sure to hash the password before storing it to the database
  try {
    const SALT_COUNT = 10;
    const hashedPassword = await bcrypt.hash(password, SALT_COUNT);
    const {
      rows: [user],
    } = await client.query(
      `
      INSERT INTO users (username, password)
      VALUES($1, $2) 
      RETURNING *;
              `,
      [username, hashedPassword]
    );
    password = hashedPassword;
    delete user.password;
    return user;
  } catch (error) {
    throw error;
  }
}

async function getUser({ username, password }) {
  //  this should be able to verify the password against the hashed password
  const user = await getUserByUsername(username);
  const hashedPassword = user.password;
  try {
    const passwordMatch = await bcrypt.compare(password, hashedPassword);
    if (passwordMatch === true) {
      delete user.password;
      return user;
    }
  } catch (error) {
    throw error;
  }
}

async function getUserById(id) {
  //  select a user using the user's ID. Return the user object.
  //  do NOT return the password
  try {
    const {
      rows: [user],
    } = await client.query(
      `
      SELECT *
      FROM users
      WHERE id=$1
        `,
      [id]
    );
    delete user.password;
    return user;
  } catch (error) {
    throw error;
  }
}

async function getUserByUsername(username) {
  //  select a user using the user's username. Return the user object.
  try {
    const {
      rows: [user],
    } = await client.query(
      `
      SELECT *
      FROM users
      WHERE username=$1
        `,
      [username]
    );
    return user;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  client,
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
};
