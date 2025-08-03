import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        fetchTasks(session.user.id);
      }
    };
    checkSession();
  }, [router]);

  const fetchTasks = async (user_id) => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user_id)
      .order("inserted_at", { ascending: false });
    if (!error) setTasks(data);
  };

  const addTask = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
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
    const {
      data: { session },
    } = await supabase.auth.getSession();
    fetchTasks(session.user.id);
  };

  const deleteTask = async (id) => {
    await supabase.from("tasks").delete().eq("id", id);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    fetchTasks(session.user.id);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-4">Mi Checklist</h1>
      <button onClick={logout} className="text-sm text-blue-600 underline mb-4">Cerrar sesión</button>
      <div className="flex gap-2 mb-4">
        <input
          className="px-2 py-1 border rounded"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="Nueva tarea..."
        />
        <button className="bg-blue-600 text-white px-4 py-1 rounded" onClick={addTask}>
          Agregar
        </button>
      </div>
      <ul className="w-full max-w-md">
        {tasks.map((task) => (
          <li
            key={task.id}
            className={\`flex justify-between items-center p-2 border-b \${task.done ? "line-through text-gray-500" : ""}\`}
          >
            <span onClick={() => toggleTask(task.id, task.done)} className="cursor-pointer">
              {task.text}
            </span>
            <button className="text-red-500 hover:text-red-700" onClick={() => deleteTask(task.id)}>
              ✕
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}