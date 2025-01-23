const mongoose = require('mongoose');

const trailerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['utility', 'enclosed', 'car', 'boat']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['available', 'rented', 'maintenance'],
    default: 'available'
  },
  description: String,
  specs: {
    length: Number,
    width: Number,
    capacity: Number
  },
  licensePlate: String,
  vin: String,
  maintenanceHistory: [{
    date: Date,
    description: String,
    cost: Number
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Trailer', trailerSchema); 