import { supabase } from '../lib/supabaseClient'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Login() {
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/')
      }
    }
    checkSession()
  }, [router])

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google'
    })
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Iniciar sesión</h1>
      <button onClick={handleLogin} className="bg-blue-600 text-white px-4 py-2 rounded">
        Ingresar con Google
      </button>
    </main>
  )
}