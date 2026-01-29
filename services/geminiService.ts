
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedBudget } from "../types";

// Always use process.env.API_KEY directly as per the coding guidelines.
export const extractBudgetData = async (text: string): Promise<ExtractedBudget | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extraia dados deste orçamento a partir da transcrição de voz: "${text}". 
      REGRAS CRÍTICAS DE FORMATAÇÃO: 
      1. Nomes de clientes e descrições de serviços devem estar sempre em MAIÚSCULAS.
      2. METRAGEM: Se o usuário mencionar uma medida (ex: "12 metros", "10 metros quadrados", "5 metro"), você DEVE formatar como "XXM²" no início da descrição do serviço. Exemplo: "12 METROS DE INSTALAÇÃO DE CALHAS" vira "12M² INSTALAÇÃO DE CALHAS".
      3. Remova preposições desnecessárias como "DE" logo após a metragem (ex: "10M² DE PINTURA" vira "10M² PINTURA").
      4. VALORES: Formate sempre como "R$ X.XXX,XX".`,
      config: {
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nome_cliente: { type: Type.STRING },
            telefone_cliente: { type: Type.STRING },
            endereco_cliente: { type: Type.STRING },
            descricao_servico: { type: Type.STRING, description: "Descrição do serviço iniciando com a metragem formatada XXM² se houver." },
            valor_total: { type: Type.STRING },
            observacoes_servico: { type: Type.STRING },
            forma_pagamento: { type: Type.STRING },
          }
        },
      },
    });

    // Directly access the .text property (not a method) as per the guidelines.
    const data = JSON.parse(response.text || '{}') as ExtractedBudget;
    
    if (data.descricao_servico) {
      // Pós-processamento robusto para garantir a formatação XXM²
      let desc = data.descricao_servico.toUpperCase();
      
      // Substitui variações de metro/metros/quadrados por M²
      desc = desc.replace(/(\d+)\s*(METROS\s*QUADRADOS|METRO\s*QUADRADO|METROS|METRO|MT|M)(?![²2])/gi, '$1M²');
      
      // Remove o "DE" ou "DE " que costuma vir após a metragem
      desc = desc.replace(/(\d+M²)\s+DE\s+/gi, '$1 ');
      
      data.descricao_servico = desc.trim();
    }
    
    if (data.nome_cliente) data.nome_cliente = data.nome_cliente.toUpperCase();
    
    return data;
  } catch (error) {
    console.error("Erro na extração rápida:", error);
    return null;
  }
};
