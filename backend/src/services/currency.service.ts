import axios from 'axios';
import { CurrencyData } from '../types';

export class CurrencyService {
  private apiKey: string;
  private baseUrl = 'https://api.exchangerate-api.com/v4/latest';

  constructor() {
    // Using a free API that doesn't require a key for basic usage
    // For production, consider using a service that requires API key
    this.apiKey = process.env.EXCHANGE_RATE_API_KEY || '';
  }

  async convertCurrency(
    from: string,
    to: string,
    amount?: number
  ): Promise<CurrencyData> {
    try {
      const response = await axios.get(`${this.baseUrl}/${from.toUpperCase()}`);

      const rate = response.data.rates[to.toUpperCase()];

      if (!rate) {
        throw new Error(`Currency ${to} not found`);
      }

      const result: CurrencyData = {
        from: from.toUpperCase(),
        to: to.toUpperCase(),
        rate: parseFloat(rate.toFixed(4))
      };

      if (amount) {
        result.amount = amount;
        result.converted = parseFloat((amount * rate).toFixed(2));
      }

      return result;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Currency API error: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  async getExchangeRate(from: string, to: string): Promise<number> {
    const data = await this.convertCurrency(from, to);
    return data.rate;
  }

  getSupportedCurrencies(): string[] {
    return [
      'USD', 'EUR', 'GBP', 'CHF', 'CAD', 'AUD', 'JPY',
      'NOK', 'SEK', 'DKK', 'NZD', 'ISK'
    ];
  }
}
