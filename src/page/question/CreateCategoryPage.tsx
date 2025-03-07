import { Send } from "lucide-react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { useState } from "react";
import Swal from "sweetalert2";
import { submitCreateQuestionCategory } from "../../api/apiService";

export default function CreateCategoryPage() {
  const [categoryTitle, setCategoryTitle] = useState("");
  const [loading, setLoading] = useState(false);

  // 處理表單提交
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // 簡單的表單驗證
    if (categoryTitle.trim() === "") {
      Swal.fire({
        title: "欄位不可為空",
        text: "請輸入問題種類的標題",
        icon: "error",
      });
      return;
    }

    try {
      setLoading(true);

      // 發送 POST 請求到後端 API

      const result = await submitCreateQuestionCategory({ CategoryTitle: categoryTitle });

      if (result.success) {
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          },
        });
        Toast.fire({
          icon: "success",
          title: "Signed in successfully",
        });
        setCategoryTitle(""); // 清空輸入框
      } else {
        Swal.fire({
          title: "新增失敗",
          text: result.message || "未知錯誤",
          icon: "warning",
        });
      }
    } catch (error) {
      console.error("新增失敗:", error);
      Swal.fire({
        title: "新增失敗",
        text: "請稍後再試",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Container fluid className="bg-white rounded-5 p-3 mt-5 mb-5" style={{ width: "30vw" }}>
        <Row className="justify-content-center">
          <Col md={8} lg={10}>
            <h1 className="text-center mb-5">新增題組</h1>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>題組標題</Form.Label>
                <Form.Control type="text" placeholder="輸入題組標題" value={categoryTitle} onChange={(e) => setCategoryTitle(e.target.value)} required />
              </Form.Group>

              {/* 提交按鈕 */}
              <Row className="mb-3">
                <Col className="d-flex justify-content-center">
                  <Button variant="primary" type="submit" className="mt-5 w-20 mx-2" style={{ backgroundColor: "#003D79" }} disabled={loading}>
                    <Send size={18} />
                    {loading ? "提交中..." : "新增問題種類"}
                  </Button>
                </Col>
              </Row>
            </Form>
          </Col>
        </Row>
      </Container>
    </>
  );
}
