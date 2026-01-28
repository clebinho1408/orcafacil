
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedBudget } from "../types";

export const extractBudgetData = async (text: string): Promise<ExtractedBudget | null> => {
  // O usuário cadastrou como API_CHAVE no painel da Vercel
  const apiKey = typeof process !== 'undefined' ? (process.env.API_CHAVE || process.env.API_KEY) : undefined;
  
  if (!apiKey) {
    console.error("Gemini API Key não encontrada. Certifique-se de que API_CHAVE está configurada na Vercel.");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analise a seguinte transcrição de áudio para um orçamento profissional: "${text}".
      
      INSTRUÇÕES DE EXTRAÇÃO:
      1. Tente identificar o NOME DO CLIENTE, TELEFONE e ENDEREÇO se mencionados.
      2. Se o áudio descrever um serviço e valor, extraia para 'descricao_servico' e 'valor_total'.
      3. Se mencionar valores separados de MÃO DE OBRA e MATERIAL, extraia-os.
      4. REGRAS DE FORMATAÇÃO:
         - NOMES e SERVIÇOS: Sempre em LETRAS MAIÚSCULAS.
         - MEDIDAS: Converta qualquer menção a metros (m, mt, metro) para "M²" (ex: "20 metros" vira "20M²").
         - VALORES: Formate como "R$ X.XXX,XX".
      
      Retorne estritamente um JSON.`,
      config: {
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

    const jsonStr = response.text?.trim() || "{}";
    const data = JSON.parse(jsonStr) as ExtractedBudget;
    
    if (data.descricao_servico) {
      data.descricao_servico = data.descricao_servico
        .toUpperCase()
        .replace(/(\d+)\s*(M|MT|METROS|METRO)(?![²2])/g, '$1M²')
        .replace(/(\d+)\s*(M|MT|METROS|METRO)2/g, '$1M²');
    }
    
    if (data.nome_cliente) {
      data.nome_cliente = data.nome_cliente.toUpperCase();
    }

    if (data.endereco_cliente) {
      data.endereco_cliente = data.endereco_cliente.toUpperCase();
    }
    
    return data;
  } catch (error) {
    console.error("Error extracting data with Gemini:", error);
    return null;
  }
};
