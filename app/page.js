import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Camia</h1>
<p className="text-gray-500 mb-8">Plataforma SaaS para restaurantes</p>
        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className="bg-red-500 text-white py-3 px-6 rounded-xl font-medium hover:bg-red-600 transition"
          >
            Ingresar al panel
          </Link>
        </div>
      </div>
    </main>
  )
}