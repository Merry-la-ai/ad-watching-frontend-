import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, { email, password });
      setUser(email);
      setError('');
    } catch (error) {
      setError("Login failed. Check your credentials.");
      console.error("Login failed", error);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

const Dashboard = ({ user }) => {
  const [balance, setBalance] = useState(0);
  const [ads, setAds] = useState([]);
  const [referralCode, setReferralCode] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const balanceRes = await axios.get(`${API_BASE_URL}/balance/${user}`);
        setBalance(balanceRes.data.balance);
        const adsRes = await axios.get(`${API_BASE_URL}/ads`);
        setAds(adsRes.data);
        setReferralCode(`${user}-REF${Math.floor(Math.random() * 10000)}`);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };
    fetchData();
  }, [user]);

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Balance: {balance} USDT</p>
      <p>Referral Code: {referralCode}</p>
      <h3>Available Ads</h3>
      {ads.map(ad => (
        <div key={ad._id}>
          <p>{ad.title}</p>
          <a href={ad.url} target="_blank" rel="noopener noreferrer">Watch Ad</a>
        </div>
      ))}
    </div>
  );
};

const AdminPanel = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/admin/users`);
        setUsers(res.data);
      } catch (error) {
        console.error("Error fetching users", error);
      }
    };
    fetchUsers();
  }, []);

  const handleWithdraw = async (email) => {
    try {
      await axios.post(`${API_BASE_URL}/admin/withdraw`, { email });
      alert("Withdrawal successful");
    } catch (error) {
      console.error("Withdrawal failed", error);
      alert("Withdrawal failed");
    }
  };

  return (
    <div>
      <h2>Admin Panel</h2>
      <h3>Users</h3>
      {users.map(user => (
        <div key={user.email}>
          <p>{user.email} - Balance: {user.balance} USDT</p>
          <button onClick={() => handleWithdraw(user.email)}>Withdraw Funds</button>
        </div>
      ))}
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user === "admin@example.com") {
      setIsAdmin(true);
    }
  }, [user]);

  return (
    <Router>
      <nav>
        <Link to="/">Login</Link>
        {user && <Link to="/dashboard">Dashboard</Link>}
        {isAdmin && <Link to="/admin">Admin Panel</Link>}
      </nav>
      <Routes>
        <Route path="/" element={<Login setUser={setUser} />} />
        <Route path="/dashboard" element={<Dashboard user={user} />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
};

export default App;
