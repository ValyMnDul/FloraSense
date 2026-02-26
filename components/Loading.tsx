import { Activity } from "lucide-react"

export default function Loading(){
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-16 h-16 text-indigo-600 animate-pulse mx-auto mb-4" ></Activity>
          <p className="text-xl text-gray-700 font-medium">Loading FloraSense</p>
        </div>
      </div>
    )
}