export class TrailerService {
  constructor() {
    this.baseUrl = '/api/trailers';
  }

  async getAllTrailers() {
    try {
      const response = await fetch(this.baseUrl);
      if (!response.ok) throw new Error('Failed to fetch trailers');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async getTrailerById(id) {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      if (!response.ok) throw new Error('Failed to fetch trailer');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
} 