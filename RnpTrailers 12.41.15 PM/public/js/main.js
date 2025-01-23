import { TrailerService } from './services/trailerService.js';
import { RentalService } from './services/rentalService.js';

class App {
  constructor() {
    this.trailerService = new TrailerService();
    this.rentalService = new RentalService();
    this.init();
  }

  async init() {
    await this.loadTrailers();
    this.setupEventListeners();
  }

  async loadTrailers() {
    try {
      const trailers = await this.trailerService.getAllTrailers();
      this.renderTrailers(trailers);
    } catch (error) {
      this.showError('Error loading trailers');
    }
  }

  setupEventListeners() {
    const rentalForm = document.getElementById('rental-form');
    const contactForm = document.getElementById('contact-form');

    rentalForm?.addEventListener('submit', this.handleRentalSubmit.bind(this));
    contactForm?.addEventListener('submit', this.handleContactSubmit.bind(this));
  }

  renderTrailers(trailers) {
    const container = document.getElementById('trailer-container');
    if (!container) return;

    container.innerHTML = trailers.map(trailer => `
      <div class="trailer-card">
        <img src="${trailer.image || '/images/placeholder.jpg'}" alt="${trailer.name}">
        <div class="trailer-info">
          <h3>${trailer.name}</h3>
          <p class="price">$${trailer.price}/day</p>
          <p class="status ${trailer.status}">${trailer.status}</p>
          <button 
            class="btn btn-primary"
            onclick="app.rentTrailer('${trailer._id}')"
            ${trailer.status !== 'available' ? 'disabled' : ''}
          >
            Rent Now
          </button>
        </div>
      </div>
    `).join('');
  }

  async handleRentalSubmit(e) {
    e.preventDefault();
    // Rental form handling
  }

  async handleContactSubmit(e) {
    e.preventDefault();
    // Contact form handling
  }

  showError(message) {
    // Error handling
  }
}

// Initialize app
window.app = new App(); 