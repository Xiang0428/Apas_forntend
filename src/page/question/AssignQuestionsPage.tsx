import { Plus, Search } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Button, Col, Container, Form, ListGroup, Modal, Row } from 'react-bootstrap'
import { getQuestionCategory, getQuestions, UpdateCategoryQuestions } from '../../api/apiService'
import { IGetQuestionCategoryResponse, IGetQuestionsResponse } from '../../model/IQuestion'
import Swal from 'sweetalert2'

export default function AssignQuestionsPage() {
  const [selectedType, setSelectedType] = useState('all') // 當前選擇的題目類型
  const [selectedQuestions, setSelectedQuestions] = useState<IGetQuestionsResponse['data']>([]) // 已選題目
  const [selectedCategory, setSelectedCategory] = useState<{ categoryId: number; categoryTitle: string }>() // 當前選擇的題組分類
  const [showModal, setShowModal] = useState(false) // 是否顯示詳細資訊彈窗
  const [currentQuestion, setCurrentQuestion] = useState<IGetQuestionsResponse['data'][0] | null>(null) // 當前選中的題目詳細資料

  const [categories, setCategories] = useState<IGetQuestionCategoryResponse['data']>([]) // 所有題組資料
  const [questions, setQuestions] = useState<IGetQuestionsResponse['data']>([]) // 所有題目資料

  const typeMap = {
    inputOutput: '輸入輸出',
    conditionalJudgement: '條件判斷',
    loopApplication: '迴圈應用',
    arrayApplication: '串列應用',
    functionApplication: '函數應用',
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        Swal.fire({
          title: '載入中...',
          html: '正在取得資料',
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => {
            Swal.showLoading()
          },
        })
        const [categoriesData, questionsData] = await Promise.all([getQuestionCategory(), getQuestions()])

        if (!categoriesData.success || !questionsData.success) {
          Swal.fire({
            title: '取得資料失敗',
            icon: 'error',
          })
          return
        }

        setCategories(categoriesData.data || [])
        setQuestions(questionsData.data || [])

        Swal.close()
      } catch (error) {
        Swal.fire({
          title: '取得資料失敗',
          text: (error as any).message,
          icon: 'error',
        })
      }
    }

    fetchData()
  }, [])

  // 根據分類篩選題目
  const filteredQuestions = React.useMemo(() => {
    const allQuestions = questions

    if (selectedType === 'all') {
      return allQuestions
    }

    // 有選擇類型時才進行過濾
    return allQuestions!.filter((q) => q.questionType === selectedType)
  }, [questions, selectedType])

  // 新增題目到已選列表
  const handleSelectQuestion = (question: IGetQuestionsResponse['data'][0]) => {
    if (question && selectedQuestions && !selectedQuestions.find((q) => q.questionId === question.questionId)) {
      setSelectedQuestions([...selectedQuestions, question])
    }
  }

  // 從已選列表移除題目
  const handleRemoveQuestion = (question: IGetQuestionsResponse['data'][0]) => {
    if (selectedQuestions) {
      setSelectedQuestions(selectedQuestions.filter((q) => q.questionId !== question.questionId))
    }
  }

  // 顯示題目詳細資訊
  const handleShowDetails = (question: IGetQuestionsResponse['data'][0]) => {
    setCurrentQuestion(question)
    setShowModal(true)
    console.log(question)
  }

  // 提交選擇
  const handleSubmit = async () => {
    if (!selectedCategory) {
      Swal.fire({
        title: '請選擇一個題組！',
        icon: 'warning',
      })
      return
    }
    if (!selectedQuestions || selectedQuestions.length === 0) {
      Swal.fire({
        title: '請選擇至少一個題目！',
        icon: 'warning',
      })
      return
    }

    const questionIds = selectedQuestions.map((q) => q.questionId)

    try {
      Swal.fire({
        title: '提交中...',
        html: '正在更新題組',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      const response = await UpdateCategoryQuestions(selectedCategory.categoryId, questionIds)

      if (response.success) {
        Swal.fire({
          title: '成功！',
          text: `已將 ${selectedQuestions.length} 個題目新增到題組 ${selectedCategory.categoryTitle}`,
          icon: 'success',
        })
      } else {
        Swal.fire({
          title: '更新失敗',
          text: response.message || '未知錯誤',
          icon: 'error',
        })
      }
    } catch (error) {
      Swal.fire({
        title: '提交失敗',
        text: error instanceof Error ? error.message : '未知錯誤',
        icon: 'error',
      })
    }
  }

  return (
    <>
      <Container fluid className="bg-white rounded-5 p-3 mt-5 mb-5" style={{ width: '80vw' }}>
        <h3 className="mb-4">管理題組</h3>
        <Row>
          {/* 左側：選擇題組 */}
          <Col md={4} className="border-end">
            <h5>選擇題組</h5>
            <Form.Select
              className="mb-4"
              onChange={(e) => {
                const { categoryId, categoryTitle } = JSON.parse(e.target.value)
                setSelectedCategory({ categoryId, categoryTitle }) // 更新選擇的題組
                const selectedCategoryData = categories?.find((category) => category.categoryId === categoryId)
                setSelectedQuestions(selectedCategoryData ? selectedCategoryData.questions : [])
              }}
            >
              <option value="" hidden>
                請選擇分類
              </option>
              {categories &&
                categories.map((category) => (
                  <option
                    key={category.categoryId}
                    value={JSON.stringify({ categoryId: category.categoryId, categoryTitle: category.categoryTitle })}
                  >
                    {category.categoryTitle}
                  </option>
                ))}
            </Form.Select>

            <h5>已選題目</h5>
            <ListGroup>
              {selectedQuestions && selectedQuestions.length > 0 ? (
                selectedQuestions.map((question) => (
                  <ListGroup.Item
                    key={question.questionId}
                    className="d-flex justify-content-between align-items-center"
                  >
                    {question.questionTitle}
                    <Button variant="danger" size="sm" onClick={() => handleRemoveQuestion(question)}>
                      移除
                    </Button>
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item>暫無題目資料</ListGroup.Item>
              )}
            </ListGroup>
          </Col>

          {/* 右側：題目列表 */}
          <Col md={8}>
            <h5>選擇分類</h5>
            <Form.Select className="mb-4" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
              <option value="all">請選擇分類</option>
              <option value="inputOutput">1 輸入輸出</option>
              <option value="conditionalJudgement">2 條件判斷</option>
              <option value="loopApplication">3 迴圈應用</option>
              <option value="arrayApplication">4 串列應用</option>
              <option value="functionApplication">5 函數應用</option>
            </Form.Select>

            <h5>可選題目</h5>
            <ListGroup>
              {filteredQuestions && filteredQuestions.length > 0 ? (
                filteredQuestions.map((question) => (
                  <ListGroup.Item
                    key={question.questionId}
                    className="d-flex justify-content-between align-items-center"
                  >
                    {/* 左側：標題，固定寬度 */}
                    <div className="text-start" style={{ width: '40%' }}>
                      <strong>{question.questionTitle}</strong>
                    </div>

                    {/* 中間：類型，固定寬度，確保置中 */}
                    <div className="text-center" style={{ width: '30%' }}>
                      <span className="text-muted">{typeMap[question.questionType] || question.questionType}</span>
                    </div>

                    {/* 右側：按鈕區塊 */}
                    <div className="text-end" style={{ width: '30%' }}>
                      <Button variant="info" size="sm" className="me-2" onClick={() => handleShowDetails(question)}>
                        <Search strokeWidth={4} color="white" />
                      </Button>
                      <Button variant="primary" size="sm" onClick={() => handleSelectQuestion(question)}>
                        <Plus strokeWidth={4} />
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item>暫無題目資料</ListGroup.Item>
              )}
            </ListGroup>

            <div className="mt-4">
              <Button variant="success" onClick={handleSubmit}>
                確認修改
              </Button>
            </div>
          </Col>
        </Row>

        {/* 題目詳細資訊 Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>題目詳細資訊</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {currentQuestion && (
              <>
                <h5>題目：{currentQuestion.questionTitle}</h5>
                <p>類型：{currentQuestion.questionType}</p>
                <p>詳細內容：{currentQuestion.questionDescription}</p>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              關閉
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  )
}
