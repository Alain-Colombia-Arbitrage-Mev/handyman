import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import Pik01031 from '../imports/Pik01031';
import { ParkiingLogo } from './ParkiingLogo';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Mostrar contenido después de un pequeño delay
    const showTimer = setTimeout(() => {
      setShowContent(true);
    }, 200);

    // Auto completar después de 3 segundos
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3500);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-[#e9e9e9] flex items-center justify-center overflow-hidden">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: showContent ? 1 : 0.8, opacity: showContent ? 1 : 0 }}
        transition={{ 
          duration: 0.8, 
          ease: [0.25, 0.46, 0.45, 0.94],
          delay: 0.2 
        }}
        className="flex flex-col items-center justify-center"
      >
        {/* Logo mejorado con animación */}
        <motion.div
          initial={{ scale: 0.5, rotate: -180, opacity: 0 }}
          animate={{ 
            scale: showContent ? 1 : 0.5, 
            rotate: showContent ? 0 : -180,
            opacity: showContent ? 1 : 0
          }}
          transition={{ 
            duration: 1.2, 
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 0.3
          }}
          className="mb-8 drop-shadow-2xl"
        >
          <ParkiingLogo size="xl" showText={false} variant="figma" animated={true} />
        </motion.div>

        {/* Texto Parkiing */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: showContent ? 0 : 30, opacity: showContent ? 1 : 0 }}
          transition={{ 
            duration: 0.8, 
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 0.6 
          }}
          className="text-center mb-6"
        >
          <h1 className="font-['Poppins',_sans-serif] font-semibold text-[#090909] leading-[1.35] mb-0">
            <span className="text-[48px]">Parki</span>
            <span className="text-[52px]">i</span>
            <span className="text-[48px]">ng</span>
          </h1>
        </motion.div>

        {/* Subtítulo */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: showContent ? 0 : 20, opacity: showContent ? 1 : 0 }}
          transition={{ 
            duration: 0.8, 
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 0.8 
          }}
          className="text-center max-w-[280px]"
        >
          <p className="font-['Poppins',_sans-serif] font-extralight text-[#000000] text-[22px] leading-[1.35] text-center">
            El mapa vivo más grande del mundo
          </p>
        </motion.div>

        {/* Indicador de carga animado */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showContent ? 1 : 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="mt-12"
        >
          <div className="flex space-x-2">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="w-2 h-2 bg-[#21ABF6] rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: index * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Tap to continue hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showContent ? 1 : 0 }}
          transition={{ delay: 2, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          onClick={onComplete}
        >
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-[#666666] text-sm font-['Poppins',_sans-serif] cursor-pointer text-center"
          >
            Toca para continuar
          </motion.p>
        </motion.div>
      </motion.div>

      {/* Background pattern opcional */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 border border-gray-400 rounded-full" />
        <div className="absolute top-1/4 right-16 w-12 h-12 border border-gray-400 rounded-full" />
        <div className="absolute bottom-1/4 left-1/4 w-16 h-16 border border-gray-400 rounded-full" />
        <div className="absolute bottom-16 right-20 w-8 h-8 border border-gray-400 rounded-full" />
      </div>
    </div>
  );
}