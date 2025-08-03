import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Check, X, Filter } from 'lucide-react';

// Simulación de base de datos en memoria para demo
// En producción usarías Supabase
let taskId = 1;
const initialTasks = [
  { id: taskId++, text: "Ejemplo: Revisar mails", completed: false, created_at: new Date().toISOString() },
  { id: taskId++, text: "Ejemplo: Llamar a Facu", completed: true, created_at: new Date().toISOString() }
];

export default function TodoApp() {
  const [tasks, setTasks] = useState(initialTasks);
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'completed'

  // Agregar nueva tarea
  const addTask = () => {
    if (newTask.trim() === '') return;
    
    const task = {
      id: taskId++,
      text: newTask.trim(),
      completed: false,
      created_at: new Date().toISOString()
    };
    
    setTasks([task, ...tasks]);
    setNewTask('');
  };

  // Marcar como completa/incompleta
  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  // Eliminar tarea
  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  // Filtrar tareas
  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true; // 'all'
  });

  // Manejar Enter en input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📝 Mi Lista de Tareas
          </h1>
          <p className="text-gray-600">Organizá tu día, paso a paso</p>
        </div>

        {/* Input para nueva tarea */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="¿Qué tenés que hacer hoy?"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={addTask}
              disabled={!newTask.trim()}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2 font-medium"
            >
              <Plus size={20} />
              Agregar
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={18} className="text-gray-600" />
            <span className="font-medium text-gray-700">Filtrar:</span>
          </div>
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'Todas' },
              { key: 'pending', label: 'Pendientes' },
              { key: 'completed', label: 'Completas' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label} ({key === 'all' ? tasks.length : 
                         key === 'pending' ? tasks.filter(t => !t.completed).length :
                         tasks.filter(t => t.completed).length})
              </button>
            ))}
          </div>
        </div>

        {/* Lista de tareas */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {filter === 'pending' && '🎉 ¡No tenés tareas pendientes!'}
              {filter === 'completed' && '📋 No hay tareas completadas aún'}
              {filter === 'all' && '✨ Agregá tu primera tarea'}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors ${
                    task.completed ? 'opacity-75' : ''
                  }`}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      task.completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-green-400'
                    }`}
                  >
                    {task.completed && <Check size={14} />}
                  </button>

                  {/* Texto de la tarea */}
                  <div className="flex-1">
                    <p className={`${
                      task.completed 
                        ? 'line-through text-gray-500' 
                        : 'text-gray-800'
                    }`}>
                      {task.text}
                    </p>
                  </div>

                  {/* Botón eliminar */}
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-red-400 hover:text-red-600 p-1 rounded transition-colors"
                    title="Eliminar tarea"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer con stats */}
        {tasks.length > 0 && (
          <div className="mt-6 text-center text-gray-600">
            <p>
              {tasks.filter(t => t.completed).length} de {tasks.length} completadas
              {tasks.filter(t => t.completed).length === tasks.length && " 🎉"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
