require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const db = require('./db');
const authRoutes = require('./authRoutes');
const { authenticateToken } = require('./middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS)
app.use(express.static(__dirname));

// Routes
app.use('/api/auth', authRoutes);

// Get user applications
app.get('/api/user/applications', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
    
    db.all(
      `SELECT * FROM applications WHERE userId = ? ORDER BY applicationDate DESC`,
      [decoded.id],
      (err, applications) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch applications' });
        }
        res.json(applications || []);
      }
    );
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
});

// Get user saved jobs
app.get('/api/user/saved-jobs', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
    
    db.all(
      `SELECT * FROM saved_jobs WHERE userId = ? ORDER BY savedDate DESC`,
      [decoded.id],
      (err, savedJobs) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch saved jobs' });
        }
        res.json(savedJobs || []);
      }
    );
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
});

// Apply for a job
app.post('/api/user/apply', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { jobId, jobTitle, companyName } = req.body;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  if (!jobId || !jobTitle || !companyName) {
    return res.status(400).json({ error: 'jobId, jobTitle, and companyName are required' });
  }

  try {
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
    
    db.run(
      `INSERT INTO applications (userId, jobId, jobTitle, companyName) VALUES (?, ?, ?, ?)`,
      [decoded.id, jobId, jobTitle, companyName],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to apply for job' });
        }
        res.status(201).json({ 
          message: 'Application submitted',
          applicationId: this.lastID
        });
      }
    );
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
});

// Save a job
app.post('/api/user/save-job', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { jobId, jobTitle, companyName } = req.body;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  if (!jobId || !jobTitle || !companyName) {
    return res.status(400).json({ error: 'jobId, jobTitle, and companyName are required' });
  }

  try {
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
    
    db.run(
      `INSERT INTO saved_jobs (userId, jobId, jobTitle, companyName) VALUES (?, ?, ?, ?)`,
      [decoded.id, jobId, jobTitle, companyName],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Job already saved' });
          }
          return res.status(500).json({ error: 'Failed to save job' });
        }
        res.status(201).json({ 
          message: 'Job saved',
          savedJobId: this.lastID
        });
      }
    );
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
});

// Root route - serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
