import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const keyMatch = envFile.match(/GEMINI_API_KEY=(.*)/);
const apiKey = keyMatch ? keyMatch[1].trim() : '';

async function run() {
  const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  const response = await fetch(listUrl);
  const data = await response.json();
  const models = data.models.map(m => m.name).join('\n');
  fs.writeFileSync('models.txt', models, 'utf8');
}

run();
