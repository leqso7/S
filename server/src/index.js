const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();

// უსაფრთხოების middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting - მაქსიმუმ 100 რექვესტი 15 წუთში
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Supabase კლიენტი
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// JWT ტოკენის შემოწმება
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  
  if (!token) {
    return res.status(403).json({ error: 'No token provided' });
  }

  jwt.verify(token.split(' ')[1], process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.userId = decoded.id;
    next();
  });
};

// მოთხოვნის გაგზავნა
app.post('/api/request-access', async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    
    const { data, error } = await supabase
      .from('access_requests')
      .insert([{
        code,
        first_name: firstName,
        last_name: lastName,
        status: 'pending',
        created_at: new Date().toISOString()
      }]);

    if (error) throw error;

    res.json({ code });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// სტატუსის შემოწმება
app.get('/api/check-status/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    const { data, error } = await supabase
      .from('access_requests')
      .select('status')
      .eq('code', code)
      .single();

    if (error) throw error;

    res.json({ status: data?.status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// IP-ის დაბლოკვა
app.post('/api/block-ip', verifyToken, async (req, res) => {
  try {
    const { ip } = req.body;
    
    const { data, error } = await supabase
      .from('blocked_ips')
      .insert([{ ip, blocked_at: new Date().toISOString() }]);

    if (error) throw error;

    res.json({ message: 'IP blocked successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
