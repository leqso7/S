import express from 'express'
import { supabase } from '../config/supabase.js'

const router = express.Router()

// Generate a random 5-digit code
const generateRequestCode = () => {
  return Math.floor(10000 + Math.random() * 90000).toString()
}

// Create a new request
router.post('/create', async (req, res) => {
  try {
    const requestCode = generateRequestCode()
    
    const { error } = await supabase
      .from('access_requests')
      .insert([
        {
          request_code: requestCode,
          status: 'pending'
        }
      ])

    if (error) throw error

    res.json({
      success: true,
      requestCode
    })
  } catch (error) {
    console.error('Error creating request:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create request'
    })
  }
})

// Check request status
router.get('/status/:code', async (req, res) => {
  try {
    const { code } = req.params

    const { data, error } = await supabase
      .from('access_requests')
      .select('status')
      .eq('request_code', code)
      .single()

    if (error) throw error

    res.json({
      success: true,
      status: data?.status || 'pending'
    })
  } catch (error) {
    console.error('Error checking status:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to check request status'
    })
  }
})

// დროის შემოწმება
router.get('/time/:code', async (req, res) => {
  try {
    const { code } = req.params

    const { data, error } = await supabase
      .from('access_requests')
      .select('created_at, status')
      .eq('request_code', code)
      .single()

    if (error) throw error

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      })
    }

    // თუ სტატუსი blocked-ია
    if (data.status === 'blocked') {
      return res.json({
        success: true,
        timeLeft: 0,
        status: 'blocked'
      })
    }

    // დროის გამოთვლა
    const createdAt = new Date(data.created_at)
    const now = new Date()
    const timeLeft = Math.max(0, 30 - Math.floor((now - createdAt) / 1000))

    res.json({
      success: true,
      timeLeft,
      status: data.status
    })
  } catch (error) {
    console.error('Error checking time:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to check time'
    })
  }
})

export default router
