import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Check, LogOut, User } from 'lucide-react';

// Configuración de Supabase - REEMPLAZÁ CON TUS CREDENCIALES
const SUPABASE_URL = 'https://hlazeplscqofnbxytuzw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsYXplcGxzY3FvZm5ieHl0dXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyNDc1MjQsImV4cCI6MjA2OTgyMzUyNH0.yFotBAl27v1_Nqtbx35Q6ZxzIfpXxcI7U0xqmEZaEkM';

// Cliente de Supabase usando fetch directo
class SupabaseClient {
  constructor(url, key) {
    this.url = url;
    this.key = key;
    this.accessToken = null;
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      'apikey': this.key,
      ...options.headers
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${this.url}${endpoint}`, {
      ...options,
      headers
    });

    return response.json();
  }

  // Auth methods
  auth = {
    signInWithOAuth: async (options) => {
      // Para demo, simular login exitoso
      if (SUPABASE_URL === 'TU_SUPABASE_URL_AQUI') {
        return { error: null };
      }
      
      const redirectTo = options.options?.redirectTo || window.location.origin;
      const provider = options.provider;
      
      window.location.href = `${this.url}/auth/v1/authorize?provider=${provider}&redirect_to=${redirectTo}`;
      return { error: null };
    },

    signOut: async () => {
      if (SUPABASE_URL === 'TU_SUPABASE_URL_AQUI') {
        return { error: null };
      }

      const result = await this.request('/auth/v1/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
      
      this.accessToken = null;
      localStorage.removeItem('supabase_access_token');
      return { error: result.error || null };
    },

    getUser: async () => {
      if (SUPABASE_URL === 'TU_SUPABASE_URL_AQUI') {
        return { data: { user: null } };
      }

      if (!this.accessToken) {
        return { data: { user: null } };
      }

      const result = await this.request('/auth/v1/user', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      return { data: { user: result.error ? null : result } };
    },

    onAuthStateChange: (callback) => {
      // Para demo, simular usuario logueado
      if (SUPABASE_URL === 'TU_SUPABASE_URL_AQUI') {
        setTimeout(() => {
          callback('SIGNED_IN', {
            user: {
              id: 'demo-user-123',
              email: 'demo@example.com',
              user_metadata: { full_name: 'Usuario Demo' }
            }
          });
        }, 1000);
        return { data: { subscription: { unsubscribe: () => {} } } };
      }

      // En producción, verificar token en URL o localStorage
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get('access_token') || localStorage.getItem('supabase_access_token');
      
      if (accessToken) {
        this.accessToken = accessToken;
        localStorage.setItem('supabase_access_token', accessToken);
        
        this.getUser().then(({ data: { user } }) => {
          if (user) {
            callback('SIGNED_IN', { user });
          } else {
            callback('SIGNED_OUT', null);
          }
        });
      } else {
        callback('SIGNED_OUT', null);
      }

      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  };

  from(table) {
    return {
      select: (columns = '*') => ({
        eq: (column, value) => ({
          order: (column, options = {}) => {
            if (SUPABASE_URL === 'TU_SUPABASE_URL_AQUI') {
              // Demo mode
              return Promise.resolve({ 
                data: JSON.parse(localStorage.getItem('demo-tasks') || '[]'), 
                error: null 
              });
            }

            const ascending = options.ascending !== false;
            const endpoint = `/rest/v1/${table}?select=${columns}&${column}=eq.${value}&order=${column}.${ascending ? 'asc' : 'desc'}`;
            
            return this.request(endpoint, {
              headers: {
                'Authorization': `Bearer ${this.accessToken}`
              }
            }).then(data => ({ data, error: null }));
          }
        })
      }),

      insert: async (data) => {
        if (SUPABASE_URL === 'TU_SUPABASE_URL_AQUI') {
          // Demo mode
          const tasks = JSON.parse(localStorage.getItem('demo-tasks') || '[]');
          const newTask = { ...data[0], id: Date.now() };
          tasks.unshift(newTask);
          localStorage.setItem('demo-tasks', JSON.stringify(tasks));
          return { data: [newTask], error: null };
        }

        const result = await this.request(`/rest/v1/${table}`, {
          method: 'POST',
          body: JSON.stringify(data),
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Prefer': 'return=representation'
          }
        });

        return { data: result, error: null };
      },

      update: (updates) => ({
        eq: async (column, value) => {
          if (SUPABASE_URL === 'TU_SUPABASE_URL_AQUI') {
            // Demo mode
            const tasks = JSON.parse(localStorage.getItem('demo-tasks') || '[]');
            const updatedTasks = tasks.map(task => 
              task.id === value ? { ...task, ...updates } : task
            );
            localStorage.setItem('demo-tasks', JSON.stringify(updatedTasks));
            return { error: null };
          }

          const result = await this.request(`/rest/v1/${table}?${column}=eq.${value}`, {
            method: 'PATCH',
            body: JSON.stringify(updates),
            headers: {
              'Authorization': `Bearer ${this.accessToken}`
            }
          });

          return { error: null };
        }
      }),

      delete: () => ({
        eq: async (column, value) => {
          if (SUPABASE_URL === 'TU_SUPABASE_URL_AQUI') {
            // Demo mode
            const tasks = JSON.parse(localStorage.getItem('demo-tasks') || '[]');
            const filteredTasks = tasks.filter(task => task.id !== value);
            localStorage.setItem('demo-tasks', JSON.stringify(filteredTasks));
            return { error: null };
          }

          const result = await this.request(`/rest/v1/${table}?${column}=eq.${value}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${this.accessToken}`
            }
          });

          return { error: null };
        }
      })
    };
  }
}

const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function ChecklistApp() {
  const [tasks, setTasks] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState('active');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sesión actual
    checkUser();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          loadTasks(session.user.id);
        } else {
          setUser(null);
          setTasks([]);
        }
        setLoading(false);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      loadTasks(user.id);
    }
    setLoading(false);
  };

  const loadTasks = async (userId) => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading tasks:', error);
    } else {
      setTasks(data || []);
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    
    if (error) console.error('Error signing in:', error);
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error);
  };

  const addTask = async () => {
    if (!inputValue.trim() || !user) return;

    const newTask = {
      text: inputValue.trim(),
      completed: false,
      user_id: user.id,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert([newTask]);

    if (error) {
      console.error('Error adding task:', error);
    } else {
      setTasks([{ ...newTask, id: data[0]?.id || Date.now() }, ...tasks]);
      setInputValue('');
    }
  };

  const deleteTask = async (id) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting task:', error);
    } else {
      setTasks(tasks.filter(task => task.id !== id));
    }
  };

  const toggleTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    const { error } = await supabase
      .from('tasks')
      .update({ completed: !task.completed })
      .eq('id', id);

    if (error) {
      console.error('Error updating task:', error);
    } else {
      setTasks(tasks.map(t => 
        t.id === id ? { ...t, completed: !t.completed } : t
      ));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  const completedCount = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-6">📝</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Mi Checklist</h1>
          <p className="text-gray-600 mb-8">
            Organizá tus tareas desde cualquier dispositivo. 
            Iniciá sesión con Google para sincronizar todo.
          </p>
          
          <button
            onClick={signInWithGoogle}
            className="w-full bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar con Google
          </button>
          
          <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Demo Mode:</strong> Esta versión funciona sin Supabase usando localStorage. 
              Para conectar con Supabase real, configurá las credenciales arriba del código.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Mi Checklist</h1>
            <p className="text-sm text-gray-600">
              Hola {user.user_metadata?.full_name || user.email}
            </p>
          </div>
          <button
            onClick={signOut}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut size={20} />
          </button>
        </div>

        {/* Progress */}
        {totalTasks > 0 && (
          <div className="mb-6 p-3 bg-indigo-50 rounded-lg">
            <span className="text-indigo-700 font-medium">
              {completedCount} de {totalTasks} completadas
            </span>
            <div className="w-full bg-indigo-200 rounded-full h-2 mt-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Agregar nueva tarea..."
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            onClick={addTask}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl transition-colors duration-200 flex items-center justify-center"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-1 mb-6 p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => setFilter('active')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter === 'active'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Pendientes ({totalTasks - completedCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter === 'completed'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Completadas ({completedCount})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter === 'all'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Todas ({totalTasks})
          </button>
        </div>

        {/* Tasks List */}
        <div className="space-y-2">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">
                {filter === 'all' ? '📝' : filter === 'active' ? '⏳' : '✅'}
              </div>
              <p className="text-gray-500">
                {filter === 'all' && 'No hay tareas aún'}
                {filter === 'active' && 'No hay tareas pendientes'}
                {filter === 'completed' && 'No hay tareas completadas'}
              </p>
              <p className="text-gray-400 text-sm">
                {filter === 'all' && 'Agregá tu primera tarea arriba'}
                {filter === 'active' && '¡Buen trabajo! Todo está completado'}
                {filter === 'completed' && 'Completá algunas tareas para verlas acá'}
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 ${
                  task.completed
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                    task.completed
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-indigo-500'
                  }`}
                >
                  {task.completed && <Check size={14} />}
                </button>
                
                <span
                  className={`flex-1 transition-all duration-200 ${
                    task.completed
                      ? 'text-green-700 line-through'
                      : 'text-gray-800'
                  }`}
                >
                  {task.text}
                </span>
                
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-red-400 hover:text-red-600 p-1 transition-colors duration-200"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Quick Actions */}
        {tasks.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex gap-2 text-sm">
              <button
                onClick={async () => {
                  const completedTasks = tasks.filter(task => task.completed);
                  for (const task of completedTasks) {
                    await deleteTask(task.id);
                  }
                }}
                className="text-red-500 hover:text-red-700 transition-colors"
                disabled={completedCount === 0}
              >
                Limpiar completadas ({completedCount})
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}