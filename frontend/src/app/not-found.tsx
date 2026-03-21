import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-950">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-2 text-7xl font-extrabold text-indigo-600 dark:text-indigo-400">
          404
        </h1>
        <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Página no encontrada
        </h2>
        <p className="mb-8 text-sm text-gray-500 dark:text-gray-400">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
