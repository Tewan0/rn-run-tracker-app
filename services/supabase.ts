//ตั้งค่าการเชื่อมต่อกับ Supabase
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://asppmklalsfcvyamkfae.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzcHBta2xhbHNmY3Z5YW1rZmFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxODM1NDksImV4cCI6MjA4NTc1OTU0OX0.kIVZMvGoCMYUpYvZMutLSnWN-iNw-A3c4geAQjXx_RI";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
