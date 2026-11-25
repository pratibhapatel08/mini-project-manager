"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { logoutUser as logoutUserThunk } from "@/redux/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { fetchProjects } from "@/redux/slices/projectSlice";
import { fetchTasks } from "@/redux/slices/taskSlice";
import Link from "next/link";
import {
  LayoutDashboard, FolderKanban, CheckSquare, Settings,
  Bell, Search, Plus, Clock, CheckCircle2, Circle,
  TrendingUp, Menu, CalendarDays, LogOut
} from "lucide-react";

export default function DashboardPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const handleLogout = async () => {
    await dispatch(logoutUserThunk());
    router.replace("/login");
  };

  const projects = useSelector((state) => state.projects.projects);
  const tasks = useSelector((state) => state.tasks.tasks);
  const projectLoading = useSelector((state) => state.projects.loading);
  const taskLoading = useSelector((state) => state.tasks.loading);

  useEffect(() => {
    dispatch(fetchProjects());
    dispatch(fetchTasks());
  }, [dispatch]);

  const completedTasks = tasks.filter((task) => task.status === "done").length;
  const todoTasks = tasks.filter((task) => task.status === "todo").length;
  const progress = tasks.length
    ? Math.round((completedTasks / tasks.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="hidden md:flex w-64 bg-[#111827] text-white flex-col fixed inset-y-0">
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
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-600 text-white">
              <LayoutDashboard size={19} /> Dashboard
            </Link>
            <Link href="/projects" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">
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
            <p className="text-xs text-slate-400 mt-2">Keep your projects organized and achieve your goals.</p>
          </div>

          <button
            onClick={handleLogout}
            className="mt-4 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition"
          >
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 min-w-0">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-5 md:px-9">
          <div className="flex items-center gap-3">
            <Menu className="md:hidden text-slate-600" />
            <div>
              <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-xs text-slate-500">Your workspace overview</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2">
              <Search size={17} className="text-slate-400" />
              <input placeholder="Search..." className="bg-transparent outline-none text-sm w-32" />
            </div>
            <button className="p-2.5 rounded-lg border border-slate-200 text-slate-600">
              <Bell size={19} />
            </button>
            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              U
            </div>
          </div>
        </header>

        <div className="p-5 md:p-9 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Welcome back!</h2>
              <p className="text-slate-500 mt-1">Here is what's happening with your projects today.</p>
            </div>
            <Link href="/projects" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold shadow-lg shadow-indigo-200 transition">
              <Plus size={19} /> New Project
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
            <StatCard title="Total Projects" value={projects.length} icon={<FolderKanban size={21}/>} color="indigo"/>
            <StatCard title="Total Tasks" value={tasks.length} icon={<CheckSquare size={21}/>} color="blue"/>
            <StatCard title="Completed Tasks" value={completedTasks} icon={<CheckCircle2 size={21}/>} color="emerald"/>
            <StatCard title="To Do Tasks" value={todoTasks} icon={<Clock size={21}/>} color="amber"/>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <section className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Recent Projects</h3>
                  <p className="text-sm text-slate-500 mt-1">Overview of your projects</p>
                </div>
                <Link href="/projects" className="text-indigo-600 text-sm font-semibold">View all</Link>
              </div>

              {projectLoading ? (
                <p className="text-slate-500 py-8 text-center">Loading projects...</p>
              ) : projects.length === 0 ? (
                <div className="text-center py-12">
                  <FolderKanban size={35} className="mx-auto text-slate-300 mb-3"/>
                  <p className="font-semibold text-slate-700">No projects yet</p>
                  <p className="text-sm text-slate-500 mt-1">Create your first project to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {projects.slice(0, 5).map((project) => (
                    <div key={project._id} className="border border-slate-100 rounded-xl p-4 hover:border-indigo-200 transition">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="font-semibold text-slate-800 truncate">{project.title || "Untitled Project"}</h4>
                          <p className="text-xs text-slate-500 mt-1">{project.description || "Project workspace"}</p>
                        </div>
                        <span className="text-xs font-medium bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full">
                          {project.status || "Active"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="font-bold text-lg text-slate-900">Task Progress</h3>
              <p className="text-sm text-slate-500 mt-1">Your overall productivity</p>

              <div className="flex justify-center py-8">
                <div className="w-40 h-40 rounded-full flex items-center justify-center"
                  style={{background: `conic-gradient(#4f46e5 ${progress}%, #e2e8f0 ${progress}% 100%)`}}>
                  <div className="w-32 h-32 rounded-full bg-white flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-slate-900">{progress}%</span>
                    <span className="text-xs text-slate-500">Done</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-600"><CheckCircle2 size={16} className="text-emerald-500"/> Completed</span>
                  <strong>{completedTasks}</strong>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-600"><Circle size={16} className="text-amber-500"/> Remaining</span>
                  <strong>{todoTasks}</strong>
                </div>
              </div>
            </section>
          </div>

          <section className="bg-white border border-slate-200 rounded-2xl p-6 mt-6">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Recent Tasks</h3>
                <p className="text-sm text-slate-500 mt-1">Your latest task activity</p>
              </div>
              <Link href="/tasks" className="text-indigo-600 text-sm font-semibold">View all</Link>
            </div>

            {taskLoading ? (
              <p className="text-center py-8 text-slate-500">Loading tasks...</p>
            ) : tasks.length === 0 ? (
              <div className="text-center py-10">
                <CalendarDays size={32} className="mx-auto text-slate-300 mb-3"/>
                <p className="text-slate-600 font-medium">No tasks available</p>
                <p className="text-sm text-slate-400 mt-1">Your tasks will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[550px]">
                  <thead>
                    <tr className="text-xs uppercase tracking-wider text-slate-400 border-b">
                      <th className="py-3 font-semibold">Task</th>
                      <th className="py-3 font-semibold">Status</th>
                      <th className="py-3 font-semibold">Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.slice(0, 5).map((task) => (
                      <tr key={task._id} className="border-b border-slate-100 last:border-0">
                        <td className="py-4 font-medium text-slate-700">{task.title || task.name || "Untitled Task"}</td>
                        <td className="py-4"><span className="text-xs px-3 py-1.5 rounded-full bg-blue-50 text-blue-700">{task.status || "To Do"}</span></td>
                        <td className="py-4"><span className="text-xs px-3 py-1.5 rounded-full bg-amber-50 text-amber-700">{task.priority || "Normal"}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  const styles = {
    indigo: "bg-indigo-50 text-indigo-600",
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500 font-medium">{title}</span>
        <div className={`p-3 rounded-xl ${styles[color]}`}>{icon}</div>
      </div>
      <p className="text-3xl font-bold text-slate-900 mt-4">{value}</p>
      <p className="text-xs text-slate-400 mt-2">Updated from your workspace</p>
    </div>
  );
}



