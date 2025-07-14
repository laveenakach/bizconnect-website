const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { businessesRef, usersRef } = require('./firebase');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    const user = { id: uuidv4(), email, password };
    await usersRef.doc(user.id).set(user);
    res.status(201).json({ message: 'User registered', user });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const snapshot = await usersRef.where('email', '==', email).where('password', '==', password).get();
    if (!snapshot.empty) {
      res.json({ message: 'Login successful', user: snapshot.docs[0].data() });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/businesses', async (req, res) => {
  try {
    const newBiz = req.body;
    const docRef = await businessesRef.add(newBiz);
    res.status(201).json({ id: docRef.id, ...newBiz });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add business' });
  }
});

app.get('/api/businesses', async (req, res) => {
  const { q = '', service = '' } = req.query;
  try {
    const snapshot = await businessesRef.get();
    let businesses = [];
    snapshot.forEach(doc =>
      businesses.push({ id: doc.id, ...doc.data() })
    );
    const processedQuery = q.trim().toLowerCase();
    const filtered = businesses.filter(biz => {
        const name = (biz.name || '').toLowerCase();
        const svc = (biz.service || '').toLowerCase();
        const query = q.trim().toLowerCase();
        const serviceFilter = service.trim().toLowerCase();
        const matchesNameOrService = name.includes(query) || svc.includes(query);
        const matchesService = serviceFilter === '' || svc === serviceFilter;
        return matchesNameOrService && matchesService;
    });
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch businesses' });
  }
});

app.get('/api/services', async (req, res) => {
  try {
    const snapshot = await businessesRef.get();
    const servicesSet = new Set();
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.service) {
        servicesSet.add(data.service);
      }
    });
    const services = Array.from(servicesSet);
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
