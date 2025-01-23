export class RentalService {
  constructor() {
    this.baseUrl = '/api/rentals';
  }

  async createRental(rentalData) {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rentalData)
      });
      if (!response.ok) throw new Error('Failed to create rental');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
} 