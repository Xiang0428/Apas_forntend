import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap'
import Header from '../Header'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getQuestionCategoryByID } from '../../api/apiService'
import { IGetQuestionCategoryResponse } from '../../model/IQuestion'
import Swal from 'sweetalert2'

export default function QuestionList() {
  const [searchParams] = useSearchParams()
  const categoryId = searchParams.get('categoryId') // 從查詢參數中取得 categoryId
  const [questionData, setQuestionData] = useState<IGetQuestionCategoryResponse['data'] | null>(null)

  useEffect(() => {
    const fetchQuestions = async () => {
      Swal.fire({
        title: '載入中...',
        html: '正在取得資料',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      try {
        const response = await getQuestionCategoryByID(Number(categoryId))

        if (response.success) {
          setQuestionData(response.data) // 正確更新狀態
        } else {
          Swal.fire({
            title: '取得資料失敗',
            text: response.message || '未知錯誤',
            icon: 'error',
          })
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '未知錯誤'
        Swal.fire({
          title: '取得資料失敗',
          text: errorMessage,
          icon: 'error',
        })
      } finally {
        Swal.close() // 確保 Swal 狀態關閉
      }
    }

    fetchQuestions()
  }, [categoryId])

  return (
    <>
      <Container fluid style={{ maxWidth: '90vw', padding: '2rem' }}>
        <Row className="mb-5 g-4">
          {/* 左側卡片區域 */}
          <Col lg={9}>
            {questionData && questionData.questions && questionData.questions.length > 0 ? (
              questionData.questions.map((question) => (
                <Card key={question.questionId} className="mb-3 border-0">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <Card.Title className="mb-1 mt-2">
                          <b>{question.questionTitle}</b>
                        </Card.Title>
                        <Card.Text className="text-muted mb-2">
                          <span className="text-success">
                            {question.questionDifficulty == 1
                              ? 'Easy'
                              : question.questionDifficulty == 2
                              ? 'Medium'
                              : 'Hard'}
                          </span>
                        </Card.Text>
                      </div>
                      <Link
                        to={`/question-detail?questionId=${question.questionId}`}
                        state={{ question }} // 使用 React Router 的 state 傳遞資料
                      >
                        <Button
                          className="custom-button"
                          variant="primary"
                          size="sm"
                          style={{ backgroundColor: '#003D79' }}
                        >
                          進入挑戰
                        </Button>
                      </Link>
                    </div>
                  </Card.Body>
                </Card>
              ))
            ) : (
              <div className="text-center text-muted mt-3">暫無資料</div>
            )}
          </Col>

          {/* 右側狀態選項 */}
          <Col lg={3}>
            <Card className="shadow-sm border-0" style={{ borderRadius: '1rem', padding: '1rem' }}>
              <Card.Body>
                <Card.Title className="text-muted mb-3">STATUS</Card.Title>
                <Form>
                  <Form.Group className="mb-2" controlId="formSolved">
                    <Form.Check type="checkbox" label="Solved" />
                  </Form.Group>
                  <Form.Group controlId="formUnsolved">
                    <Form.Check type="checkbox" label="Unsolved" />
                  </Form.Group>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  )
}
