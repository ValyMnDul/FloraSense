import { TrendingUp, TrendingDown } from "lucide-react"

export default function StartCard({
    icon,
    title,
    value,
    trend,
    average,
    min, 
    max,
    status,
    subtitle
}: {
    icon: React.ReactNode,
    title: string,
    value: string,
    color: "blue" | "red" | "purple" | "green" | "yellow",
    trend?: number,
    average?: number,
    min?: number,
    max?: number,
    status?: string,
    subtitle?: string 
}) {
    return(
        <div
        className="bg-white rounded-none border-2 border-stone-200 p-5"
        >
            <div className="flex item-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-linear-to-br bg-blue-100 text-blue-800`}>
                    {icon}
                </div>

                {trend !== undefined && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${
                        trend > 0 ? "text-green-600" : "text-red-600"
                    }`}>
                        {trend > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}

                        <span>{Math.abs(trend).toFixed(1)}</span>
                    </div>
                )}
            </div>

            <h3 className="text-gray-600 text-sm font-medium mb-2">{title}</h3>

            <div className="flex items-end justify-between">
                <p className="text-3xl sm:text-4xl font-bold text-gray-900">{value}</p>
                {status && <span className={`text-sm font-medium ${status}`}>●</span>}
            </div>

            {average !== undefined && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>
                            Avg: <strong>{average.toFixed(1)}</strong>
                        </span>
                        {min !== undefined && max !== undefined && (
                            <span>
                                {min.toFixed(1)} - {max.toFixed(1)}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
        </div>
    )
}