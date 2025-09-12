import React, { ReactNode } from 'react';
import { ConvexProvider as BaseConvexProvider } from 'convex/react';
import { ConvexReactClient } from 'convex/react';

// Configurar cliente de Convex
const convex = new ConvexReactClient(process.env.CONVEX_URL || "https://terrific-starling-996.convex.cloud");

interface ConvexProviderProps {
  children: ReactNode;
}

export function ConvexProvider({ children }: ConvexProviderProps) {
  return (
    <BaseConvexProvider client={convex}>
      {children}
    </BaseConvexProvider>
  );
}