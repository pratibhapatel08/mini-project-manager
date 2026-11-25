"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
  clearProjectError,
} from "@/redux/slices/projectSlice";
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
  FolderOpen,
  SlidersHorizontal,
  Loader2,
  AlertCircle,
} from "lucide-react";

const initialForm = {
  title: "",
  description: "",
  status: "active",
};

const statusStyles = {
  active: "bg-indigo-50 text-indigo-700",
  completed: "bg-emerald-50 text-emerald-700",
  "on-hold": "bg-amber-50 text-amber-700",
};

export default function ProjectsPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { projects, loading, error } = useSelector(
    (state) => state.projects
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        (project.title || "").toLowerCase().includes(search.toLowerCase()) ||
        (project.description || "").toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || project.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  const openCreateModal = () => {
    setEditingProject(null);
    setForm(initialForm);
    setFormError("");
    dispatch(clearProjectError());
    setIsModalOpen(true);
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setForm({
      title: project.title || "",
      description: project.description || "",
      status: project.status || "active",
    });
    setFormError("");
    dispatch(clearProjectError());
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;
    setIsModalOpen(false);
    setEditingProject(null);
    setForm(initialForm);
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.title.trim()) {
      setFormError("Project name is required.");
      return;
    }

    setSubmitting(true);

    try {
      if (editingProject) {
        await dispatch(
          updateProject({
            id: editingProject._id,
            data: form,
          })
        ).unwrap();
      } else {
        await dispatch(createProject(form)).unwrap();
      }

      closeModal();
    } catch (err) {
      setFormError(err || "Unable to save project.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) return;

    setDeletingId(id);

    try {
      await dispatch(deleteProject(id)).unwrap();
    } catch (err) {
      window.alert(err || "Unable to delete project.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = async () => {
    await dispatch(logoutUserThunk());
    router.replace("/login");
  };

  const counts = {
    all: projects.length,
    active: projects.filter((p) => p.status === "active").length,
    completed: projects.filter((p) => p.status === "completed").length,
    "on-hold": projects.filter((p) => p.status === "on-hold").length,
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="hidden md:flex w-64 bg-[#111827] text-white flex-col fixed inset-y-0 z-20">
        <div className="h-20 flex items-center gap-3 px-7 border-b border-slate-700">
          <div className="bg-indigo-600 p-2 rounded-xl">
            <FolderKanban size={23} />
          </div>
          <span className="text-xl font-bold">ProjectFlow</span>
        </div>

        <div className="px-5 py-7">
          <p className="text-xs uppercase tracking-widest text-slate-500 mb-4 px-3">
            Workspace
          </p>

          <nav className="space-y-2">
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">
              <LayoutDashboard size={19} /> Dashboard
            </Link>

            <Link href="/projects" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-600 text-white">
              <FolderKanban size={19} /> Projects
            </Link>

            <Link href="/tasks" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">
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
              Keep your projects organized and achieve your goals.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="mt-4 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition"
          >
            <LogOut size={19} /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 min-w-0">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-5 md:px-9">
          <div className="flex items-center gap-3">
            <Menu className="md:hidden text-slate-600" />
            <div>
              <h1 className="text-xl font-bold text-slate-900">Projects</h1>
              <p className="text-xs text-slate-500">
                Manage and organize your projects
              </p>
            </div>
          </div>

          <button
            onClick={openCreateModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold transition"
          >
            <Plus size={18} /> <span className="hidden sm:inline">New Project</span>
            <span className="sm:hidden">New</span>
          </button>
        </header>

        <div className="p-5 md:p-9 max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">
              Project Overview
            </h2>
            <p className="text-slate-500 mt-1">
              Track your work and keep everything organized.
            </p>
          </div>

          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Projects", value: counts.all, color: "text-indigo-600" },
              { label: "Active", value: counts.active, color: "text-blue-600" },
              { label: "Completed", value: counts.completed, color: "text-emerald-600" },
              { label: "On Hold", value: counts["on-hold"], color: "text-amber-600" },
            ].map((item) => (
              <div key={item.label} className="bg-white border border-slate-200 rounded-2xl p-5">
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className={`text-3xl font-bold mt-3 ${item.color}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <section className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  All Projects
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {filteredProjects.length} projects found
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                  <Search size={17} className="text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search projects..."
                    className="bg-transparent outline-none text-sm w-full sm:w-48 text-slate-700"
                  />
                </div>

                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                  <SlidersHorizontal size={17} className="text-slate-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-transparent outline-none text-sm text-slate-700"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                  </select>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-5 flex items-center gap-2 rounded-xl bg-red-50 text-red-700 p-4 text-sm">
                <AlertCircle size={18} /> {error}
              </div>
            )}

            {loading ? (
              <div className="py-16 text-center text-slate-500">
                <Loader2 size={28} className="animate-spin mx-auto mb-3" />
                Loading projects...
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="py-16 text-center">
                <FolderOpen size={42} className="mx-auto text-slate-300 mb-4" />
                <h3 className="font-semibold text-slate-800">
                  {search || statusFilter !== "all"
                    ? "No matching projects"
                    : "No projects yet"}
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  {search || statusFilter !== "all"
                    ? "Try changing your search or filter."
                    : "Create your first project to get started."}
                </p>
                {!search && statusFilter === "all" && (
                  <button
                    onClick={openCreateModal}
                    className="mt-5 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700"
                  >
                    Create Project
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5">
                {filteredProjects.map((project) => (
                  <article
                    key={project._id}
                    className="border border-slate-200 rounded-2xl p-5 hover:border-indigo-200 hover:shadow-md transition bg-white"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl">
                        <FolderKanban size={22} />
                      </div>

                      <span className={`text-xs font-semibold px-3 py-1.5 rounded-full capitalize ${statusStyles[project.status] || "bg-slate-100 text-slate-600"}`}>
                        {(project.status || "active").replace("-", " ")}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mt-5 break-words">
                      {project.title}
                    </h3>

                    <p className="text-sm text-slate-500 mt-2 min-h-10 break-words">
                      {project.description || "No description added."}
                    </p>

                    <div className="border-t border-slate-100 mt-5 pt-4 flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-400">
                        {project.createdAt
                          ? new Date(project.createdAt).toLocaleDateString()
                          : "Recently created"}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(project)}
                          title="Edit project"
                          className="p-2 rounded-lg text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          onClick={() => handleDelete(project._id)}
                          disabled={deletingId === project._id}
                          title="Delete project"
                          className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-50"
                        >
                          {deletingId === project._id ? (
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
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingProject ? "Edit Project" : "Create Project"}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {editingProject
                    ? "Update your project details."
                    : "Add a new project to your workspace."}
                </p>
              </div>

              <button
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                disabled={submitting}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {formError && (
                <div className="bg-red-50 text-red-700 rounded-xl p-3 text-sm">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Project Title *
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Enter project title"
                  maxLength={100}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe your project..."
                  rows={4}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-sm bg-white"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
                </select>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 size={17} className="animate-spin" />}
                  {submitting
                    ? "Saving..."
                    : editingProject
                    ? "Save Changes"
                    : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

