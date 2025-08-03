import { supabase } from '../lib/supabaseClient'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Login() {
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) router.push('/')
    }
    checkSession()
  }, [router])

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' })
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#f0f4ff]">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Iniciá sesión</h1>
      <button
        onClick={handleLogin}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow"
      >
        Ingresar con Google
      </button>
    </main>
  )
}