import { motion } from "framer-motion"

export default function ChartCard({
    title,
    icon,
    children
}: {
    title: string,
    icon: React.ReactNode,
    children: React.ReactNode
}) {
    return (
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    {icon}
                </div>

                <h3 className="text-lg font-bold text-gray-900">
                    {title}
                </h3>
            </div>

            {children}
        </motion.div>
    );
}