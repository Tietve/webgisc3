import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@hooks'
import { ROUTES } from '@constants'

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('login')
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    password_confirm: '',
    role: 'student'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value })
  }

  const handleSignupChange = (e) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value })
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(loginData.email, loginData.password)

    if (!result.success) {
      setError(result.error)
    }
    setLoading(false)
  }

  const handleSignupSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (signupData.password !== signupData.password_confirm) {
      setError('Mật khẩu xác nhận không khớp!')
      return
    }

    setLoading(true)
    const result = await register(signupData)

    if (result.success) {
      setActiveTab('login')
      setError('')
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  return (
    <div className="auth-page">
      {/* Animated Earth Background */}
      <div className="auth-background">
        <div className="earth-animation"></div>
        <div className="stars"></div>
        <div className="overlay"></div>
      </div>

      {/* Auth Container */}
      <div className="auth-container">
        <div className="auth-box">
          {/* Left side - Welcome Section */}
          <div className="welcome-section">
            <h1 className="text-5xl font-bold mb-6 text-white">🌍 WebGIS Platform</h1>
            <p className="text-lg text-white/90 mb-8">
              Nền tảng giáo dục GIS toàn diện - Khám phá thế giới bản đồ số
            </p>
            <ul className="welcome-features">
              <li>📚 Bài học GIS tương tác</li>
              <li>🗺️ Công cụ phân tích bản đồ</li>
              <li>👥 Quản lý lớp học trực tuyến</li>
              <li>📝 Hệ thống quiz & đánh giá</li>
              <li>🎯 Học tập theo dự án thực tế</li>
            </ul>
          </div>

          {/* Right side - Form Section */}
          <div className="form-section">
            {/* Tab Switcher */}
            <div className="tab-switcher">
              <button
                className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
                onClick={() => setActiveTab('login')}
              >
                Đăng nhập
              </button>
              <button
                className={`tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
                onClick={() => setActiveTab('signup')}
              >
                Đăng ký
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {/* Login Form */}
            {activeTab === 'login' && (
              <div className="form-content active">
                <form onSubmit={handleLoginSubmit}>
                  <div className="form-group">
                    <label htmlFor="login-email">Email</label>
                    <input
                      type="email"
                      id="login-email"
                      name="email"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      placeholder="Nhập email của bạn"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="login-password">Mật khẩu</label>
                    <input
                      type="password"
                      id="login-password"
                      name="password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      placeholder="Nhập mật khẩu"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className={`submit-btn ${loading ? 'loading' : ''}`}
                    disabled={loading}
                  >
                    {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                  </button>

                  {/* Demo Credentials */}
                  <div className="demo-credentials">
                    <p className="text-xs font-semibold text-white/80 mb-2">Demo Accounts:</p>
                    <div className="text-xs text-white/70 space-y-1">
                      <p>👨‍💼 admin@webgis.com / admin123</p>
                      <p>👨‍🏫 teacher01@webgis.com / teacher123</p>
                      <p>👨‍🎓 student01@webgis.com / student123</p>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Signup Form */}
            {activeTab === 'signup' && (
              <div className="form-content active">
                <form onSubmit={handleSignupSubmit}>
                  <div className="form-group">
                    <label htmlFor="signup-email">Email</label>
                    <input
                      type="email"
                      id="signup-email"
                      name="email"
                      value={signupData.email}
                      onChange={handleSignupChange}
                      placeholder="Nhập email của bạn"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="signup-password">Mật khẩu</label>
                    <input
                      type="password"
                      id="signup-password"
                      name="password"
                      value={signupData.password}
                      onChange={handleSignupChange}
                      placeholder="Tạo mật khẩu (tối thiểu 6 ký tự)"
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="signup-confirm">Xác nhận mật khẩu</label>
                    <input
                      type="password"
                      id="signup-confirm"
                      name="password_confirm"
                      value={signupData.password_confirm}
                      onChange={handleSignupChange}
                      placeholder="Nhập lại mật khẩu"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="signup-role">Vai trò</label>
                    <select
                      id="signup-role"
                      name="role"
                      value={signupData.role}
                      onChange={handleSignupChange}
                      className="form-select"
                      required
                    >
                      <option value="student">Học sinh</option>
                      <option value="teacher">Giáo viên</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className={`submit-btn ${loading ? 'loading' : ''}`}
                    disabled={loading}
                  >
                    {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSS Styles */}
      <style jsx>{`
        .auth-page {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
        }

        /* Animated Background */
        .auth-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          background: #000;
        }

        .earth-animation {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url('https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExaWcwdWpxbmV1cWF3cjRiYXYyYWpkNzN5ZzBqb3hjMXdoN2pndHM2NCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/MDJ9IbxxvDUQM/giphy.gif');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          opacity: 0.6;
        }

        .stars {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: transparent url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="10" cy="10" r="1" fill="white" opacity="0.8"/><circle cx="40" cy="30" r="1" fill="white" opacity="0.6"/><circle cx="70" cy="20" r="1" fill="white" opacity="0.9"/><circle cx="30" cy="60" r="1" fill="white" opacity="0.7"/><circle cx="80" cy="80" r="1" fill="white" opacity="0.5"/><circle cx="50" cy="90" r="1" fill="white" opacity="0.8"/></svg>') repeat;
          animation: twinkle 3s infinite;
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        .overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.4);
        }

        /* Container */
        .auth-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 20px;
        }

        /* Glass morphism box */
        .auth-box {
          position: relative;
          width: 100%;
          max-width: 950px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          animation: slideIn 0.5s ease-out;
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 550px;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Welcome Section */
        .welcome-section {
          background: rgba(0, 0, 0, 0.3);
          padding: 50px 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
        }

        .welcome-features {
          list-style: none;
          text-align: left;
          margin-top: 30px;
          color: white;
        }

        .welcome-features li {
          padding: 12px 0;
          font-size: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        /* Form Section */
        .form-section {
          padding: 50px 45px;
          display: flex;
          flex-direction: column;
        }

        /* Tab Switcher */
        .tab-switcher {
          display: flex;
          gap: 10px;
          margin-bottom: 30px;
        }

        .tab-btn {
          flex: 1;
          padding: 12px;
          border: none;
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.7);
          font-size: 16px;
          font-weight: 500;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .tab-btn.active {
          background: rgba(255, 255, 255, 0.3);
          color: white;
        }

        .tab-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        /* Form Content */
        .form-content {
          flex: 1;
          animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Form Groups */
        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          color: white;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 8px;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
        }

        .form-group input,
        .form-select {
          width: 100%;
          padding: 14px 16px;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 10px;
          color: white;
          font-size: 15px;
          transition: all 0.3s ease;
        }

        .form-group input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        .form-group input:focus,
        .form-select:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.5);
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
        }

        .form-select {
          cursor: pointer;
        }

        .form-select option {
          background: #1e3c72;
          color: white;
        }

        /* Submit Button */
        .submit-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 10px;
          color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          margin-top: 10px;
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
        }

        .submit-btn:active {
          transform: translateY(0);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .submit-btn.loading::after {
          content: '';
          width: 16px;
          height: 16px;
          border: 2px solid white;
          border-top-color: transparent;
          border-radius: 50%;
          display: inline-block;
          margin-left: 10px;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Error Message */
        .error-message {
          margin-bottom: 20px;
          padding: 12px;
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.5);
          border-radius: 10px;
          color: white;
          font-size: 14px;
          text-align: center;
        }

        /* Demo Credentials */
        .demo-credentials {
          margin-top: 20px;
          padding: 15px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .auth-box {
            grid-template-columns: 1fr;
            max-width: 420px;
          }

          .welcome-section {
            display: none;
          }

          .form-section {
            padding: 40px 30px;
          }
        }
      `}</style>
    </div>
  )
}

export default AuthPage
