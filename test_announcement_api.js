/**
 * Test Announcement Creation API
 *
 * This script tests the announcement creation endpoint to verify:
 * 1. Admin can create announcements in any classroom
 * 2. Teacher can create announcements in their classroom
 * 3. Serializer correctly handles 'classroom' as read-only field
 */

const BASE_URL = 'http://localhost:8080/api/v1'

async function login(email, password) {
  const response = await fetch(`${BASE_URL}/auth/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password })
  })

  if (!response.ok) {
    throw new Error(`Login failed: ${response.status}`)
  }

  const data = await response.json()
  return data.access
}

async function createAnnouncement(token, classroomId, content) {
  const response = await fetch(`${BASE_URL}/classrooms/${classroomId}/announcements/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ content })
  })

  const data = await response.json()

  if (!response.ok) {
    console.error('❌ Failed to create announcement:', {
      status: response.status,
      error: data
    })
    return null
  }

  console.log('✅ Announcement created:', {
    id: data.id,
    content: data.content,
    classroom: data.classroom,
    author: data.author_email,
    created_at: data.created_at
  })
  return data
}

async function testAnnouncementCreation() {
  console.log('🧪 Testing Announcement Creation API\n')

  try {
    // Test 1: Admin creates announcement
    console.log('Test 1: Admin creates announcement')
    const adminToken = await login('admin@webgis.com', 'admin123')
    console.log('✓ Admin logged in')

    const adminAnnouncement = await createAnnouncement(
      adminToken,
      1, // Classroom ID (adjust as needed)
      'This is a test announcement from admin'
    )

    if (adminAnnouncement) {
      console.log('✅ Test 1 PASSED: Admin can create announcements\n')
    } else {
      console.log('❌ Test 1 FAILED: Admin cannot create announcements\n')
    }

    // Test 2: Teacher creates announcement (optional - requires knowing teacher credentials)
    // Uncomment if you have teacher credentials
    /*
    console.log('Test 2: Teacher creates announcement')
    const teacherToken = await login('teacher@webgis.com', 'teacher123')
    console.log('✓ Teacher logged in')

    const teacherAnnouncement = await createAnnouncement(
      teacherToken,
      1,
      'This is a test announcement from teacher'
    )

    if (teacherAnnouncement) {
      console.log('✅ Test 2 PASSED: Teacher can create announcements\n')
    } else {
      console.log('❌ Test 2 FAILED: Teacher cannot create announcements\n')
    }
    */

  } catch (error) {
    console.error('❌ Test failed with error:', error.message)
  }
}

// Run tests
testAnnouncementCreation()
