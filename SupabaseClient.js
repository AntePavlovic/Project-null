import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://riezvsdjcopgtlazeznv.supabase.co";
const SUPABASE_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpZXp2c2RqY29wZ3RsYXplem52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMzMDE5MTksImV4cCI6MjA0ODg3NzkxOX0.MlgOaH1pBU1G09UKhyw2z2l4NhNQT9Y9CMQUE7OoI2w";

export const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY);