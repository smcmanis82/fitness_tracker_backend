const client = require("./client");

async function getRoutineActivityById(id) {
  try {
    const {
      rows: [routine_activity],
    } = await client.query(
      `
              SELECT *
              FROM routine_activities
              WHERE id=$1;
              `,
      [id]
    );
    return routine_activity;
  } catch (error) {
    throw error;
  }
}
async function addActivityToRoutine({
  //  create a new routine_activity, and return it
  routineId,
  activityId,
  count,
  duration,
}) {
  try {
    const {
      rows: [routine_activity],
    } = await client.query(
      `
    INSERT INTO routine_activities ("routineId", "activityId", count, duration)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
      `,
      [routineId, activityId, count, duration]
    );
    return routine_activity;
  } catch (error) {
    throw error;
  }
}

async function updateRoutineActivity({ id, count, duration }) {
  //  Find the routine with id equal to the passed in id
  //  Update the count or duration as necessary
  try {
    const {
      rows: [routine_activity],
    } = await client.query(
      `
      UPDATE routine_activities
      SET count=$2, duration=$3
      WHERE id=$1
      RETURNING *;
        `,
      [id, count, duration]
    );
    return routine_activity;
  } catch (error) {
    throw error;
  }
}

async function destroyRoutineActivity(id) {
  //  remove routine_activity from database
  try {
    const {
      rows: [routine_activity],
    } = await client.query(
      `
      DELETE FROM routine_activities
      WHERE id = $1
      RETURNING *;
        `,
      [id]
    );
    return routine_activity;
  } catch (error) {
    throw error;
  }
}
async function getRoutineActivitiesByRoutine({ id }) {
  //  select and return an array of all routine_activity records
  try {
    const { rows: routine_activity } = await client.query(
      `
      SELECT * 
      FROM routine_activities
      WHERE "routineId" = $1;
      `,
      [id]
    );

    return routine_activity;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  client,
  getRoutineActivityById,
  addActivityToRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  getRoutineActivitiesByRoutine,
};
