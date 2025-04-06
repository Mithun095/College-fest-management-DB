-- ========================================
-- DATABASE CREATION
-- ========================================
CREATE DATABASE CollegeFestDB;
USE CollegeFestDB;

-- ========================================
-- TABLE STRUCTURES
-- ========================================

-- Students Table
CREATE TABLE Students (
    StudentID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Phone VARCHAR(15) UNIQUE NOT NULL,
    College VARCHAR(100) NOT NULL
);

-- Sponsors Table
CREATE TABLE Sponsors (
    SponsorID INT PRIMARY KEY AUTO_INCREMENT,
    SponsorName VARCHAR(100) NOT NULL,
    Contribution DECIMAL(10,2) NOT NULL
);

-- Events Table
CREATE TABLE Events (
    EventID INT PRIMARY KEY AUTO_INCREMENT,
    EventName VARCHAR(100) NOT NULL,
    EventDate DATE NOT NULL,
    Venue VARCHAR(100) NOT NULL,
    MaxParticipants INT NOT NULL,
    CurrentParticipants INT DEFAULT 0,
    SponsorID INT,
    FOREIGN KEY (SponsorID) REFERENCES Sponsors(SponsorID)
);

-- Registrations Table
CREATE TABLE Registrations (
    RegistrationID INT PRIMARY KEY AUTO_INCREMENT,
    StudentID INT NOT NULL,
    EventID INT NOT NULL,
    RegistrationDate DATETIME DEFAULT NOW(),
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID) ON DELETE CASCADE,
    FOREIGN KEY (EventID) REFERENCES Events(EventID) ON DELETE CASCADE,
    UNIQUE (StudentID, EventID)
);

-- Payments Table
CREATE TABLE Payments (
    PaymentID INT PRIMARY KEY AUTO_INCREMENT,
    StudentID INT NOT NULL,
    EventID INT NOT NULL,
    Amount DECIMAL(10,2) NOT NULL,
    PaymentDate DATETIME DEFAULT NOW(),
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID) ON DELETE CASCADE,
    FOREIGN KEY (EventID) REFERENCES Events(EventID) ON DELETE CASCADE
);

-- Feedback Table
CREATE TABLE Feedback (
    FeedbackID INT PRIMARY KEY AUTO_INCREMENT,
    StudentID INT NOT NULL,
    EventID INT NOT NULL,
    Comments TEXT,
    Rating INT,
    FOREIGN KEY (StudentID) REFERENCES Students(StudentID) ON DELETE CASCADE,
    FOREIGN KEY (EventID) REFERENCES Events(EventID) ON DELETE CASCADE
);

-- SponsorshipStats Table
CREATE TABLE SponsorshipStats (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    Total DECIMAL(10,2)
);
-- ========================================
-- TRIGGERS
-- ========================================

-- Auto-increment CurrentParticipants on Registration
DELIMITER $$
CREATE TRIGGER UpdateEventParticipants
AFTER INSERT ON Registrations
FOR EACH ROW
BEGIN
    UPDATE Events
    SET CurrentParticipants = CurrentParticipants + 1
    WHERE EventID = NEW.EventID;
END$$
DELIMITER ;

-- Ensure Payments are positive
DELIMITER $$
CREATE TRIGGER EnsurePositivePayment
BEFORE INSERT ON Payments
FOR EACH ROW
BEGIN
    IF NEW.Amount <= 0 THEN
        SET NEW.Amount = 100.00;
    END IF;
END$$
DELIMITER ;

-- ========================================
-- SAMPLE DATA 
-- ========================================

-- Students
INSERT INTO Students (Name, Email, Phone, College) VALUES
('Aarav Sharma', 'aarav.sharma@example.com', '9876543001', 'IIT Bombay'),
('Isha Verma', 'isha.verma@example.com', '9876543002', 'Delhi University'),
('Rohan Mehta', 'rohan.mehta@example.com', '9876543003', 'BITS Pilani'),
('Sneha Reddy', 'sneha.reddy@example.com', '9876543004', 'Anna University'),
('Karan Patel', 'karan.patel@example.com', '9876543005', 'NIT Trichy'),
('Priya Singh', 'priya.singh@example.com', '9876543006', 'Jadavpur University'),
('Ankit Desai', 'ankit.desai@example.com', '9876543007', 'Manipal Institute'),
('Neha Joshi', 'neha.joshi@example.com', '9876543008', 'Amity University'),
('Rahul Nair', 'rahul.nair@example.com', '9876543009', 'Christ University'),
('Tanvi Bhat', 'tanvi.bhat@example.com', '9876543010', 'VIT Vellore');

-- Sponsors
INSERT INTO Sponsors (SponsorName, Contribution) VALUES
('Infosys', 8000.00),
('Tata Consultancy', 5000.00),
('BYJUS', 6000.00);

-- Events
INSERT INTO Events (EventName, EventDate, Venue, MaxParticipants) VALUES
('CodeMania', '2025-06-10', 'IITB Lecture Hall', 100),
('Bollywood Night', '2025-06-11', 'Delhi Auditorium', 300),
('Kala Utsav', '2025-06-12', 'Chennai Art Gallery', 150),
('Desi Dance Off', '2025-06-13', 'Mumbai Main Stage', 200),
('Hack4India', '2025-06-14', 'Bangalore Tech Lab', 120),
('Youth Parliament', '2025-06-15', 'Kolkata Conference Hall', 100),
('E-Sports India', '2025-06-16', 'Hyderabad Gaming Arena', 150),
('Quiz India', '2025-06-17', 'Ahmedabad Room C', 90),
('TechTalks India', '2025-06-18', 'Pune Seminar Hall', 110),
('Khel Mahotsav', '2025-06-19', 'Delhi Sports Complex', 400);

-- Assign Sponsors
UPDATE Events SET SponsorID = 1 WHERE EventID IN (1, 2, 3);
UPDATE Events SET SponsorID = 2 WHERE EventID IN (4, 5);
UPDATE Events SET SponsorID = 3 WHERE EventID IN (6, 7, 8, 9, 10);

-- Registrations
INSERT INTO Registrations (StudentID, EventID) VALUES
(1, 1), (2, 2), (3, 3), (4, 4), (5, 5),
(6, 6), (7, 7), (8, 8), (9, 9), (10, 10);

-- Payments
INSERT INTO Payments (StudentID, EventID, Amount) VALUES
(1, 1, 300.00), (2, 2, 350.00), (3, 3, 400.00), (4, 4, 450.00),
(5, 5, 500.00), (6, 6, 550.00), (7, 7, 600.00), (8, 8, 650.00),
(9, 9, 700.00), (10, 10, 750.00);


-- Feedback
INSERT INTO Feedback (StudentID, EventID, Comments, Rating) VALUES
(1, 1, 'Brilliant code battle!', 5),
(2, 2, 'Energetic and fun!', 4),
(3, 3, 'Beautiful artwork.', 5),
(4, 4, 'Awesome dancing!', 4),
(5, 5, 'Innovative ideas.', 5),
(6, 6, 'Engaging debate.', 4),
(7, 7, 'Intense gaming match.', 5),
(8, 8, 'Challenging quiz.', 4),
(9, 9, 'Inspirational talks.', 5),
(10, 10, 'Fun and sporty!', 4);

-- SponsorshipStats initial
INSERT INTO SponsorshipStats (Total)
SELECT SUM(Contribution) FROM Sponsors;

-- Some other insert statments to make all get the output
INSERT INTO Events (EventName, EventDate, Venue, MaxParticipants, SponsorID)
VALUES ('Drama Night', '2025-06-20', 'Goa Auditorium', 120, 2);

-- Register a student and give feedback
INSERT INTO Registrations (StudentID, EventID) VALUES (1, LAST_INSERT_ID());
INSERT INTO Feedback (StudentID, EventID, Comments, Rating) VALUES (1, LAST_INSERT_ID(), 'Great acting!', 5);
select * from SponsorshipStats ;

SELECT s2.SponsorID,s2.SponsorName,s1.total as total_contribution FROM SponsorshipStats s1 ,Sponsors s2 where s1.ID = s2.SponsorID;
-- ========================================
-- ADVANCED QUERIES
-- ========================================

-- 1. Which events have 5-star feedback?
SELECT e.EventName, e.MaxParticipants, f.Rating
FROM Feedback f
JOIN Events e ON f.EventID = e.EventID
WHERE f.Rating = 5;


-- 2.List students who paid more than ₹500 for events that were sponsored by any sponsor
SELECT DISTINCT s.Name
FROM Students s
JOIN Payments p ON s.StudentID = p.StudentID
JOIN Events e ON p.EventID = e.EventID
JOIN Sponsors sp ON e.SponsorID = sp.SponsorID
WHERE p.Amount > 500;

-- 3. no Feedback for Auditorium events
SELECT 
    e.EventID,
    e.EventName,
    e.EventDate,
    e.Venue
FROM Events e
LEFT JOIN Feedback f ON e.EventID = f.EventID
WHERE f.FeedbackID IS NULL;


-- 4 Which students registered and paid for large events (more than 100 participants) that were sponsored by Infosys?
SELECT DISTINCT s.Name, e.EventName, p.Amount
FROM Students s
JOIN Registrations r ON s.StudentID = r.StudentID
JOIN Payments p ON s.StudentID = p.StudentID AND r.EventID = p.EventID
JOIN Events e ON r.EventID = e.EventID
JOIN Sponsors sp ON e.SponsorID = sp.SponsorID
WHERE e.MaxParticipants > 100
  AND sp.SponsorName = 'Infosys';



-- 5.  Which students gave feedback with a rating above 3 for events that allowed at least 80 participants?
SELECT DISTINCT s.Name, e.EventName, e.MaxParticipants, f.Rating
FROM Students s
JOIN Feedback f ON s.StudentID = f.StudentID
JOIN Events e ON f.EventID = e.EventID
WHERE f.Rating > 3
  AND e.MaxParticipants >= 80;

