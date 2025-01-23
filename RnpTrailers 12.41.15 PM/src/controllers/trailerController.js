const { validationResult } = require('express-validator');
const Trailer = require('../models/Trailer');

exports.getAllTrailers = async (req, res) => {
  try {
    const trailers = await Trailer.find();
    res.json(trailers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTrailerById = async (req, res) => {
  try {
    const trailer = await Trailer.findById(req.params.id);
    if (!trailer) {
      return res.status(404).json({ message: 'Trailer not found' });
    }
    res.json(trailer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createTrailer = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const trailer = new Trailer(req.body);
    await trailer.save();
    res.status(201).json(trailer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTrailer = async (req, res) => {
  try {
    const trailer = await Trailer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!trailer) {
      return res.status(404).json({ message: 'Trailer not found' });
    }
    res.json(trailer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTrailer = async (req, res) => {
  try {
    const trailer = await Trailer.findByIdAndDelete(req.params.id);
    if (!trailer) {
      return res.status(404).json({ message: 'Trailer not found' });
    }
    res.json({ message: 'Trailer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 