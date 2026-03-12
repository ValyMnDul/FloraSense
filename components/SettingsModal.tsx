'use client'
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion";
import { Settings, X, Bell } from "lucide-react";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onClearHistory: () => void;
    onExportData: () => void;
    deviceId: string;
}

export default function SettingsModal({
    isOpen,
    onClose,
    onClearHistory,
    onExportData,
    deviceId
}: SettingsModalProps){

    const [showConfirm, setShowConfirm] = useState<boolean>(false);
    const [moistureThreshold, setMoistureThreshold] = useState(30);
    const [tempThresholdLow, setTempThresholdLow] = useState(15);
    const [tempThresholdHigh, setTempThresholdHigh] = useState(28);
    const [lightThreshold, setLightThreshold] = useState(100);


    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                >
                    <motion.button
                    type="button"
                    aria-label="Close settings"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-white/10 backdrop-blur-md"
                    />

                    <motion.div
                    initial={{ scale: 0.96, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.96, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 22 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white/80 backdrop-blur-xl shadow-2xl border border-white/30"
                    >
                        <div className="sticky top-0 bg-white/70 backdrop-blur-xl border-b border-gray-200 p-6 flex items-center justify-between ">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 rounded-lg">
                                    <Settings className="text-indigo-600" size={24} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Settings
                                </h2>
                            </div>
                            <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100/70 rounded-lg transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <section>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Bell size={20} className="text-indigo-600" />
                                    Alert Thresholds
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Low Moisture Alert: {moistureThreshold}%
                                        </label>
                                        
                                        <input
                                        type="range"
                                        min="10"
                                        max="50"
                                        value={moistureThreshold}
                                        onChange={(e) => setMoistureThreshold(Number(e.target.value))}
                                        className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                                        />

                                        <p className="text-xs text-gray-500 mt-1">
                                            Alert when moisture drops below this level
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}