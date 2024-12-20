import express from 'express'
import { supabase } from '../config/supabase.js'
import { checkBlockedIP } from '../middleware/auth.js'

const router = express.Router()

// ბლოკირებული IP-ების სია
router.get('/blocked-ips', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('blocked_ips')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({
      success: true,
      blockedIPs: data
    })
  } catch (error) {
    console.error('Error fetching blocked IPs:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch blocked IPs'
    })
  }
})

// IP-ის დაბლოკვა
router.post('/block-ip', async (req, res) => {
  try {
    const { ip } = req.body

    const { error } = await supabase
      .from('blocked_ips')
      .insert([{
        ip,
        created_at: new Date().toISOString()
      }])

    if (error) throw error

    res.json({
      success: true,
      message: 'IP blocked successfully'
    })
  } catch (error) {
    console.error('Error blocking IP:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to block IP'
    })
  }
})

// მომხმარებლის სტატუსის შეცვლა
router.post('/update-status', async (req, res) => {
  try {
    const { code, status } = req.body

    const { error } = await supabase
      .from('access_requests')
      .update({ status })
      .eq('request_code', code)

    if (error) throw error

    res.json({
      success: true,
      message: 'Status updated successfully'
    })
  } catch (error) {
    console.error('Error updating status:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update status'
    })
  }
})

export default router
