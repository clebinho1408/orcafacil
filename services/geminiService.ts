
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedBudget } from "../types";

const getApiKey = (): string | undefined => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
      // @ts-ignore
      return import.meta.env.VITE_API_KEY;
    }
  } catch (e) {}
  return undefined;
};

export const extractBudgetData = async (text: string): Promise<ExtractedBudget | null> => {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extraia dados deste orçamento: "${text}". 
      REGRAS: 
      1. Nomes/Serviços em MAIÚSCULAS. 
      2. Converta metros para "M²". 
      3. Valores como "R$ X.XXX,XX".`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }, // Prioridade total em velocidade
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nome_cliente: { type: Type.STRING },
            telefone_cliente: { type: Type.STRING },
            endereco_cliente: { type: Type.STRING },
            descricao_servico: { type: Type.STRING },
            valor_total: { type: Type.STRING },
            valor_mao_de_obra: { type: Type.STRING },
            valor_material: { type: Type.STRING },
            observacoes_servico: { type: Type.STRING },
            forma_pagamento: { type: Type.STRING },
          }
        },
      },
    });

    const data = JSON.parse(response.text || '{}') as ExtractedBudget;
    
    // Pós-processamento ultra rápido
    if (data.descricao_servico) {
      data.descricao_servico = data.descricao_servico.toUpperCase().replace(/(\d+)\s*(M|MT|METROS|METRO)(?![²2])/gi, '$1M²');
    }
    if (data.nome_cliente) data.nome_cliente = data.nome_cliente.toUpperCase();
    
    return data;
  } catch (error) {
    console.error("Erro na extração rápida:", error);
    return null;
  }
};
