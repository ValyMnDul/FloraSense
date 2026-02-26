import { motion } from "framer-motion"

export default function StartCard({
    icon,
    title,
    value,
    color,
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
    const colorClasses = {
        blue: "from-blue-500 to-cyan-500",
        red: "from-red-500 to-orange-500",
        purple: "from-purple-500 to-pink-500",
        green: "from-green-500 to-emerald-500",
        yellow: "from-yellow-500 to-orange-500"
    }

    return(
        <motion.div>

        </motion.div>
    )
}