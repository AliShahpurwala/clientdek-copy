export default function Unauthorized() {
    return (
        <div className="text-on-surface dark:text-on-surface-dark flex flex-col items-center justify-center h-screen bg-surface dark:bg-surface-dark">
            <h1 className="text-9xl font-bold">403</h1>
            <h2 className="text-3xl font-bold">Forbidden</h2>
            <p className="text-xl">You are not authorized to view this resource.</p>
        </div>
    )
}