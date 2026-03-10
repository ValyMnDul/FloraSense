'use client'
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion";

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
    return (
        <AnimatePresence>
            
        </AnimatePresence>
    )
}