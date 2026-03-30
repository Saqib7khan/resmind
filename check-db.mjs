import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envFile = fs.readFileSync('.env.local', 'utf8');
const supabaseUrl = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1].trim();
const supabaseKey = envFile.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1].trim();

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase
    .from('generations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('DB Error:', error);
    return;
  }
  
  console.log("RECENT GENERATIONS:");
  data.forEach(d => console.log(`ID: ${d.id}, Status: ${d.status}, Score: ${d.score}, ResDataNull: ${d.structured_resume_data == null}`));
}

check();
