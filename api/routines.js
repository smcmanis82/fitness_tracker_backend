const express = require("express");
const routinesRouter = express.Router();

const {
  getRoutineById,
  getAllPublicRoutines,
  createRoutine,
  updateRoutine,
  destroyRoutine,
  addActivityToRoutine,
} = require("../db");
const { requireUser } = require("./utils");

routinesRouter.get("/", async (req, res, next) => {
  //  Return a list of public routines, include the activities with them
  try {
    const routines = await getAllPublicRoutines();

    res.send(routines);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

routinesRouter.post(
  "/:routineId/activities",
  requireUser,
  async (req, res, next) => {
    // Attach a single activity to a routine. Prevent duplication on (routineId, activityId) pair.
    const { activityId, count, duration } = req.body;
    const { routineId } = req.params;
    const addActivity = {};
    try {
      addActivity.activityId = activityId;
      addActivity.count = count;
      addActivity.duration = duration;
      addActivity.routineId = routineId;

      const activityRoutine = await addActivityToRoutine(addActivity);

      res.send(activityRoutine);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

routinesRouter.post("/", requireUser, async (req, res, next) => {
  //  Create a new routine
  const { name, goal, isPublic } = req.body;
  const insertRoutineData = {};
  try {
    insertRoutineData.creatorId = req.user.id;
    insertRoutineData.name = name;
    insertRoutineData.goal = goal;
    insertRoutineData.isPublic = isPublic;

    const routine = await createRoutine(insertRoutineData);

    res.send(routine);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

routinesRouter.patch("/:routineId", requireUser, async (req, res, next) => {
  //  Update a routine, notably change public/private, the name, or the goal
  try {
    const { ...fields } = req.body;
    const id = req.params.routineId;

    const routineToUpdate = await getRoutineById(id);

    if (!routineToUpdate) {
      next({ name: "wrong routine", message: `no routine for ${id}` });
    } else {
      if (req.user.id !== routineToUpdate.creatorId) {
        next({
          name: "another message",
          message: `you must be the same user`,
        });
      } else {
        const newRoutine = await updateRoutine({ id, ...fields });

        if (newRoutine) {
          res.send(newRoutine);
        } else {
          next({
            name: "routine doesnt exist",
            message: `error with your update`,
          });
        }
      }
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

routinesRouter.delete("/:routineId", requireUser, async (req, res, next) => {
  //  Hard delete a routine. Make sure to delete all the routineActivities whose routine is the one being deleted.
  const routineId = req.params.routineId;
  try {
    const routineDelete = await destroyRoutine(routineId);
    res.send(routineDelete);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// export the api router
module.exports = routinesRouter;
