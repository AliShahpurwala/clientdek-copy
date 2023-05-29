export default function NotFound() {
    return (
        <div className="text-on-surface dark:text-on-surface-dark flex flex-col items-center justify-center h-screen bg-surface dark:bg-surface-dark">
            <h1 className="text-9xl font-bold">404</h1>
            <h2 className="text-3xl font-bold">Page not found</h2>
            <p className="text-xl">The page you are looking for does not exist.</p>
        </div>
    )
}