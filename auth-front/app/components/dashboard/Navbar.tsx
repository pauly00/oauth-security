export default function Navbar() {
    return (
        <nav className="flex items-center justify-between px-6 py-3 border-b">
            <div className="flex items-center gap-1 text-2xl font-medium">
                <span className="text-blue-500">G</span>
                <span className="text-red-500">o</span>
                <span className="text-yellow-500">g</span>
                <span className="text-blue-500">l</span>
                <span className="text-green-500">e</span>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">고글 Cloud Console</span>
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
                    U
                </div>
            </div>
        </nav>
    )
}