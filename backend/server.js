const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb+srv://indymatic:Charly7231@cluster0.qf37zwn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));
// User Schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});
const User = mongoose.model('User', userSchema);

// Job Schema
const jobSchema = new mongoose.Schema({
  jobName: String,
  dateEntered: Date,
  jobStartDate: Date,
  estCompletionDate: Date,
  createdBy: String,
});
const Job = mongoose.model('Job', jobSchema);

// Material Schema
const materialSchema = new mongoose.Schema({
  name: String,
  cost: Number,
  category: String,
  subsection: String,
  createdBy: String,
});
const Material = mongoose.model('Material', materialSchema);

// Cost Estimate Schema
const costEstimateSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  labor: {
    hours: Number,
    technicians: Number,
    pricePerHour: Number,
    totalLaborCost: Number,
  },
  materials: [
    {
      name: String,
      cost: Number,
      quantity: Number,
      category: String,
      subsection: String,
    },
  ],
  materialMarkup: Number,
  taxRate: Number,
  specialSections: [
    {
      name: String,
      cost: Number,
      description: String,
    },
  ],
  totalCost: Number,
});
const CostEstimate = mongoose.model('CostEstimate', costEstimateSchema);

// Routes

// User Signup
app.post('/api/signup', async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send('Username already exists');
    }
    const newUser = new User({ username, password });
    await newUser.save();
    res.send('User created successfully');
  } catch (error) {
    res.status(500).send('Error creating user');
  }
});

// User Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username, password });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.json({ message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Get all jobs
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await Job.find();
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs' });
  }
});

// Create a job
app.post('/api/jobs', async (req, res) => {
  try {
    const { jobName, dateEntered, jobStartDate, estCompletionDate, createdBy } = req.body;
    const newJob = new Job({ jobName, dateEntered, jobStartDate, estCompletionDate, createdBy });
    await newJob.save();
    res.json(newJob);
  } catch (error) {
    res.status(500).json({ message: 'Error creating job' });
  }
});

// Delete a job
app.delete('/api/jobs/:id', async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    await CostEstimate.deleteMany({ jobId: req.params.id });
    res.json({ message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting job' });
  }
});

// Get materials for a specific user
app.get('/api/materials/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const materials = await Material.find({ createdBy: username });
    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching materials' });
  }
});

// Add or update a material with user-specific pricing
app.post('/api/materials', async (req, res) => {
  try {
    const { name, cost, category, subsection, createdBy } = req.body;
    const existingMaterial = await Material.findOne({ name, category, subsection, createdBy });
    
    if (existingMaterial) {
      existingMaterial.cost = cost;
      await existingMaterial.save();
      res.json(existingMaterial);
    } else {
      const newMaterial = new Material({ name, cost, category, subsection, createdBy });
      await newMaterial.save();
      res.json(newMaterial);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error saving material' });
  }
});

// Delete a material
app.delete('/api/materials/:id', async (req, res) => {
  try {
    await Material.findByIdAndDelete(req.params.id);
    res.json({ message: 'Material deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting material' });
  }
});

// Get cost estimate for a specific job
app.get('/api/cost-estimates/:jobId', async (req, res) => {
  try {
    const costEstimate = await CostEstimate.findOne({ jobId: req.params.jobId });
    res.json(costEstimate || {});
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cost estimate' });
  }
});

// Get all cost estimates (for running total on jobs page)
app.get('/api/cost-estimates', async (req, res) => {
  try {
    const costEstimates = await CostEstimate.find();
    res.json(costEstimates);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cost estimates' });
  }
});

// Save cost estimate
app.post('/api/cost-estimates', async (req, res) => {
  try {
    const { jobId, labor, materials, materialMarkup, taxRate, specialSections, totalCost } = req.body;
    let costEstimate = await CostEstimate.findOne({ jobId });
    
    if (costEstimate) {
      costEstimate.labor = labor;
      costEstimate.materials = materials;
      costEstimate.materialMarkup = materialMarkup;
      costEstimate.taxRate = taxRate;
      costEstimate.specialSections = specialSections;
      costEstimate.totalCost = totalCost;
    } else {
      costEstimate = new CostEstimate({
        jobId,
        labor,
        materials,
        materialMarkup,
        taxRate,
        specialSections,
        totalCost,
      });
    }
    
    await costEstimate.save();
    res.json(costEstimate);
  } catch (error) {
    res.status(500).json({ message: 'Error saving cost estimate' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});