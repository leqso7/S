import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// IP ბლოკირების შემოწმება
export const checkBlockedIP = async (req, res, next) => {
  const clientIP = req.ip
  
  try {
    const { data, error } = await supabase
      .from('blocked_ips')
      .select('ip')
      .eq('ip', clientIP)
      .single()

    if (data) {
      return res.status(403).json({ error: 'Access denied' })
    }

    next()
  } catch (err) {
    console.error('Error checking IP:', err)
    next()
  }
}

// რექვესტების რაოდენობის შემოწმება
export const checkRequestLimit = async (req, res, next) => {
  const clientIP = req.ip
  const now = new Date()
  const fifteenMinutesAgo = new Date(now - 15 * 60 * 1000)

  try {
    const { count, error } = await supabase
      .from('request_logs')
      .select('id', { count: 'exact' })
      .eq('ip', clientIP)
      .gte('created_at', fifteenMinutesAgo.toISOString())

    if (count > 100) {
      return res.status(429).json({ error: 'Too many requests' })
    }

    // ლოგის ჩაწერა
    await supabase
      .from('request_logs')
      .insert([{
        ip: clientIP,
        endpoint: req.originalUrl,
        method: req.method,
        created_at: now.toISOString()
      }])

    next()
  } catch (err) {
    console.error('Error checking request limit:', err)
    next()
  }
}
