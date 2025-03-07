import { Form, Button, Container, Row, Col, Card, InputGroup } from "react-bootstrap";
import { Mail, Lock } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginApi } from "../../api/apiService";
import Register from "./Register";
import "./style.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); // 新增 loading 狀態
  const [error, setError] = useState(""); // 新增錯誤訊息狀態
  const navigate = useNavigate(); // 使用 useNavigate
  const [showLogin, setShowLogin] = useState(true);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true); // 開始 loading
    setError(""); // 清空錯誤訊息

    try {
      const response = await LoginApi({ email, password }); // 呼叫 API
      console.log(response);
      if (response.success) {
        localStorage.setItem("jwtToken", response.data.token); // 將 JWT 儲存到 localStorage
        setEmail(""); // 清空 email
        setPassword(""); // 清空 password

        navigate("/questions-category"); // 登入成功，導航到首頁或其他頁面
      } else {
        setError(response.message || "登入失敗"); // 顯示錯誤訊息
      }
    } catch (error) {
      setError("網路錯誤，請稍後再試"); // 顯示網路錯誤訊息
      console.error("登入錯誤:", error);
    } finally {
      setIsLoading(false); // 結束 loading
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        height: "100vh",
        backgroundColor: "#edf2f7",
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <div className={`form-container ${showLogin ? "slide-in-left" : "slide-in-right"}`}>
              {showLogin ? (
                <Card className="shadow-lg border-0" style={{ borderRadius: "15px" }}>
                  <Card.Body>
                    <h2 className="text-center mb-4" style={{ fontWeight: "600", color: "#333" }}>
                      歡迎登入
                    </h2>
                    <p className="text-center text-muted mb-4" style={{ fontSize: "0.9rem" }}>
                      請輸入您的帳號與密碼
                    </p>
                    <Form onSubmit={handleSubmit}>
                      {/* Email Address */}
                      <Form.Group controlId="formEmail" className="mb-4">
                        <Form.Label>帳號</Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <Mail size={20} />
                          </InputGroup.Text>
                          <Form.Control type="email" placeholder="請輸入電子郵件" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </InputGroup>
                      </Form.Group>

                      {/* Password */}
                      <Form.Group controlId="formPassword" className="mb-4">
                        <Form.Label>密碼</Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <Lock size={20} />
                          </InputGroup.Text>
                          <Form.Control type="password" placeholder="請輸入密碼" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </InputGroup>
                      </Form.Group>

                      {/* Submit Button */}
                      <div className="text-center">
                        <Button
                          variant="primary"
                          type="submit"
                          className="w-50"
                          style={{
                            backgroundColor: "#003D79",
                            borderColor: "#4a90e2",
                            fontSize: "1rem",
                            fontWeight: "500",
                          }}
                          disabled={isLoading}
                        >
                          {isLoading ? "登入中..." : "登入"}
                        </Button>
                      </div>

                      {error && (
                        <div className="mt-3 alert alert-danger" role="alert">
                          {error}
                        </div>
                      )}
                    </Form>
                    <div className="text-center mt-4">
                      <small>
                        還沒有帳號嗎？
                        <span
                          onClick={() => setShowLogin(false)} // 切換到註冊表單
                          style={{ color: "#4a90e2", cursor: "pointer" }}
                        >
                          立即註冊
                        </span>
                      </small>
                    </div>
                  </Card.Body>
                </Card>
              ) : (
                <Register onSwitchToLogin={() => setShowLogin(true)} />
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
