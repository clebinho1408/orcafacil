
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedBudget } from "../types";

export const extractBudgetData = async (text: string): Promise<ExtractedBudget | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analise o seguinte áudio transcrito: "${text}".
      
      REGRAS DE FORMATAÇÃO CRÍTICAS:
      1. NOME DO CLIENTE: Deve ser retornado SEMPRE EM LETRAS MAIÚSCULAS.
      2. MEDIDAS: Se houver um número seguido de "m", "metros", "mt" ou "metro", converta SEMPRE para "M²" (MAIÚSCULO). Exemplo: "20m" vira "20M²", "15 metros" vira "15M²".
      3. DESCRIÇÃO DE SERVIÇO: Curta e SEMPRE EM MAIÚSCULAS.
      4. VALORES: Formato padrão "R$ X.XXX,XX".
      5. Se o áudio for apenas um nome, identifique como nome_cliente.
      6. Se o áudio for serviço e valor, extraia descricao_servico e valor_total.
      
      Retorne apenas o JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nome_cliente: { type: Type.STRING },
            descricao_servico: { type: Type.STRING },
            valor_total: { type: Type.STRING },
            observacoes_servico: { type: Type.STRING },
            forma_pagamento: { type: Type.STRING },
          },
          required: ["nome_cliente", "descricao_servico", "valor_total"]
        },
      },
    });

    const jsonStr = response.text?.trim() || "{}";
    const data = JSON.parse(jsonStr) as ExtractedBudget;
    
    // Tratamento adicional para garantir conformidade
    if (data.descricao_servico) {
      data.descricao_servico = data.descricao_servico
        .toUpperCase()
        // Substitui M, MT, METROS, METRO (precedidos por números) por M²
        .replace(/(\d+)\s*(M|MT|METROS|METRO)(?![²2])/g, '$1M²')
        .replace(/(\d+)\s*(M|MT|METROS|METRO)2/g, '$1M²');
    }
    
    if (data.nome_cliente) {
      data.nome_cliente = data.nome_cliente.toUpperCase();
    }
    
    return data;
  } catch (error) {
    console.error("Error extracting data with Gemini:", error);
    return null;
  }
};
