"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
} from "@/redux/slices/taskSlice";
import { fetchProjects } from "@/redux/slices/projectSlice";
import { logoutUser as logoutUserThunk } from "@/redux/slices/authSlice";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Settings,
  LogOut,
  Search,
  Plus,
  Menu,
  X,
  Pencil,
  Trash2,
  ListTodo,
  Clock,
  CircleCheck,
  AlertCircle,
  Loader2,
  CalendarDays,
  SlidersHorizontal,
  Flag,
  ClipboardList,
} from "lucide-react";

const initialForm = {
  title: "",
  description: "",
  project: "",
  status: "todo",
  priority: "medium",
  dueDate: "",
};

const statusStyles = {
  todo: "bg-amber-50 text-amber-700",
  "in-progress": "bg-blue-50 text-blue-700",
  done: "bg-emerald-50 text-emerald-700",
};

const priorityStyles = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-orange-50 text-orange-700",
  high: "bg-red-50 text-red-700",
};

const inputClass =
  "w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-white";

export default function TasksPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { tasks, loading, error } = useSelector(
    (state) => state.tasks
  );

  const { projects } = useSelector(
    (state) => state.projects
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [dueDateFilter, setDueDateFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState(initialForm);

  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [formError, setFormError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchTasks());

    if (!projects.length) {
      dispatch(fetchProjects());
    }
  }, [dispatch, projects.length]);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        const matchesSearch =
          (task.title || "")
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          (task.description || "")
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          (typeof task.project === "object"
            ? task.project?.name || ""
            : projects.find((p) => p._id === task.project)?.name || "")
            .toLowerCase()
            .includes(search.toLowerCase());

        const matchesStatus =
          statusFilter === "all" || task.status === statusFilter;

        const matchesPriority =
          priorityFilter === "all" || task.priority === priorityFilter;

        const taskDueDate = task.dueDate
          ? new Date(task.dueDate).toISOString().split("T")[0]
          : "";

        const today = new Date().toISOString().split("T")[0];

        const matchesDueDate =
          dueDateFilter === "all" ||
          (dueDateFilter === "upcoming" && taskDueDate >= today && taskDueDate !== "") ||
          (dueDateFilter === "overdue" && taskDueDate !== "" && taskDueDate < today);

        return matchesSearch && matchesStatus && matchesPriority && matchesDueDate;
      })
      .sort((a, b) => {
        if (sortOrder === "due-earliest") {
          return new Date(a.dueDate || "9999-12-31") - new Date(b.dueDate || "9999-12-31");
        }

        if (sortOrder === "due-latest") {
          return new Date(b.dueDate || 0) - new Date(a.dueDate || 0);
        }

        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();

        return sortOrder === "oldest" ? dateA - dateB : dateB - dateA;
      });
  }, [tasks, projects, search, statusFilter, priorityFilter, sortOrder, dueDateFilter]);

  const counts = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setForm({
      ...initialForm,
      project: projects[0]?._id || "",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);

    setForm({
      title: task.title || "",
      description: task.description || "",
      project:
        typeof task.project === "object"
          ? task.project?._id || ""
          : task.project || "",
      status: task.status || "todo",
      priority: task.priority || "medium",
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0]
        : "",
    });

    setFormError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;

    setIsModalOpen(false);
    setEditingTask(null);
    setForm(initialForm);
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.title.trim()) {
      setFormError("Task title is required.");
      return;
    }

    if (!form.project) {
      setFormError("Please select a project.");
      return;
    }

    const payload = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      dueDate: form.dueDate || null,
    };

    setSubmitting(true);

    try {
      if (editingTask) {
        await dispatch(
          updateTask({
            id: editingTask._id,
            data: payload,
          })
        ).unwrap();
      } else {
        await dispatch(createTask(payload)).unwrap();
      }

      closeModal();
    } catch (err) {
      setFormError(
        typeof err === "string" ? err : "Unable to save task."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task? This action cannot be undone."
    );

    if (!confirmed) return;

    setDeletingId(id);

    try {
      await dispatch(deleteTask(id)).unwrap();
    } catch (err) {
      window.alert(
        typeof err === "string" ? err : "Unable to delete task."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = async () => {
    await dispatch(logoutUserThunk());
    router.replace("/login");
  };

  const getProjectName = (project) => {
    if (project && typeof project === "object") {
      return project.title || "Project";
    }

    return projects.find((p) => p._id === project)?.name || "Project";
  };

  const formatDate = (date) => {
    if (!date) return "No due date";

    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const isOverdue = (date, status) => {
    if (!date || status === "done") return false;

    const due = new Date(date);
    due.setHours(23, 59, 59, 999);

    return due < new Date();
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="h-20 flex items-center justify-between gap-3 px-7 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl">
            <FolderKanban size={23} />
          </div>
          <span className="text-xl font-bold">ProjectFlow</span>
        </div>

        <button
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden text-slate-400 hover:text-white"
        >
          <X size={22} />
        </button>
      </div>

      <div className="px-5 py-7">
        <p className="text-xs uppercase tracking-widest text-slate-500 mb-4 px-3">
          Workspace
        </p>

        <nav className="space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <LayoutDashboard size={19} /> Dashboard
          </Link>

          <Link
            href="/projects"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <FolderKanban size={19} /> Projects
          </Link>

          <Link
            href="/tasks"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-600 text-white"
          >
            <CheckSquare size={19} /> My Tasks
          </Link>
        </nav>

        <p className="text-xs uppercase tracking-widest text-slate-500 mt-10 mb-4 px-3">
          Preferences
        </p>

        <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 w-full">
          <Settings size={19} /> Settings
        </button>
      </div>

      <div className="mt-auto p-5">
        <div className="bg-slate-800 rounded-xl p-4">
          <p className="font-semibold text-sm">Stay productive!</p>
          <p className="text-xs text-slate-400 mt-2">
            Small steps every day lead to big achievements.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="mt-4 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition"
        >
          <LogOut size={19} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="hidden md:flex w-64 bg-[#111827] text-white flex-col fixed inset-y-0 z-20">
        <Sidebar />
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            className="absolute inset-0 bg-slate-950/60"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation"
          />
          <aside className="relative w-72 max-w-[85%] h-full bg-[#111827] text-white">
            <Sidebar />
          </aside>
        </div>
      )}

      <main className="flex-1 md:ml-64 min-w-0">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-5 md:px-9">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-slate-600"
              aria-label="Open navigation"
            >
              <Menu size={23} />
            </button>

            <div>
              <h1 className="text-xl font-bold text-slate-900">
                My Tasks
              </h1>
              <p className="text-xs text-slate-500">
                Manage and track your daily work
              </p>
            </div>
          </div>

          <button
            onClick={openCreateModal}
            disabled={!projects.length}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold transition"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">New Task</span>
            <span className="sm:hidden">New</span>
          </button>
        </header>

        <div className="p-5 md:p-9 max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">
              Task Overview
            </h2>
            <p className="text-slate-500 mt-1">
              Stay on top of your work and get things done.
            </p>
          </div>

          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Total Tasks",
                value: counts.total,
                icon: ListTodo,
                color: "text-indigo-600",
                bg: "bg-indigo-50",
              },
              {
                label: "To Do",
                value: counts.todo,
                icon: Clock,
                color: "text-amber-600",
                bg: "bg-amber-50",
              },
              {
                label: "In Progress",
                value: counts.inProgress,
                icon: ClipboardList,
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                label: "Done",
                value: counts.done,
                icon: CircleCheck,
                color: "text-emerald-600",
                bg: "bg-emerald-50",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="bg-white border border-slate-200 rounded-2xl p-5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-slate-500">
                      {item.label}
                    </p>
                    <div className={`${item.bg} ${item.color} p-2 rounded-xl`}>
                      <Icon size={19} />
                    </div>
                  </div>

                  <p className={`text-3xl font-bold mt-4 ${item.color}`}>
                    {item.value}
                  </p>
                </div>
              );
            })}
          </div>

          <section className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6">
            <div className="flex flex-col gap-5 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  All Tasks
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {filteredTasks.length} tasks found
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                  <Search size={17} className="text-slate-400 shrink-0" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search tasks..."
                    className="bg-transparent outline-none text-sm w-full text-slate-700"
                  />
                </div>

                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                  <SlidersHorizontal size={17} className="text-slate-400 shrink-0" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-transparent outline-none text-sm text-slate-700 w-full"
                  >
                    <option value="all">All Status</option>
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                  <Flag size={17} className="text-slate-400 shrink-0" />
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="bg-transparent outline-none text-sm text-slate-700 w-full"
                  >
                    <option value="all">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                  <CalendarDays size={17} className="text-slate-400 shrink-0" />
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="bg-transparent outline-none text-sm text-slate-700 w-full"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="due-earliest">Due Date: Earliest First</option>
                    <option value="due-latest">Due Date: Latest First</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                  <CalendarDays size={17} className="text-slate-400 shrink-0" />
                  <select
                    value={dueDateFilter}
                    onChange={(e) => setDueDateFilter(e.target.value)}
                    className="bg-transparent outline-none text-sm text-slate-700 w-full"
                  >
                    <option value="all">All Due Dates</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-50 text-red-700 p-4 text-sm">
                <AlertCircle size={18} className="shrink-0" />
                {error}
              </div>
            )}

            {loading ? (
              <div className="py-16 text-center text-slate-500">
                <Loader2 size={28} className="animate-spin mx-auto mb-3" />
                Loading tasks...
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="py-16 text-center">
                <ListTodo
                  size={44}
                  className="mx-auto text-slate-300 mb-4"
                />

                <h3 className="font-semibold text-slate-800">
                  {search ||
                  statusFilter !== "all" ||
                  priorityFilter !== "all"
                    ? "No matching tasks"
                    : "No tasks yet"}
                </h3>

                <p className="text-sm text-slate-500 mt-2">
                  {search ||
                  statusFilter !== "all" ||
                  priorityFilter !== "all"
                    ? "Try changing your search or filters."
                    : "Create your first task and start tracking your work."}
                </p>

                {!search &&
                  statusFilter === "all" &&
                  priorityFilter === "all" &&
                  projects.length > 0 && (
                    <button
                      onClick={openCreateModal}
                      className="mt-5 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700"
                    >
                      Create Your First Task
                    </button>
                  )}

                {!projects.length && (
                  <Link
                    href="/projects"
                    className="inline-flex mt-5 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700"
                  >
                    Create a Project First
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5">
                {filteredTasks.map((task) => (
                  <article
                    key={task._id}
                    className="border border-slate-200 rounded-2xl p-5 hover:border-indigo-200 hover:shadow-md transition bg-white"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl">
                        <CheckSquare size={21} />
                      </div>

                      <span
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full capitalize ${
                          statusStyles[task.status] ||
                          "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {(task.status || "todo").replace("-", " ")}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mt-5 break-words">
                      {task.title}
                    </h3>

                    <p className="text-sm text-slate-500 mt-2 min-h-10 break-words line-clamp-2">
                      {task.description || "No description added."}
                    </p>

                    <div className="mt-5 space-y-3">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <FolderKanban size={16} className="text-indigo-500 shrink-0" />
                        <span className="truncate">
                          {getProjectName(task.project)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-xs font-semibold px-3 py-1.5 rounded-full capitalize ${
                            priorityStyles[task.priority] ||
                            "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {task.priority || "medium"} priority
                        </span>

                        <div
                          className={`flex items-center gap-1.5 text-xs ${
                            isOverdue(task.dueDate, task.status)
                              ? "text-red-600 font-semibold"
                              : "text-slate-500"
                          }`}
                        >
                          <CalendarDays size={15} />
                          {formatDate(task.dueDate)}
                          {isOverdue(task.dueDate, task.status) && (
                            <span>(Overdue)</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 mt-5 pt-4 flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-400">
                        {task.createdAt
                          ? `Created ${formatDate(task.createdAt)}`
                          : "Recently created"}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(task)}
                          title="Edit task"
                          className="p-2 rounded-lg text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          onClick={() => handleDelete(task._id)}
                          disabled={deletingId === task._id}
                          title="Delete task"
                          className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-50"
                        >
                          {deletingId === task._id ? (
                            <Loader2 size={17} className="animate-spin" />
                          ) : (
                            <Trash2 size={17} />
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl my-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingTask ? "Edit Task" : "Create New Task"}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {editingTask
                    ? "Update your task details."
                    : "Add a new task to your project."}
                </p>
              </div>

              <button
                onClick={closeModal}
                disabled={submitting}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {formError && (
                <div className="flex items-center gap-2 bg-red-50 text-red-700 rounded-xl p-3 text-sm">
                  <AlertCircle size={17} className="shrink-0" />
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Task Title *
                </label>
                <input
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  placeholder="Enter task title"
                  maxLength={150}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Describe your task..."
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Select Project *
                </label>
                <select
                  value={form.project}
                  onChange={(e) =>
                    setForm({ ...form, project: e.target.value })
                  }
                  className={inputClass}
                  required
                >
                  <option value="">Choose a project</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                    className={inputClass}
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={form.priority}
                    onChange={(e) =>
                      setForm({ ...form, priority: e.target.value })
                    }
                    className={inputClass}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm({ ...form, dueDate: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting || !projects.length}
                  className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting && (
                    <Loader2 size={17} className="animate-spin" />
                  )}

                  {submitting
                    ? "Saving..."
                    : editingTask
                    ? "Save Changes"
                    : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}





