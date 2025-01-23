const { validationResult } = require('express-validator');
const Rental = require('../models/Rental');
const Trailer = require('../models/Trailer');

exports.getAllRentals = async (req, res) => {
  try {
    const rentals = await Rental.find()
      .populate('trailerId')
      .populate('customerId');
    res.json(rentals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createRental = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { trailerId, startDate, endDate } = req.body;
    
    // Check trailer availability
    const trailer = await Trailer.findById(trailerId);
    if (!trailer || trailer.status !== 'available') {
      return res.status(400).json({ message: 'Trailer not available' });
    }

    // Calculate rental cost
    const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    const totalCost = days * trailer.price;
    const deposit = trailer.price * 0.5;

    const rental = new Rental({
      ...req.body,
      totalCost,
      deposit
    });

    await rental.save();
    
    // Update trailer status
    trailer.status = 'rented';
    await trailer.save();

    res.status(201).json(rental);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.completeRental = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    rental.status = 'completed';
    await rental.save();

    // Update trailer status
    const trailer = await Trailer.findById(rental.trailerId);
    if (trailer) {
      trailer.status = 'available';
      await trailer.save();
    }

    res.json(rental);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
