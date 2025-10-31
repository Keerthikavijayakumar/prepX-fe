import { supabase } from '@/utils/supabaseClient'

export async function GET() {
  const { data, error } = await supabase.from('users').select('*')
  return Response.json({ data, error })
}
