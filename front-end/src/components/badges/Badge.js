function Badge({ text }) {
    return (
    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800" >
        {text}
    </span>
    )
}

export default Badge;