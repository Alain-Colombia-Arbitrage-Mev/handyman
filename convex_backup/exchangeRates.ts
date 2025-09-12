import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Actualizar cotizaciones de monedas
export const updateExchangeRates = mutation({
  args: {
    usdToCopRate: v.number(),
    source: v.string(), // Ejemplo: "exchangerate-api.com", "fixer.io", etc.
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Actualizar USD a COP
    await upsertExchangeRate(ctx, {
      fromCurrency: "USD",
      toCurrency: "COP",
      rate: args.usdToCopRate,
      source: args.source,
      lastUpdated: now,
      isActive: true,
    });
    
    // Actualizar COP a USD (inverso)
    await upsertExchangeRate(ctx, {
      fromCurrency: "COP",
      toCurrency: "USD",
      rate: 1 / args.usdToCopRate,
      source: args.source,
      lastUpdated: now,
      isActive: true,
    });

    return { success: true, usdToCopRate: args.usdToCopRate, updatedAt: now };
  },
});

// Función auxiliar para insertar o actualizar tasa de cambio
async function upsertExchangeRate(ctx: any, rateData: any) {
  const existing = await ctx.db
    .query("exchangeRates")
    .withIndex("by_currencies", (q) => 
      q.eq("fromCurrency", rateData.fromCurrency).eq("toCurrency", rateData.toCurrency)
    )
    .first();

  if (existing) {
    await ctx.db.patch(existing._id, rateData);
  } else {
    await ctx.db.insert("exchangeRates", rateData);
  }
}

// Obtener tasa de cambio actual
export const getCurrentExchangeRate = query({
  args: {
    fromCurrency: v.union(v.literal("USD"), v.literal("COP")),
    toCurrency: v.union(v.literal("USD"), v.literal("COP")),
  },
  handler: async (ctx, args) => {
    if (args.fromCurrency === args.toCurrency) {
      return { rate: 1, source: "same_currency", lastUpdated: Date.now() };
    }

    const exchangeRate = await ctx.db
      .query("exchangeRates")
      .withIndex("by_currencies", (q) => 
        q.eq("fromCurrency", args.fromCurrency).eq("toCurrency", args.toCurrency)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (!exchangeRate) {
      // Valor por defecto si no hay cotización (aprox USD to COP)
      const defaultRate = args.fromCurrency === "USD" ? 4000 : 0.00025;
      return { 
        rate: defaultRate, 
        source: "default", 
        lastUpdated: Date.now(),
        warning: "No current exchange rate found, using default value" 
      };
    }

    return exchangeRate;
  },
});

// Convertir montos entre USD y COP
export const convertCurrency = query({
  args: {
    amount: v.number(),
    fromCurrency: v.union(v.literal("USD"), v.literal("COP")),
    toCurrency: v.union(v.literal("USD"), v.literal("COP")),
  },
  handler: async (ctx, args) => {
    if (args.fromCurrency === args.toCurrency) {
      return { 
        originalAmount: args.amount,
        convertedAmount: args.amount,
        rate: 1,
        fromCurrency: args.fromCurrency,
        toCurrency: args.toCurrency
      };
    }

    const exchangeRate = await ctx.db
      .query("exchangeRates")
      .withIndex("by_currencies", (q) => 
        q.eq("fromCurrency", args.fromCurrency).eq("toCurrency", args.toCurrency)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    let rate = 4000; // Default USD to COP
    if (args.fromCurrency === "COP") rate = 0.00025; // Default COP to USD
    
    if (exchangeRate) {
      rate = exchangeRate.rate;
    }

    const convertedAmount = Math.round(args.amount * rate * 100) / 100; // Redondear a 2 decimales

    return {
      originalAmount: args.amount,
      convertedAmount,
      rate,
      fromCurrency: args.fromCurrency,
      toCurrency: args.toCurrency,
      lastUpdated: exchangeRate?.lastUpdated || Date.now(),
      source: exchangeRate?.source || "default"
    };
  },
});

// Obtener historial de tasas de cambio
export const getExchangeRateHistory = query({
  args: {
    fromCurrency: v.union(v.literal("USD"), v.literal("COP")),
    toCurrency: v.union(v.literal("USD"), v.literal("COP")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const history = await ctx.db
      .query("exchangeRates")
      .withIndex("by_currencies", (q) => 
        q.eq("fromCurrency", args.fromCurrency).eq("toCurrency", args.toCurrency)
      )
      .order("desc")
      .take(args.limit || 30);

    return history;
  },
});

// Actualizar automáticamente desde API externa (simulado)
export const updateFromExternalAPI = mutation({
  args: {
    apiKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // En producción, esto haría una llamada real a una API de cotizaciones
    // Por ahora simularemos con valores fluctuantes
    
    const now = Date.now();
    const baseRate = 4000; // Tasa base USD a COP
    const fluctuation = (Math.random() - 0.5) * 200; // Fluctuación de ±100 pesos
    const currentRate = Math.round((baseRate + fluctuation) * 100) / 100;
    
    // Simular llamada a API externa
    const mockAPIResponse = {
      success: true,
      rates: {
        COP: currentRate
      },
      timestamp: now,
      source: "mock-exchange-api"
    };

    if (mockAPIResponse.success) {
      await ctx.db.insert("exchangeRates", {
        fromCurrency: "USD",
        toCurrency: "COP",
        rate: currentRate,
        source: mockAPIResponse.source,
        lastUpdated: now,
        isActive: true,
      });

      await ctx.db.insert("exchangeRates", {
        fromCurrency: "COP",
        toCurrency: "USD",
        rate: 1 / currentRate,
        source: mockAPIResponse.source,
        lastUpdated: now,
        isActive: true,
      });

      return { success: true, rate: currentRate, source: mockAPIResponse.source };
    }

    throw new Error("Failed to update from external API");
  },
});

// Obtener estadísticas de fluctuación de moneda
export const getCurrencyStats = query({
  args: {
    fromCurrency: v.union(v.literal("USD"), v.literal("COP")),
    toCurrency: v.union(v.literal("USD"), v.literal("COP")),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const daysBack = args.days || 7;
    const since = Date.now() - (daysBack * 24 * 60 * 60 * 1000);

    const rates = await ctx.db
      .query("exchangeRates")
      .withIndex("by_currencies", (q) => 
        q.eq("fromCurrency", args.fromCurrency).eq("toCurrency", args.toCurrency)
      )
      .filter((q) => q.gt(q.field("lastUpdated"), since))
      .collect();

    if (rates.length === 0) {
      return {
        average: 0,
        highest: 0,
        lowest: 0,
        current: 0,
        trend: "stable",
        dataPoints: 0
      };
    }

    const rateValues = rates.map(r => r.rate);
    const average = rateValues.reduce((sum, rate) => sum + rate, 0) / rates.length;
    const highest = Math.max(...rateValues);
    const lowest = Math.min(...rateValues);
    const current = rates[rates.length - 1]?.rate || 0;

    // Calcular tendencia
    const firstHalf = rateValues.slice(0, Math.floor(rates.length / 2));
    const secondHalf = rateValues.slice(Math.floor(rates.length / 2));
    const firstAvg = firstHalf.reduce((sum, rate) => sum + rate, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, rate) => sum + rate, 0) / secondHalf.length;
    
    let trend = "stable";
    const percentChange = ((secondAvg - firstAvg) / firstAvg) * 100;
    if (percentChange > 2) trend = "rising";
    else if (percentChange < -2) trend = "falling";

    return {
      average: Math.round(average * 10000) / 10000,
      highest: Math.round(highest * 10000) / 10000,
      lowest: Math.round(lowest * 10000) / 10000,
      current: Math.round(current * 10000) / 10000,
      trend,
      percentChange: Math.round(percentChange * 100) / 100,
      dataPoints: rates.length
    };
  },
});