import { useState } from "react";
import { Navbar, Nav, NavDropdown, Container } from "react-bootstrap";
import { Home, User, Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);

    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <>
      <Navbar
        expand="lg"
        style={{
          backgroundColor: isDarkMode ? "#2d3748" : "white",
          color: isDarkMode ? "#ffffff" : "#000000",
        }}
        className="p-3 shadow"
      >
        <Container fluid>
          {/* 左側內容 */}
          <Navbar.Brand href="/" className={`text-xl font-bold    d-flex align-items-center`}>
            <Home className="me-2" />
            AutoEval
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbar-nav" />
          <Navbar.Collapse id="navbar-nav">
            <Nav>
              <NavDropdown title="題目列表" id="question-list-dropdown" menuVariant={isDarkMode ? "dark" : "light"} className={isDarkMode ? "text-white" : "text-black"}>
                <NavDropdown.Item as={Link} to="/questions-category">
                  所有題目
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/my-questions">
                  我的題目
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/create-questions">
                  新增題目
                </NavDropdown.Item>
              </NavDropdown>
              <Nav.Link as={Link} to="/create-questionCategory">
                新增提組
              </Nav.Link>
              <Nav.Link as={Link} to="/assign-questions">
                分配題目頁面
              </Nav.Link>
            </Nav>
            {/* 右側內容 */}
            <Nav className="ms-auto">
              <NavDropdown
                title={<User size={24} />}
                id="user-dropdown"
                className={`text-black dark:text-white ${isDarkMode ? "text-white" : "text-black"}`}
                menuVariant={isDarkMode ? "dark" : "light"}
                drop="start"
              >
                <NavDropdown.Item onClick={() => (window.location.href = "/profile")}>個人資料</NavDropdown.Item>
                <NavDropdown.Item onClick={() => (window.location.href = "/settings")}>設定</NavDropdown.Item>
                <NavDropdown.Item onClick={toggleDarkMode}>
                  {isDarkMode ? (
                    <>
                      <Sun className="me-2" /> 淺色模式
                    </>
                  ) : (
                    <>
                      <Moon className="me-2" /> 深色模式
                    </>
                  )}
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={() => (window.location.href = "/logout")} className="text-danger">
                  登出
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};

export default Header;
