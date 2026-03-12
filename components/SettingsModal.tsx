'use client'
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion";
import { Settings, X, Bell, Palette } from "lucide-react";

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

    const saveSettings = () => {
        localStorage.setItem(
            "evasoil_settings",
            JSON.stringify({
                moistureThreshold,
                tempThresholdLow,
                tempThresholdHigh,
                lightThreshold
            })
        );
        alert("✅ Settings saved!");
    }


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

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Temperature Range: {tempThresholdLow}°C - {tempThresholdHigh}°C
                                        </label>
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <input
                                                type="range"
                                                min="10"
                                                max="25"
                                                value={tempThresholdLow}
                                                onChange={(e) => setTempThresholdLow(Number(e.target.value))}
                                                className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer"
                                                />

                                                <p className="text-xs text-gray-500 mt-1">Min</p>
                                            </div>

                                            <div className="flex-1">
                                                <input
                                                type="range"
                                                min="25"
                                                max="35"
                                                value={tempThresholdHigh}
                                                onChange={(e) => setTempThresholdHigh(Number(e.target.value))}
                                                className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer"
                                                />

                                                <p className="text-xs text-gray-500 mt-1">Max</p> 
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Low Light Alert: {lightThreshold} lx
                                        </label>

                                        <input
                                        type="range"
                                        min="50"
                                        max="500"
                                        step="50"
                                        value={lightThreshold}
                                        onChange={(e) => setLightThreshold(Number(e.target.value))}
                                        className="w-full h-2 bg-yellow-200 rounded-lg appearance-none cursor-pointer" 
                                        />

                                        <p className="text-xs text-gray-500 mt-1">
                                            Alert when light drops below this level
                                        </p>
                                    </div>

                                    <button
                                    onClick={saveSettings}
                                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                                    >
                                        Save Alert Settings
                                    </button>
                                </div>
                            </section>

                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Palette size={20} className="text-indigo-600" />
                                    Device Info
                                </h3>
                                
                                <div className="bg-gray-50/80 rounded-lg p-4 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Device ID:</span>
                                        <span className="text-sm font-medium text-gray-900">{deviceId}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Status:</span>
                                        <span className="text-sm font-medium text-green-600">● Online</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )}