export default function ServerError() {
    return (
        <div className="text-on-surface dark:text-on-surface-dark flex flex-col items-center justify-center h-screen bg-surface dark:bg-surface-dark">
            <h1 className="text-9xl font-bold">500</h1>
            <h2 className="text-3xl font-bold">Server Error</h2>
            <p className="text-xl">The server is currently experiencing an issue.</p>
        </div>
    )
}