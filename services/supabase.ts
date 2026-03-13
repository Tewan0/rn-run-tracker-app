//ตั้งค่าการเชื่อมต่อกับ Supabase
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

const supabaseUrl = "https://asppmklalsfcvyamkfae.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzcHBta2xhbHNmY3Z5YW1rZmFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxODM1NDksImV4cCI6MjA4NTc1OTU0OX0.kIVZMvGoCMYUpYvZMutLSnWN-iNw-A3c4geAQjXx_RI";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  // ใช้ AsyncStorage ของ React Native สำหรับจัดการ session
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
