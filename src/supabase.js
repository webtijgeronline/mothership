import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://wxidercfgkpuadvqxhbm.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4aWRlcmNmZ2twdWFkdnF4aGJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMjgyNTksImV4cCI6MjA4ODgwNDI1OX0.wyCKGQu0b0VAGypXK64u9WMXz7wr81_lvlw_gmrYHP8'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)
