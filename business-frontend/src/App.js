import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [view, setView] = useState('home');
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [bizForm, setBizForm] = useState({ name: '', service: '', description: '' });
  const [search, setSearch] = useState('');
  const [service, setService] = useState('');
  const [servicesList, setServicesList] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  
  const fetchServices = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/services');
      setServicesList(res.data);
    } catch (err) {
      console.error('Error fetching services', err);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchBusinesses = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/businesses', {
        params: { q: search, service: service }
      });
      setBusinesses(res.data);
    } catch (err) {
      console.error('Error fetching businesses', err);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchBusinesses();
    }, 500);
    return () => clearTimeout(timeout);
  }, [search, service]);

  const handleRegister = async () => {
    const { email, password, confirmPassword } = form;

    if (!email || !password || !confirmPassword) {
      alert('All fields are required.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/register', { email, password });
      alert(res.data.message);
      setView('login');
    } catch (err) {
      alert('Registration failed');
    }
  };

  const handleLogin = async () => {
    const { email, password } = form;

    if (!email || !password) {
      alert('Email and password are required.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/login', { email, password });
      setUser(res.data.user);
      alert('Login successful');
      setView('home');
    } catch (err) {
      alert('Invalid credentials');
    }
  };

  const handleAddBusiness = async () => {
    try {
      await axios.post('http://localhost:5000/api/businesses', bizForm);
      alert('Business added!');
      setBizForm({ name: '', service: '', description: '' });
      fetchBusinesses();
    } catch (err) {
      alert('Failed to add business');
    }
  };

  return (
    <div className="App">
      <header className="header">
        <h1 className="logo">BizConnect</h1>
        <nav>
          {!user ? (
            <>
              <button onClick={() => setView('login')}>Login</button>
              <button onClick={() => setView('register')}>Register</button>
            </>
          ) : (
            <>
              <button onClick={() => setView('add')}>Add Business</button>
              <button onClick={() => {
                setUser(null);
                setView('home');
              }}>Logout</button>
            </>
          )}
        </nav>
      </header>

      {view === 'login' && (
        <div className="form-box">
          <h2>Login</h2>
          <label>Email</label>
          <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <label>Password</label>
          <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          <button onClick={handleLogin}>Login</button>
        </div>
      )}

      {view === 'register' && (
        <div className="form-box">
          <h2>Register</h2>
          <label>Email</label>
          <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <label>Password</label>
          <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          <label>Confirm Password</label>
          <input type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
          <button onClick={handleRegister}>Register</button>
        </div>
      )}

      {view === 'add' && user && (
        <div className="form-box">
          <h2>Add Business</h2>
          <input placeholder="Business Name" value={bizForm.name} onChange={e => setBizForm({ ...bizForm, name: e.target.value })} />
          <input placeholder="Service" value={bizForm.service} onChange={e => setBizForm({ ...bizForm, service: e.target.value })} />
          <textarea placeholder="Description" value={bizForm.description} onChange={e => setBizForm({ ...bizForm, description: e.target.value })} />
          <button onClick={handleAddBusiness}>Add</button>
        </div>
      )}

      {view === 'home' && (
        <>
          <div className="search-bar">
            <input placeholder="Search By Business Name" value={search} onChange={e => setSearch(e.target.value)} />
            <select value={service} onChange={e => setService(e.target.value)}>
              <option value="">Search By Service</option>
              {servicesList.map((svc, i) => (
                <option key={i} value={svc}>{svc}</option>
              ))}
            </select>
          </div>

          <div className="business-section">
            <h2>Featured Businesses</h2>
            <div className="business-grid">
              {businesses.map(biz => (
                <div key={biz.id} className="business-card">
                  <h3>{biz.name}</h3>
                  <p><strong>{biz.service}</strong></p>
                  <p>{biz.description}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {view === 'terms' && (
        <div className="static-page">
          <h2>Terms & Conditions</h2>
          <p>By accessing BizConnect, you agree to use the platform responsibly. Businesses must ensure their listings are accurate, and users must not misuse any contact or service information shared on our site.</p>
        </div>
      )}

      {view === 'privacy' && (
        <div className="static-page">
          <h2>Privacy Policy</h2>
          <p>Your privacy is important to us. We collect only the information necessary to deliver our services, and we never share your personal data with third parties without your consent.</p>
        </div>
      )}

      {view === 'about' && (
        <div className="static-page">
          <h2>About BizConnect</h2>
          <p>BizConnect is your gateway to discover and connect with local businesses across various industries. 
          Whether you're a customer or a business owner, our platform helps streamline visibility, trust, and growth.</p>
        </div>
      )}

      <div className="cta-section">
        <h2>Register Your Business</h2>
        <p>Are you a business owner? Get listed today!</p>
        <button onClick={() => setView(user ? 'add' : 'register')}>
          Get Started
        </button>
      </div>

      <footer className="footer">
          <div>
            <h4>About Us</h4>
            <p><a href="#" onClick={() => setView('about')}>Learn who we are and how BizConnect bridges businesses and customers with ease.</a></p>
          </div>
          <div>
            <h4>Contact Info</h4>
            <p>Email: info@bizconnect.com</p>
            <p>Phone: +91 9876543210</p>
            <p>Support available Mon–Fri, 9AM to 6PM</p>
          </div>
          <div>
            <h4>Terms & Privacy</h4>
            <p><a href="#" onClick={() => setView('terms')}>View our platform usage terms.</a></p>
            <p><a href="#" onClick={() => setView('privacy')}>How we handle your data.</a></p>
          </div>
          <div>
            <h4>Social Media</h4>
            <p><a href="https://www.facebook.com/YourBusiness" target="_blank" rel="noopener noreferrer">Facebook</a></p>
            <p><a href="https://twitter.com/YourBusiness" target="_blank" rel="noopener noreferrer">Twitter</a></p>
            <p><a href="https://www.instagram.com/YourBusiness" target="_blank" rel="noopener noreferrer">Instagram</a></p>
            <p><a href="https://www.linkedin.com/company/YourBusiness" target="_blank" rel="noopener noreferrer">LinkedIn</a></p>
          </div>
      </footer>

    </div>
  );
}

export default App;