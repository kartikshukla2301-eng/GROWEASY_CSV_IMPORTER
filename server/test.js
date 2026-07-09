const fs = require('fs');

const csvContent = `Name,Email,Mobile
John Doe,john@example.com,1234567890`;
fs.writeFileSync('test.csv', csvContent);

async function run() {
  const form = new FormData();
  const fileBlob = new Blob([fs.readFileSync('test.csv')], { type: 'text/csv' });
  form.append('file', fileBlob, 'test.csv');

  const response = await fetch('http://localhost:4000/api/csv/import', {
    method: 'POST',
    body: form
  });

  const text = await response.text();
  console.log(text);
}

run().catch(console.error);
