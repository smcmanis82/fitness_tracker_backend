const express = require("express");
const routineActivityRouter = express.Router();

const {
  getRoutineActivityById,
  getRoutineById,
  updateRoutineActivity,
  destroyRoutineActivity,
} = require("../db");

routineActivityRouter.patch("/:routineActivityId", async (req, res, next) => {
  //  Update the count or duration on the routine activity
  const { count, duration } = req.body;
  const id = req.params.routineActivityId;
  try {
    const routineActivity = await getRoutineActivityById(id);

    if (!routineActivity) {
      return next({ message: "can't get routine activity" });
    }

    const routine = await getRoutineById(routineActivity.routineId);

    if (!routine) {
      return next({ message: "can't get routine" });
    }

    if (req.user.id !== routine.creatorId) {
      return next({ message: "must be user" });
    }

    const updatedRoutineActivity = await updateRoutineActivity({
      id,
      count,
      duration,
    });
    res.send(updatedRoutineActivity);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

routineActivityRouter.delete("/:routineActivityId", async (req, res, next) => {
  //  Remove an activity from a routine, use hard delete
  const { routineActivityId } = req.params;

  try {
    const routineActivity = await getRoutineActivityById(routineActivityId);
    const routine = await getRoutineById(routineActivity.routineId);

    if (req.user.id === routine.creatorId) {
      const destroyActivity = await destroyRoutineActivity(routineActivityId);

      res.send(destroyActivity);
    } else {
      next({ message: "error" });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// export the api router
module.exports = routineActivityRouter;
