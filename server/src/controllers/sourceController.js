// src/controllers/sourceController.js
import Source from "../models/Source.js";

/* ----------------------------------------------
   GET ALL SOURCES (public or for editor/admin)
----------------------------------------------*/
export const getAllSources = async (req, res) => {
  try {
    const sources = await Source.find().sort({ createdAt: -1 });
    res.json(sources);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ----------------------------------------------
   GET SINGLE SOURCE BY ID
----------------------------------------------*/
export const getSourceById = async (req, res) => {
  try {
    const source = await Source.findById(req.params.id);
    if (!source) return res.status(404).json({ message: "Source not found" });
    res.json(source);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ----------------------------------------------
   CREATE NEW SOURCE (Admin only)
----------------------------------------------*/
export const createSource = async (req, res) => {
  try {
    const { name, type, endpoint, category, credibilityScore, fetchInterval } =
      req.body;

    const newSource = new Source({
      name,
      type,
      endpoint,
      category,
      credibilityScore,
      fetchInterval,
    });

    const saved = await newSource.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ----------------------------------------------
   UPDATE SOURCE (Admin only)
----------------------------------------------*/
export const updateSource = async (req, res) => {
  try {
    const source = await Source.findById(req.params.id);
    if (!source) return res.status(404).json({ message: "Source not found" });

    Object.assign(source, req.body);
    const updated = await source.save();
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ----------------------------------------------
   DELETE SOURCE (Admin only)
----------------------------------------------*/
export const deleteSource = async (req, res) => {
  try {
    const source = await Source.findById(req.params.id);
    if (!source) return res.status(404).json({ message: "Source not found" });

    await source.deleteOne();
    res.json({ message: "Source deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};
