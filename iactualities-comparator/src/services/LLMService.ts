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
        question: prompt
      }, {
        timeout: 120000,
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
          const funnyServerErrors = [
            `🤖 ${model} fait une petite crise existentielle ! Laisse-lui 2 minutes pour méditer... 🧘‍♂️`,
            `🔧 ${model} est en train de se faire un petit lifting ! Reviens le voir quand il sera plus beau ! ✨`,
            `🎭 ${model} joue les divas aujourd'hui ! Il refuse de sortir de sa loge... 🎪`,
            `🚑 ${model} a attrapé un petit rhume numérique ! Il se soigne aux vitamines C++ ! 💊`
          ];
          throw new Error(funnyServerErrors[Math.floor(Math.random() * funnyServerErrors.length)]);
        } else if (error.response.status === 429) {
          const funnyRateLimitErrors = [
            `🏃‍♂️ Eh ho ! ${model} n'est pas Flash ! Tu vas trop vite pour lui ! Ralentis un peu ! ⚡`,
            `🚦 ${model} te dit : "Rouge ! Stop !" Il a besoin d'une pause syndicale ! 🛑`,
            `⏰ ${model} fait grève du zèle ! Il demande une pause déjeuner... 🥪`,
            `🔥 Tu fais chauffer ${model} comme un barbecue ! Laisse-le refroidir ! 🧊`
          ];
          throw new Error(funnyRateLimitErrors[Math.floor(Math.random() * funnyRateLimitErrors.length)]);
        } else {
          throw new Error(`🤷‍♂️ ${model} me fait un code mystère ${error.response.status}... Même Google ne sait pas ce que ça veut dire ! 🕵️‍♂️`);
        }
      } else if (error.request) {
        // Erreur de connexion
        const funnyConnectionErrors = [
          `📡 Houston ! J'ai perdu le contact avec la base ! Le serveur joue à cache-cache ! 🛰️`,
          `🌊 Internet fait des vagues aujourd'hui ! Le serveur surfe sur une autre planète ! 🏄‍♂️`,
          `📞 Allo ? Allo ? Le serveur ne répond pas ! Il doit être aux toilettes... 🚽`,
          `🕳️ Le serveur est tombé dans un trou noir ! Même Einstein ne pourrait pas l'aider ! 🌌`
        ];
        throw new Error(funnyConnectionErrors[Math.floor(Math.random() * funnyConnectionErrors.length)]);
      } else if (error.code === 'ECONNABORTED') {
        // Timeout
        const funnyTimeoutErrors = [
          `⏰ ${model} prend son temps comme un escargot zen ! Il médite sur ta question... 🐌`,
          `⌛ ${model} est parti chercher du café ! Il revient dans 5 minutes ! ☕`,
          `🐢 ${model} mode tortue activé ! Il réfléchit à la vitesse de la sagesse... 🧠`,
          `💤 ${model} s'est endormi sur ta question ! Elle était trop relaxante ! 😴`
        ];
        throw new Error(funnyTimeoutErrors[Math.floor(Math.random() * funnyTimeoutErrors.length)]);
      } else {
        const funnyGenericErrors = [
          `🎪 ${model} fait du cirque ! Quelque chose d'imprévu s'est produit sous le chapiteau ! 🎭`,
          `🔮 Ma boule de cristal est embuée ! Je ne vois pas ce qui se passe avec ${model} ! ✨`,
          `🎲 Les dés du destin ont mal roulé pour ${model} ! Relance la partie ! 🎯`,
          `🌪️ ${model} est pris dans un tourbillon de confusion ! Il va s'en sortir ! 💫`
        ];
        throw new Error(`${funnyGenericErrors[Math.floor(Math.random() * funnyGenericErrors.length)]} (${error.message})`);
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
