import Project from "../models/Project.js";

// Create Project
export const createProject = async (req, res, next) => {
  try {
    const { title, description, status } = req.body;

    const project = await Project.create({
      title,
      description,
      status,
      owner: req.user._id,
    });

    res.status(201).json({
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    next(error);
  }
};

// Get All Projects
export const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({
      owner: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({ projects });
  } catch (error) {
    next(error);
  }
};

// Get Single Project
export const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({ project });
  } catch (error) {
    next(error);
  }
};

// Update Project
export const updateProject = async (req, res, next) => {
  try {
    const { title, description, status } = req.body;

    const project = await Project.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: req.user._id,
      },
      { title, description, status },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    next(error);
  }
};

// Delete Project
export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    next(error);
  }
};
