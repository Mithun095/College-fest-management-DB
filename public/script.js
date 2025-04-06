function showTab(tabId) {
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));

  document.querySelector(`#${tabId}`).classList.remove('hidden');
  const activeBtn = Array.from(document.querySelectorAll('.tab-button')).find(btn => btn.textContent.includes(tabId.includes('form') ? 'Data' : 'Query'));
  activeBtn.classList.add('active');
}

function fetchData(endpoint) {
  fetch(`http://localhost:3000/${endpoint}`)
    .then(res => res.json())
    .then(data => {
      const outputDiv = document.getElementById('output');
      if (data.length === 0) {
        outputDiv.innerHTML = '<p>No data found.</p>';
        return;
      }

      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const tbody = document.createElement('tbody');

      const headers = Object.keys(data[0]);
      const headerRow = document.createElement('tr');
      headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);

      data.forEach(row => {
        const tr = document.createElement('tr');
        headers.forEach(header => {
          const td = document.createElement('td');
          td.textContent = row[header];
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });

      table.appendChild(thead);
      table.appendChild(tbody);
      outputDiv.innerHTML = '';
      outputDiv.appendChild(table);
    })
    .catch(err => {
      document.getElementById('output').innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
    });
}

// -------------------------
// Form submission handlers
// -------------------------

document.getElementById('studentForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(this).entries());

  fetch('http://localhost:3000/students', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then(res => res.text())
    .then(msg => {
      alert(msg);
      this.reset();
    })
    .catch(err => alert('Error adding student: ' + err.message));
});

document.getElementById('eventForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(this).entries());

  fetch('http://localhost:3000/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then(res => res.text())
    .then(msg => {
      alert(msg);
      this.reset();
    })
    .catch(err => alert('Error adding event: ' + err.message));
});

document.getElementById('registrationForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(this).entries());

  // Extract and remove amount if present
  const { studentID, eventID, amount } = data;

  // First, register the student
  fetch('http://localhost:3000/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentID, eventID })
  })
    .then(res => res.text())
    .then(msg => {
      if (amount && parseFloat(amount) !== 0) {
        // Submit payment if amount is valid
        fetch('http://localhost:3000/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentID, eventID, amount: parseFloat(amount) })
        })
          .then(res => res.text())
          .then(paymentMsg => {
            alert(`${msg}\n${paymentMsg}`);
            this.reset();
          })
          .catch(err => alert('Payment error: ' + err.message));
      } else {
        alert(msg);
        this.reset();
      }
    })
    .catch(err => alert('Error registering student: ' + err.message));
});

document.getElementById('feedbackForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(this).entries());

  fetch('http://localhost:3000/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then(res => res.text())
    .then(msg => {
      alert(msg);
      this.reset();
    })
    .catch(err => alert('Error submitting feedback: ' + err.message));
});
