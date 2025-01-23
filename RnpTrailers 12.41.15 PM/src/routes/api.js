const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const trailerController = require('../controllers/trailerController');
const rentalController = require('../controllers/rentalController');

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Trailer routes
router.get('/trailers', trailerController.getAllTrailers);
router.get('/trailers/:id', trailerController.getTrailerById);
router.post('/trailers', [
  body('name').trim().notEmpty(),
  body('type').isIn(['utility', 'enclosed', 'car', 'boat']),
  body('price').isNumeric().toFloat(),
], trailerController.createTrailer);
router.put('/trailers/:id', trailerController.updateTrailer);
router.delete('/trailers/:id', trailerController.deleteTrailer);

// Rental routes
router.get('/rentals', rentalController.getAllRentals);
router.post('/rentals', [
  body('trailerId').isMongoId(),
  body('customerId').isMongoId(),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
], rentalController.createRental);
router.put('/rentals/:id/complete', rentalController.completeRental);

module.exports = router; 