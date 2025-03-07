import { Mail, Lock, User } from 'lucide-react'
import React, { useState } from 'react'
import { Card, Form, Button, InputGroup, Alert } from 'react-bootstrap'
import './style.css'
import { RegisterApi } from '../../api/apiService'

interface Props {
  onSwitchToLogin: () => void
}

const Register: React.FC<Props> = ({ onSwitchToLogin }) => {
  const [username, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    setError(null)

    // 比對密碼是否一致
    if (password !== confirmPassword) {
      setError('密碼與確認密碼不一致')
      return
    }

    // 檢查是否有空值
    if (!username || !email || !password || !confirmPassword) {
      setError('請填寫所有欄位')
      return
    }

    setLoading(true)

    try {
      const data = { username, email, password, confirmPassword }
      await RegisterApi(data)

      setSuccess('註冊成功！正在轉到登入頁面...')

      setTimeout(() => {
        onSwitchToLogin()
      }, 2000)
    } catch (error: any) {
      setError(error?.response?.data?.message || '註冊失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="shadow-lg border-0" style={{ borderRadius: '15px' }}>
      <Card.Body>
        <h2 className="text-center mb-4" style={{ fontWeight: '600', color: '#333' }}>
          註冊帳號
        </h2>
        <p className="text-center text-muted mb-4" style={{ fontSize: '0.9rem' }}>
          請輸入註冊資料
        </p>

        {/* Error Message */}
        {error && <Alert variant="danger">{error}</Alert>}

        {/* Success Message */}
        {success && <Alert variant="success">{success}</Alert>}

        <Form onSubmit={handleSubmit}>
          {/* Name */}
          <Form.Group controlId="formName" className="mb-4">
            <Form.Label>暱稱</Form.Label>
            <InputGroup>
              <InputGroup.Text>
                <User size={20} />
              </InputGroup.Text>
              <Form.Control
                type="name"
                placeholder="請輸入暱稱"
                value={username}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </InputGroup>
          </Form.Group>

          {/* Email Address */}
          <Form.Group controlId="formEmail" className="mb-4">
            <Form.Label>電子郵件</Form.Label>
            <InputGroup>
              <InputGroup.Text>
                <Mail size={20} />
              </InputGroup.Text>
              <Form.Control
                type="email"
                placeholder="請輸入電子郵件"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </InputGroup>
          </Form.Group>

          {/* Password */}
          <Form.Group controlId="formPassword" className="mb-4">
            <Form.Label>密碼</Form.Label>
            <InputGroup>
              <InputGroup.Text>
                <Lock size={20} />
              </InputGroup.Text>
              <Form.Control
                type="password"
                placeholder="請輸入密碼"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </InputGroup>
          </Form.Group>

          {/* Confirm Password */}
          <Form.Group controlId="formConfirmPassword" className="mb-4">
            <Form.Label>確認密碼</Form.Label>
            <InputGroup>
              <InputGroup.Text>
                <Lock size={20} />
              </InputGroup.Text>
              <Form.Control
                type="password"
                placeholder="請再次輸入密碼"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </InputGroup>
          </Form.Group>
          {/* Submit Button */}
          <div className="text-center">
            <Button
              variant="primary"
              type="submit"
              className="w-50 text-center"
              style={{
                backgroundColor: '#003D79',
                borderColor: '#4a90e2',
                fontSize: '1rem',
                fontWeight: '500',
              }}
              disabled={loading}
            >
              {loading ? '註冊中...' : '註冊'}
            </Button>
          </div>
        </Form>
        <div className="text-center mt-4">
          <small>
            已有帳號？
            <span onClick={onSwitchToLogin} style={{ color: '#4a90e2', cursor: 'pointer' }}>
              回到登入
            </span>
          </small>
        </div>
      </Card.Body>
    </Card>
  )
}

export default Register
