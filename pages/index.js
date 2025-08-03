import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [filter, setFilter] = useState("all");
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push("/login");
      else fetchTasks(session.user.id);
    };
    checkSession();
  }, [router]);

  const fetchTasks = async (userId) => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .order("inserted_at", { ascending: false });
    if (!error) setTasks(data);
  };

  const addTask = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!newTask.trim() || !session) return;
    const { data, error } = await supabase
      .from("tasks")
      .insert([{ text: newTask, user_id: session.user.id }])
      .select();
    if (!error && data) {
      setTasks([data[0], ...tasks]);
      setNewTask("");
    }
  };

  const toggleTask = async (id, done) => {
    await supabase.from("tasks").update({ done: !done }).eq("id", id);
    const { data: { session } } = await supabase.auth.getSession();
    fetchTasks(session.user.id);
  };

  const deleteTask = async (id) => {
    await supabase.from("tasks").delete().eq("id", id);
    const { data: { session } } = await supabase.auth.getSession();
    fetchTasks(session.user.id);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const filteredTasks = tasks.filter(t =>
    filter === "all" ? true :
    filter === "done" ? t.done :
    !t.done
  );

  return (
    <main className="min-h-screen flex flex-col items-center p-4 bg-[#f8faff]">
      <div className="bg-white shadow-md rounded-xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-1">Mi Checklist</h1>
        <p className="text-center text-gray-500 mb-4">Organizá tus tareas de forma simple</p>

        <div className="flex mb-4">
          <input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="Agregar nueva tarea..."
            className="flex-grow border rounded-l px-3 py-2"
          />
          <button
            onClick={addTask}
            className="bg-blue-600 text-white px-4 rounded-r"
          >
            +
          </button>
        </div>

        <div className="flex justify-around mb-4">
          {["all", "todo", "done"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === f ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              {f === "all" && `Todas (${tasks.length})`}
              {f === "todo" && `Pendientes (${tasks.filter(t => !t.done).length})`}
              {f === "done" && `Completadas (${tasks.filter(t => t.done).length})`}
            </button>
          ))}
        </div>

        {filteredTasks.length === 0 ? (
          <div className="text-center text-gray-500">
            <img src="https://cdn-icons-png.flaticon.com/512/3095/3095583.png" alt="no tareas" className="mx-auto w-16 h-16 mb-2"/>
            <p>No hay tareas aún</p>
            <p className="text-sm text-gray-400">Agregá tu primera tarea arriba</p>
          </div>
        ) : (
          <ul>
            {filteredTasks.map(task => (
              <li
                key={task.id}
                className={`flex justify-between items-center p-2 border-b ${task.done ? "line-through text-gray-500" : ""}`}
              >
                <span onClick={() => toggleTask(task.id, task.done)} className="cursor-pointer">
                  {task.text}
                </span>
                <button onClick={() => deleteTask(task.id)} className="text-red-500">✕</button>
              </li>
            ))}
          </ul>
        )}
        <button onClick={logout} className="text-sm text-blue-500 mt-4 w-full text-center underline">
          Cerrar sesión
        </button>
      </div>
    </main>
  );
}