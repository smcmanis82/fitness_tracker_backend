const client = require("./client");
const util = require("./utils");
const { attachActivitiesToRoutines } = require("./activities");

async function getRoutineById(id) {
  try {
    const {
      rows: [routine],
    } = await client.query(
      `
      SELECT *
      FROM routines
      WHERE id=$1
      `,
      [id]
    );

    return routine;
  } catch (error) {
    throw error;
  }
}

async function getRoutinesWithoutActivities() {
  //  select and return an array of all routines
  try {
    const { rows } = await client.query(`
      SELECT *
      FROM routines
      `);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getAllRoutines() {
  //  select and return an array of all routines, include their activities
  try {
    const { rows: routines } = await client.query(`
      SELECT *, users.username AS "creatorName"
      FROM routines
      JOIN users ON "creatorId" = users.id;
      `);

    return attachActivitiesToRoutines(routines);
  } catch (error) {
    throw error;
  }
}

async function getAllPublicRoutines() {
  //  select and return an array of public routines, include their activities
  try {
    const { rows: routines } = await client.query(
      `
      SELECT *, users.username AS "creatorName"
      FROM routines
      JOIN users ON routines."creatorId" = users.id
      WHERE "isPublic" = true;
        `
    );

    return attachActivitiesToRoutines(routines);
  } catch (error) {
    throw error;
  }
}

async function getAllRoutinesByUser({ username }) {
  //  select and return an array of all routines made by user, include their activities
  try {
    const { rows: routines } = await client.query(
      `
      SELECT *, users.username AS "creatorName"
      FROM routines
      JOIN users ON "creatorId" = users.id
      WHERE users.username = $1;
        `,
      [username]
    );

    return attachActivitiesToRoutines(routines);
  } catch (error) {
    throw error;
  }
}

async function getPublicRoutinesByUser({ username }) {
  //  select and return an array of public routines made by user, include their activities
  try {
    const { rows: routines } = await client.query(
      `
      SELECT *, users.username AS "creatorName"
      FROM routines
      JOIN users ON "creatorId" = users.id
      WHERE users.username = $1 AND "isPublic" = true;
    `,
      [username]
    );

    return attachActivitiesToRoutines(routines);
  } catch (error) {
    throw error;
  }
}

async function getPublicRoutinesByActivity({ id }) {
  //  select and return an array of public routines which have a specific activityId in their routine_activities join, include their activities
  try {
    const { rows: routines } = await client.query(
      `
      SELECT *, users.username AS "creatorName"
      FROM routines
      JOIN users ON "creatorId" = users.id
      WHERE "isPublic" = true;

    `
    );
    const { rows: activities } = await client.query(
      `
      SELECT * FROM activities
      JOIN routine_activities ON routine_activities."activityId" = activities.id
      WHERE "activityId" = $1;
        `,
      [id]
    );

    return attachActivitiesToRoutines(routines);
  } catch (error) {
    throw error;
  }
}

async function createRoutine({ creatorId, isPublic, name, goal }) {
  //  create and return the new routine
  try {
    const {
      rows: [routine],
    } = await client.query(
      `
      INSERT INTO routines ("creatorId", "isPublic", name, goal)
      VALUES ($1, $2, $3, $4)
      RETURNING *
        `,
      [creatorId, isPublic, name, goal]
    );

    return routine;
  } catch (error) {
    throw error;
  }
}

async function updateRoutine({ id, ...fields }) {
  //  Find the routine with id equal to the passed in id
  //  Don't update the routine id, but do update the isPublic status, name, or goal, as necessary
  //  Return the updated routine
  try {
    const toUpdate = {};
    for (let column in fields) {
      if (fields[column] !== undefined) {
        toUpdate[column] = fields[column];
      }
    }
    if (util.dbFields(fields).insert.length > 0) {
      const { rows } = await client.query(
        `
      UPDATE routines
      SET ${util.dbFields(toUpdate).insert}
      WHERE id=${id}
      RETURNING *;
          `,
        Object.values(toUpdate)
      );
      let routine = rows[0];

      return routine;
    }
  } catch (error) {
    throw error;
  }
}

async function destroyRoutine(id) {
  //  remove routine from database
  //  Make sure to delete all the routine_activities whose routine is the one being deleted.
  try {
    await client.query(
      `
      DELETE FROM routine_activities 
      WHERE "routineId" = $1;
      `,
      [id]
    );
    const {
      rows: [routine],
    } = await client.query(
      `
      DELETE FROM routines 
      WHERE id = $1
      RETURNING *;
      `,
      [id]
    );
    return routine;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  client,
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
};
