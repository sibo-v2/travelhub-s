const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface SuggestionRequest {
  context: string;
  userQuery?: string;
  maxSuggestions?: number;
}

class OpenAIService {
  private async makeRequest(messages: ChatMessage[]): Promise<string> {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured. Please add VITE_OPENAI_API_KEY to your .env file.');
    }

    try {
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  async generateTravelSuggestions(request: SuggestionRequest): Promise<string[]> {
    const systemPrompt = `You are a helpful travel assistant. Provide concise, practical travel suggestions.
    Return exactly ${request.maxSuggestions || 3} suggestions as a numbered list.
    Each suggestion should be one sentence, actionable, and relevant to the context provided.`;

    const userPrompt = request.userQuery
      ? `Context: ${request.context}\n\nUser question: ${request.userQuery}\n\nProvide ${request.maxSuggestions || 3} helpful suggestions.`
      : `Context: ${request.context}\n\nProvide ${request.maxSuggestions || 3} helpful travel tips or suggestions.`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const response = await this.makeRequest(messages);

    const suggestions = response
      .split('\n')
      .filter(line => line.trim().match(/^\d+\./))
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(s => s.length > 0);

    return suggestions;
  }

  async generateDestinationSuggestions(destination: string, interests?: string[]): Promise<string[]> {
    const interestsText = interests && interests.length > 0
      ? ` The traveler is interested in: ${interests.join(', ')}.`
      : '';

    const context = `Planning a trip to ${destination}.${interestsText}`;

    return this.generateTravelSuggestions({
      context,
      maxSuggestions: 5,
    });
  }

  async generateFlightSuggestions(origin: string, destination: string, dates?: { departure: string; return?: string }): Promise<string[]> {
    const dateContext = dates
      ? ` Departure: ${dates.departure}${dates.return ? `, Return: ${dates.return}` : ''}.`
      : '';

    const context = `Flight search from ${origin} to ${destination}.${dateContext}`;

    return this.generateTravelSuggestions({
      context,
      maxSuggestions: 4,
    });
  }

  async generateHotelSuggestions(destination: string, budget?: string, preferences?: string[]): Promise<string[]> {
    const budgetText = budget ? ` Budget: ${budget}.` : '';
    const prefsText = preferences && preferences.length > 0
      ? ` Preferences: ${preferences.join(', ')}.`
      : '';

    const context = `Looking for hotels in ${destination}.${budgetText}${prefsText}`;

    return this.generateTravelSuggestions({
      context,
      maxSuggestions: 4,
    });
  }

  async generateItinerarySuggestions(destination: string, duration: number, travelerType: string): Promise<string[]> {
    const context = `Planning a ${duration}-day trip to ${destination} as a ${travelerType} traveler.`;

    return this.generateTravelSuggestions({
      context,
      maxSuggestions: 5,
    });
  }

  async generateActivitySuggestions(destination: string, timeOfDay: string, interests?: string[]): Promise<string[]> {
    const interestsText = interests && interests.length > 0
      ? ` Interests: ${interests.join(', ')}.`
      : '';

    const context = `Looking for ${timeOfDay} activities in ${destination}.${interestsText}`;

    return this.generateTravelSuggestions({
      context,
      maxSuggestions: 4,
    });
  }

  async answerTravelQuestion(question: string, context: string): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are a knowledgeable travel assistant. Provide helpful, accurate, and concise answers to travel-related questions.'
      },
      {
        role: 'user',
        content: `Context: ${context}\n\nQuestion: ${question}`
      },
    ];

    return this.makeRequest(messages);
  }

  async generatePackingList(destination: string, duration: number, season: string, activities: string[]): Promise<string[]> {
    const context = `Traveling to ${destination} for ${duration} days in ${season}. Activities planned: ${activities.join(', ')}.`;

    const systemPrompt = 'You are a travel packing expert. Provide a practical packing list with essential items. Return exactly 10 items as a numbered list.';
    const userPrompt = `${context}\n\nGenerate a packing list with 10 essential items.`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const response = await this.makeRequest(messages);

    const items = response
      .split('\n')
      .filter(line => line.trim().match(/^\d+\./))
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(s => s.length > 0);

    return items.slice(0, 10);
  }

  async generateBudgetAdvice(destination: string, budget: number, duration: number): Promise<string[]> {
    const context = `Trip to ${destination} for ${duration} days with a budget of $${budget}.`;

    return this.generateTravelSuggestions({
      context,
      userQuery: 'How can I make the most of my budget?',
      maxSuggestions: 5,
    });
  }
}

export const openaiService = new OpenAIService();
