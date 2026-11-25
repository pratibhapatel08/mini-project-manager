
import Task from "../models/Task.js";
import Project from "../models/Project.js";

// Create Task
export const createTask = async (req, res, next) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      project,
      assignedTo,
    } = req.body;

    const existingProject = await Project.findOne({
      _id: project,
      owner: req.user._id,
    });

    if (!existingProject) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      project,
      assignedTo,
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    next(error);
  }
};

// Get All Tasks
export const getTasks = async (req, res, next) => {
  try {
    const { status, priority, sort } = req.query;

    const filter = {
      createdBy: req.user._id,
    };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const sortOption = sort === "oldest"
      ? { createdAt: 1 }
      : { createdAt: -1 };

    const tasks = await Task.find(filter)
      .populate("project", "title")
      .populate("assignedTo", "name email")
      .sort(sortOption);

    res.status(200).json({ tasks });
  } catch (error) {
    next(error);
  }
};

// Get Single Task
export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(200).json({ task });
  } catch (error) {
    next(error);
  }
};

// Update Task
export const updateTask = async (req, res, next) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      project,
    } = req.body;

    const existingTask = await Task.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!existingTask) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    if (project !== undefined) {
      const existingProject = await Project.findOne({
        _id: project,
        owner: req.user._id,
      });

      if (!existingProject) {
        return res.status(404).json({
          message: "Project not found",
        });
      }

      existingTask.project = project;
    }

    if (title !== undefined) existingTask.title = title;
    if (description !== undefined) existingTask.description = description;
    if (status !== undefined) existingTask.status = status;
    if (priority !== undefined) existingTask.priority = priority;
    if (dueDate !== undefined) existingTask.dueDate = dueDate || null;

    await existingTask.save();

    await existingTask.populate("project", "title");
    await existingTask.populate("assignedTo", "name email");

    res.status(200).json({
      message: "Task updated successfully",
      task: existingTask,
    });
  } catch (error) {
    next(error);
  }
};
// Delete Task
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

