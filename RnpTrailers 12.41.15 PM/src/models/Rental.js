const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
  trailerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trailer',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'overdue'],
    default: 'active'
  },
  totalCost: {
    type: Number,
    required: true
  },
  deposit: {
    type: Number,
    required: true
  },
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Rental', rentalSchema); 