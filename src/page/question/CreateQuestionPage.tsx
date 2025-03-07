import { useState } from 'react'
import { Container, Row, Col, Button, Form } from 'react-bootstrap'

import { Send, Eye, CirclePlay } from 'lucide-react'
import Swal from 'sweetalert2'
import { generateFlowchart, submitCode, submitCreateQuestionData } from '../../api/apiService'

import CodeEditor from '../../componets/questions/CodeEditor'
import FlowchartPreviewModal from '../../componets/questions/FlowchartPreviewModal'
import QuestionForm from '../../componets/questions/QuestionForm'
import TestInputAndOutput from '../../componets/questions/TestInputAndOutput'

import { ICreateQuestionRequest, IQusetionInfoRequest } from '../../model/IQuestion'
import { ICodeExecutionRequest } from '../../model/ICodeExecution'

const CreateQuestionsPage = () => {
  // 控制 Modal 顯示狀態
  const [showModal, setShowModal] = useState(false)

  // Loading 狀態
  const [loading, setLoading] = useState(false)

  // 儲存 API 回傳的結果
  const [output, setOutput] = useState<string[]>([])

  // 題目相關資訊
  const [questionInfo, setQuestionInfo] = useState<IQusetionInfoRequest>({
    QuestionType: '',
    QuestionTitle: '',
    QuestionDescription: '',
    QuestionDifficulty: 0,
  })

  // 程式碼與測試輸入值
  const [codeData, setCodeData] = useState<ICodeExecutionRequest>({
    code: '',
    inputTest: { test1: '', test2: '', test3: '', test4: '' },
  })
  //流程圖語法state
  const [flowchartSyntax, setFlowchartSyntax] = useState<string>('')

  // 預覽流程圖
  const handlePreviewFlowchart = async () => {
    try {
      console.log(codeData.code)
      if (codeData.code == '')
        return Swal.fire({
          title: '請先輸入程式碼',
          icon: 'error',
        })

      setFlowchartSyntax('') // 清空之前的結果

      // 呼叫 API
      const result = await generateFlowchart(codeData.code)
      console.log(result)
      setFlowchartSyntax(result.flowchartSyntax)

      setShowModal(true)

      console.log(flowchartSyntax)
    } catch (error) {
      console.error('生成失敗:', error)
      Swal.fire({
        title: '生成失敗',
        text: '請檢查程式碼是否正確',
        icon: 'error',
      })
    }
  }

  // 更新題目資訊
  const handleQuestionInfoChange = (key: string, value: string) => {
    setQuestionInfo((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  // 更新程式碼或測試值
  const handleCodeInputChange = (key: string, value: string) => {
    setCodeData((prev) => {
      if (key === 'code') {
        return { ...prev, code: value }
      }
      return {
        ...prev,
        inputTest: { ...prev.inputTest, [key]: value },
      }
    })
  }

  // 執行程式碼的函式
  const handleRunCode = async () => {
    const { code, inputTest } = codeData

    if (!code || !inputTest.test1 || !inputTest.test2 || !inputTest.test3 || !inputTest.test4) {
      Swal.fire({ title: '請填寫所有欄位', icon: 'error' })
      return
    }
    console.log(codeData)
    try {
      setLoading(true)
      setOutput([]) // 清空結果
      const result = await submitCode({ code, inputTest })
      console.log(result)
      setOutput(Array.isArray(result.output) ? result.output : [result.output])
    } catch (error) {
      Swal.fire({ title: '執行失敗', icon: 'error' })
    } finally {
      setLoading(false)
    }
  }

  //新增題目
  const handleSummit = async () => {
    const inputTestValues = Object.values(codeData.inputTest)

    // 將 output 與 inputTestValues 依照索引組合
    const testCases = output.map((expectedOutput: any, index: any) => ({
      inputValue: inputTestValues[index],
      expectedOutput: expectedOutput,
    }))

    const submitData = {
      QuestionType: questionInfo.QuestionType,
      QuestionTitle: questionInfo.QuestionTitle,
      QuestionDescription: questionInfo.QuestionDescription,
      QuestionDifficulty: questionInfo.QuestionDifficulty,
      SampleCode: codeData.code,
      FlowchartSyntax: flowchartSyntax,
      testCases: testCases,
    }

    if (!isRequestValid(submitData)) {
      Swal.fire({
        title: '資料不完整',
        text: '請填寫所有必填欄位',
        icon: 'error',
      })
      return
    }
    if (!flowchartSyntax) {
      Swal.fire({
        title: '請先預覽流程圖',
        icon: 'error',
      })
      return
    }

    try {
      Swal.fire({
        title: 'Loading...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      console.log(submitData)
      const result = await submitCreateQuestionData(submitData)

      Swal.close()

      if (result.success) {
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer
            toast.onmouseleave = Swal.resumeTimer
          },
        })
        Toast.fire({
          icon: 'success',
          title: 'Signed in successfully',
        })
      } else {
        Swal.fire({
          title: '新增失敗',
          text: result.message || '未知錯誤',
          icon: 'warning',
        })
      }
      console.log(result)
    } catch (error) {
      console.error('新增失敗:', error)
      Swal.fire({
        title: '新增失敗',
        text: String(error),
        icon: 'error',
      })
    }
  }

  // 檢查資料完整性
  const isRequestValid = (data: ICreateQuestionRequest): boolean => {
    // 檢查主屬性是否有空值
    const { QuestionType, QuestionTitle, QuestionDescription, SampleCode, testCases } = data
    if (!QuestionType || !QuestionTitle || !QuestionDescription || !SampleCode || data.QuestionDifficulty === 0) {
      return false
    }

    // 檢查 TestCases 的每個物件是否有空值
    for (const testCase of testCases) {
      if (!testCase.inputValue || !testCase.expectedOutput) {
        return false
      }
    }

    return true
  }

  return (
    <>
      <Container fluid className="bg-white rounded-5 p-3 mt-5 mb-5" style={{ width: '60vw' }}>
        <Row className="justify-content-center">
          <Col md={8} lg={10}>
            <h1 className="text-center mb-4">新增題目</h1>
            <Form>
              {/* 題目資訊輸入 */}
              <QuestionForm questionInfo={questionInfo} onInputChange={handleQuestionInfoChange} />

              {/* 程式碼編輯與執行按鈕 */}
              <Button
                onClick={handleRunCode}
                className="mb-3"
                disabled={loading}
                style={{ backgroundColor: '#003D79' }}
              >
                <CirclePlay size={20} />
                {loading ? '執行中...' : 'Run Code'}
              </Button>
              <CodeEditor
                code={codeData.code}
                onCodeChange={(value) => handleCodeInputChange('code', value)}
                width="100%"
              />

              {/* 測試輸入與結果顯示 */}
              <Row className="mb-3">
                <Col>
                  <TestInputAndOutput
                    testValue={codeData.inputTest.test1!}
                    outputValue={output[0] || null}
                    onTestChange={(value) => handleCodeInputChange('test1', value)}
                    loading={loading}
                  />
                </Col>
                <Col>
                  <TestInputAndOutput
                    testValue={codeData.inputTest.test2!}
                    outputValue={output[1] || null}
                    onTestChange={(value) => handleCodeInputChange('test2', value)}
                    loading={loading}
                  />
                </Col>
              </Row>
              <Row className="mb-3">
                <Col>
                  <TestInputAndOutput
                    testValue={codeData.inputTest.test3!}
                    outputValue={output[2] || null}
                    onTestChange={(value) => handleCodeInputChange('test3', value)}
                    loading={loading}
                  />
                </Col>
                <Col>
                  <TestInputAndOutput
                    testValue={codeData.inputTest.test4!}
                    outputValue={output[3] || null}
                    onTestChange={(value) => handleCodeInputChange('test4', value)}
                    loading={loading}
                  />
                </Col>
              </Row>

              {/* 提交按鈕 */}
              <Row className="mb-3">
                <Col className="d-flex justify-content-center">
                  <Button
                    variant="primary"
                    className="w-20 mx-2"
                    style={{ backgroundColor: '#003D79' }}
                    onClick={() => handleSummit()}
                  >
                    <Send size={18} />
                    送出
                  </Button>

                  <Button
                    className="w-20 mx-2"
                    style={{ backgroundColor: 'rgb(248, 135, 135)' }}
                    onClick={() => handlePreviewFlowchart()}
                  >
                    <Eye />
                    預覽流程圖
                  </Button>
                </Col>
              </Row>

              {/* Modal 預覽 */}
              <FlowchartPreviewModal
                show={showModal}
                handleClose={() => setShowModal(false)}
                flowchartSyntax={flowchartSyntax}
              />
            </Form>
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default CreateQuestionsPage
