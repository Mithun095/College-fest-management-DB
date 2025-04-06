// index.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('❌ Error connecting to DB:', err);
  } else {
    console.log('✅ Connected to MySQL database');
  }
});

// ---------- Basic Tables ----------

app.get('/students', (req, res) => {
  db.query('SELECT * FROM Students', (err, results) => {
    if (err) return res.status(500).send('Error fetching students');
    res.json(results);
  });
});

app.post('/students', (req, res) => {
  const { name, email, phone, college } = req.body;
  db.query(
    'INSERT INTO Students (Name, Email, Phone, College) VALUES (?, ?, ?, ?)',
    [name, email, phone, college],
    (err) => {
      if (err) return res.status(500).send('Error adding student');
      res.status(201).send('Student added successfully');
    }
  );
});

app.get('/events', (req, res) => {
  db.query('SELECT * FROM Events', (err, results) => {
    if (err) return res.status(500).send('Error fetching events');
    res.json(results);
  });
});

app.post('/events', (req, res) => {
  const { eventName, eventDate, venue, maxParticipants, sponsorID } = req.body;
  const query = `INSERT INTO Events (EventName, EventDate, Venue, MaxParticipants, SponsorID) VALUES (?, ?, ?, ?, ?)`;
  db.query(query, [eventName, eventDate, venue, maxParticipants, sponsorID], (err) => {
    if (err) return res.status(500).send('Error adding event');
    res.status(201).send('Event added successfully');
  });
});

app.post('/register', (req, res) => {
  const { studentID, eventID } = req.body;
  db.query('INSERT INTO Registrations (StudentID, EventID) VALUES (?, ?)', [studentID, eventID], (err) => {
    if (err) return res.status(500).send('Error registering student');
    res.status(201).send('Student registered successfully');
  });
});

app.get('/registrations', (req, res) => {
  const query = `
    SELECT r.RegistrationID, s.Name AS StudentName, e.EventName, r.RegistrationDate 
    FROM Registrations r 
    JOIN Students s ON r.StudentID = s.StudentID 
    JOIN Events e ON r.EventID = e.EventID 
    ORDER BY r.RegistrationDate DESC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).send('Error fetching registrations');
    res.json(results);
  });
});

app.post('/feedback', (req, res) => {
  const { studentID, eventID, comments, rating } = req.body;
  db.query(
    'INSERT INTO Feedback (StudentID, EventID, Comments, Rating) VALUES (?, ?, ?, ?)',
    [studentID, eventID, comments, rating],
    (err) => {
      if (err) return res.status(500).send('Error submitting feedback');
      res.status(201).send('Feedback submitted successfully');
    }
  );
});

app.get('/feedback', (req, res) => {
  db.query('SELECT * FROM Feedback', (err, results) => {
    if (err) return res.status(500).send('Error fetching feedback');
    res.json(results);
  });
});

app.get('/payments', (req, res) => {
  db.query('SELECT * FROM Payments', (err, results) => {
    if (err) return res.status(500).send('Error fetching payments');
    res.json(results);
  });
});

// ✅ NEW: Add Payment
app.post('/payments', (req, res) => {
  const { studentID, eventID, amount } = req.body;

  if (!studentID || !eventID || amount == null) {
    return res.status(400).send('Missing required payment fields');
  }

  db.query(
    'INSERT INTO Payments (StudentID, EventID, Amount) VALUES (?, ?, ?)',
    [studentID, eventID, amount],
    (err) => {
      if (err) return res.status(500).send('Error adding payment');
      res.status(201).send('Payment recorded successfully');
    }
  );
});

app.get('/sponsorshipstats', (req, res) => {
  db.query('SELECT s2.SponsorID,s2.SponsorName,s1.total as total_contribution FROM SponsorshipStats s1 ,Sponsors s2 where s1.ID = s2.SponsorID;', (err, results) => {
    if (err) return res.status(500).send('Error fetching sponsorship stats');
    res.json(results);
  });
});

// ---------- Advanced Queries ----------

app.get('/fiveStarEvents', (req, res) => {
  const query = `
    SELECT e.EventName, e.MaxParticipants, f.Rating 
    FROM Feedback f 
    JOIN Events e ON f.EventID = e.EventID 
    WHERE f.Rating = 5
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).send('Error');
    res.json(results);
  });
});

app.get('/highPayers', (req, res) => {
  const query = `
    SELECT DISTINCT s.Name 
    FROM Students s 
    JOIN Payments p ON s.StudentID = p.StudentID 
    JOIN Events e ON p.EventID = e.EventID 
    JOIN Sponsors sp ON e.SponsorID = sp.SponsorID 
    WHERE p.Amount > 500
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).send('Error');
    res.json(results);
  });
});

app.get('/auditoriumFeedback', (req, res) => {
  const query = `
    SELECT 
    e.EventID,
    e.EventName,
    e.EventDate,
    e.Venue
FROM Events e
LEFT JOIN Feedback f ON e.EventID = f.EventID
WHERE f.FeedbackID IS NULL;
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).send('Error');
    res.json(results);
  });
});

app.get('/infosysBigEvents', (req, res) => {
  const query = `
    SELECT DISTINCT s.Name, e.EventName, p.Amount 
    FROM Students s 
    JOIN Registrations r ON s.StudentID = r.StudentID 
    JOIN Payments p ON s.StudentID = p.StudentID AND r.EventID = p.EventID 
    JOIN Events e ON r.EventID = e.EventID 
    JOIN Sponsors sp ON e.SponsorID = sp.SponsorID 
    WHERE e.MaxParticipants > 100 AND sp.SponsorName = 'Infosys'
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).send('Error');
    res.json(results);
  });
});

app.get('/goodRatedLargeEvents', (req, res) => {
  const query = `
    SELECT DISTINCT s.Name, e.EventName, e.MaxParticipants, f.Rating 
    FROM Students s 
    JOIN Feedback f ON s.StudentID = f.StudentID 
    JOIN Events e ON f.EventID = e.EventID 
    WHERE f.Rating > 3 AND e.MaxParticipants >= 80
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).send('Error');
    res.json(results);
  });
});

// ---------- Server ----------

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
