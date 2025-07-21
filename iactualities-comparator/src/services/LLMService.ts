import axios from 'axios';

export interface QueryResponse {
  response: string;
  cost?: number;
  tokens?: number;
  hasInternet?: boolean;
}

export class LLMService {
  private baseURL: string;

  constructor() {
    // URL de l'API AWS Amplify
    this.baseURL = process.env.REACT_APP_API_URL || 'https://pzvxjuhgaj.execute-api.eu-west-3.amazonaws.com/prod';
  }

  async queryModel(model: string, prompt: string): Promise<QueryResponse> {
    try {
      // Vérifier d'abord la santé du serveur
      const isHealthy = await this.checkHealth();
      if (!isHealthy) {
        throw new Error('Serveur backend indisponible. Vérifiez que le service est démarré.');
      }

      const response = await axios.post(`${this.baseURL}/query`, {
        model,
        question: prompt  // ✅ CORRECTION ICI : question au lieu de prompt
      }, {
        timeout: 120000, // 45 seconds timeout (réduit pour éviter les blocages)
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return {
        response: response.data.response || 'Réponse vide',
        cost: this.estimateCost(model, prompt, response.data.response),
        tokens: this.estimateTokens(prompt) + this.estimateTokens(response.data.response || ''),
        hasInternet: response.data.has_internet || false
      };
    } catch (error: any) {
      if (error.response) {
        // Erreur HTTP spécifique
        if (error.response.status === 500) {
          throw new Error(`Erreur serveur pour ${model}. Le modèle peut être temporairement indisponible.`);
        } else if (error.response.status === 429) {
          throw new Error(`Trop de requêtes pour ${model}. Veuillez attendre quelques instants.`);
        } else {
          throw new Error(`Erreur API (${error.response.status}): ${error.response.data.detail || error.response.statusText}`);
        }
      } else if (error.request) {
        // Erreur de connexion
        throw new Error(`Connexion impossible au serveur backend. Vérifiez que le service est démarré sur ${this.baseURL}`);
      } else if (error.code === 'ECONNABORTED') {
        // Timeout
        throw new Error(`Délai d'attente dépassé pour ${model}. Le serveur peut être surchargé.`);
      } else {
        throw new Error(`Erreur inattendue pour ${model}: ${error.message}`);
      }
    }
  }

  private estimateCost(model: string, prompt: string, response: string): number {
    // Estimation basée sur les tokens (approximation)
    const inputTokens = this.estimateTokens(prompt);
    const outputTokens = this.estimateTokens(response || '');
    
    const pricing: { [key: string]: { input: number; output: number } } = {
      'Mixtral 8x7B Instruct': { input: 0.0007, output: 0.0007 },
      'Claude 3 Sonnet': { input: 0.003, output: 0.015 },
      'Claude 3 Haiku': { input: 0.00025, output: 0.00125 },
      'Claude 3.7 Sonnet': { input: 0.003, output: 0.015 },
      'Pixtral Large': { input: 0.002, output: 0.006 },
      'GPT-4o (Azure)': { input: 0.005, output: 0.015 },
      'GPT-4o Mini (Azure)': { input: 0.00015, output: 0.0006 },
    };

    const modelPricing = pricing[model] || { input: 0.001, output: 0.002 };
    
    return (inputTokens * modelPricing.input / 1000) + (outputTokens * modelPricing.output / 1000);
  }

  private estimateTokens(text: string = ''): number {
    // Estimation approximative : 1 token ≈ 4 caractères pour le français
    return Math.ceil(text.length / 4);
  }

  async improvePrompt(prompt: string): Promise<string> {
    try {
      const response = await axios.post(`${this.baseURL}/improve-prompt`, {
        prompt
      }, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.data.improved_prompt || prompt;
    } catch (error) {
      console.error('Erreur lors de l\'amélioration du prompt:', error);
      return prompt;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseURL}/health`, {
        timeout: 5000,
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}
