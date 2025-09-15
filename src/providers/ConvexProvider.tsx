import React, { ReactNode, useEffect } from 'react';
import { ConvexProvider as BaseConvexProvider } from 'convex/react';
import { ConvexReactClient } from 'convex/react';
import { setConvexClient } from '../store/integrations/convexIntegration';

// Configurar cliente de Convex
const convex = new ConvexReactClient(process.env.CONVEX_URL || "https://terrific-starling-996.convex.cloud");

interface ConvexProviderProps {
  children: ReactNode;
}

export function ConvexProvider({ children }: ConvexProviderProps) {
  useEffect(() => {
    // Set the Convex client for store integration
    setConvexClient(convex);
    console.log('🔄 Convex client set for store integration');
  }, []);

  return (
    <BaseConvexProvider client={convex}>
      {children}
    </BaseConvexProvider>
  );
}