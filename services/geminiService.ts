
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedBudget } from "../types";

// Função robusta para capturar a chave de API em diferentes ambientes (Vercel, Vite, etc)
const getApiKey = (): string | undefined => {
  try {
    // Tenta process.env (Vercel/Node)
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
    // Tenta import.meta.env (Vite)
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
      // @ts-ignore
      return import.meta.env.VITE_API_KEY;
    }
    // Fallback para window (alguns ambientes injetam aqui)
    // @ts-ignore
    if (typeof window !== 'undefined' && window.API_KEY) {
      // @ts-ignore
      return window.API_KEY;
    }
  } catch (e) {
    console.warn("Erro ao tentar acessar API_KEY:", e);
  }
  return undefined;
};

export const extractBudgetData = async (text: string): Promise<ExtractedBudget | null> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    console.error("ERRO: Gemini API Key não encontrada. Certifique-se de configurar a variável de ambiente API_KEY no Vercel.");
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

    if (!response.text) {
      console.warn("Gemini retornou uma resposta vazia.");
      return null;
    }

    const jsonStr = response.text.trim();
    const data = JSON.parse(jsonStr) as ExtractedBudget;
    
    // Pós-processamento para garantir maiúsculas e formatação de m2
    if (data.descricao_servico) {
      data.descricao_servico = data.descricao_servico
        .toUpperCase()
        .replace(/(\d+)\s*(M|MT|METROS|METRO)(?![²2])/g, '$1M²')
        .replace(/(\d+)\s*(M|MT|METROS|METRO)2/g, '$1M²');
    }
    
    if (data.nome_cliente) {
      data.nome_cliente = data.nome_cliente.toUpperCase();
    }
    
    return data;
  } catch (error: any) {
    console.error("Erro detalhado no Gemini:", error);
    // Log para ajudar o usuário a diagnosticar no console do navegador
    if (error.message?.includes("API_KEY_INVALID")) {
      console.error("A chave de API fornecida é inválida.");
    }
    return null;
  }
};
