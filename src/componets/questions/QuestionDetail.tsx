import { useEffect, useRef, useState } from 'react'
import { Button, Col, Container, Row } from 'react-bootstrap'
import CodeEditor from './CodeEditor'
import './QuestionDetail.css'
import { CirclePlay, FileText, GitBranch, Send } from 'lucide-react'
import { useLocation, useParams } from 'react-router-dom'
import { getFlowchartHint, submitAssignment, submitCode } from '../../api/apiService'
import Swal from 'sweetalert2'
import * as signalR from '@microsoft/signalr'
import { HttpTransportType } from '@microsoft/signalr'
import * as d3 from 'd3'
import flowchart from 'flowchart.js'
import { IQuestion } from '../../model/IQuestion'
import FlowchartPreviewModal from './FlowchartPreviewModal'

export default function QuestionDetail() {
  const { questionId } = useParams()
  const location = useLocation()

  const [currentTestCase, setCurrentTestCase] = useState(0)
  const [customInput, setCustomInput] = useState('') // 用於存儲用戶輸入的自定義測試值
  const question = location.state?.question as IQuestion // 獲取傳遞的 question 資料

  const [executionData, setExecutionData] = useState({ code: '' }) // 編輯器內容和輸入值
  const [actualOutput, setActualOutput] = useState('') // 用於存儲執行結果
  const [currentTab, setCurrentTab] = useState('question') // 控制左側面板的分頁

  const [connection, setConnection] = useState<signalR.HubConnection | null>(null) // SignalR 相關狀態
  const [flowchartData, setFlowchartData] = useState(null) //流程圖生成的語法
  const lastCodeRef = useRef('') // 用來儲存最後一次發送的程式碼
  const timerRef = useRef<NodeJS.Timeout | null>(null) // 用來儲存計時器

  // 流程圖提示相關狀態
  const [showHintModal, setShowHintModal] = useState(false)
  const [hintFlowchartSyntax, setHintFlowchartSyntax] = useState('')
  const [isLoadingHint, setIsLoadingHint] = useState(false)

  if (!question) {
    return (
      <>
        <Container fluid className="bg-white rounded-5  mt-5 mb-5 p-2" style={{ width: '90vw' }}>
          <div className="text-center mt-5">未找到相關的題目資料</div>
        </Container>
      </>
    )
  }

  // 初始化 SignalR 連接
  useEffect(() => {
    // 建立連接
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:44305/flowcharthub', {
        transport: HttpTransportType.WebSockets, // 強制使用 WebSocket
      })
      .withAutomaticReconnect()
      .build()

    // 註冊接收流程圖的處理函數
    newConnection.on('ReceiveFlowchart', (data) => {
      console.log(data)
      setFlowchartData(data)
    })

    // 啟動連接
    newConnection
      .start()
      .then(() => {
        console.log('Connected to flowchart hub')
        setConnection(newConnection)
      })
      .catch((err) => console.error('Error while connecting:', err))

    // 清理函數
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (newConnection) {
        newConnection.stop()
      }
    }
  }, [])

  // 設定定時發送程式碼的機制
  useEffect(() => {
    if (connection && currentTab === 'flowchart') {
      // 啟動計時器
      timerRef.current = setInterval(async () => {
        const currentCode = executionData.code
        console.log('Current code:', currentCode)
        // 只有當程式碼有變化時才發送
        if (currentCode !== lastCodeRef.current) {
          try {
            await connection.invoke('GenerateFlowchart', currentCode)
            lastCodeRef.current = currentCode // 更新最後發送的程式碼
          } catch (err) {
            console.error('Error sending code:', err)
          }
        }
      }, 2000) // 每2秒檢查並發送一次

      // 清理函數
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
      }
    }
  }, [connection, currentTab, executionData.code])

  // 渲染流程圖
  useEffect(() => {
    try {
      if (flowchartData) {
        const diagramContainer = document.getElementById('f-diagram-container')

        if (diagramContainer) {
          // 清空之前的內容
          diagramContainer.innerHTML = ''

          // 使用 flowchart.js 解析並繪製流程圖
          const chart = flowchart.parse(flowchartData)
          chart.drawSVG('f-diagram-container')

          // 獲取生成的 SVG 元素
          const svg = diagramContainer.querySelector('svg')
          if (svg) {
            // 創建 <g> 元素，將所有子節點包裝起來
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
            while (svg.childNodes.length > 0) {
              g.appendChild(svg.childNodes[0])
            }
            svg.appendChild(g)

            // 確保 SVG 容器填滿可視區域
            svg.style.width = '100%'
            svg.style.height = '100%'
            svg.style.display = 'block'

            // 獲取 <g> 的邊界框
            const bbox = g.getBBox()

            // 取得容器的實際尺寸
            const containerWidth = diagramContainer.clientWidth || 500
            const containerHeight = diagramContainer.clientHeight || 500

            // 計算適合的縮放比例（確保流程圖完整顯示）
            const scaleX = containerWidth / bbox.width
            const scaleY = containerHeight / bbox.height
            const scale = Math.min(scaleX, scaleY) * 0.9 // 預留 10% 邊距

            // 計算置中偏移量
            const translateX = (containerWidth - bbox.width * scale) / 2 - bbox.x * scale
            const translateY = (containerHeight - bbox.height * scale) / 2 - bbox.y * scale

            // 設定 viewBox 讓 SVG 可以適應
            svg.setAttribute('viewBox', `0 0 ${containerWidth} ${containerHeight}`)
            svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')

            // 設定縮放與位移
            const initialTransform = d3.zoomIdentity.translate(translateX, translateY).scale(scale)

            // 使用 d3 進行縮放與拖曳
            const zoom = d3
              .zoom()
              .scaleExtent([0.5, 5])
              .on('zoom', (event) => {
                g.setAttribute('transform', event.transform.toString())
              })

            d3.select(svg).call(zoom as any)
            d3.select(svg).call(zoom.transform as any, initialTransform)

            // 設定初始縮放
            g.setAttribute('transform', initialTransform.toString())
          }
        }
      }
    } catch (error) {
      const diagramContainer = document.getElementById('f-diagram-container')
      if (diagramContainer) {
        diagramContainer.innerHTML = '' // 清空之前的內容

        // 顯示錯誤訊息給使用者
        const errorMessage = document.createElement('p')
        errorMessage.textContent = '無法渲染流程圖，請檢查程式碼是否正確。'
        errorMessage.style.color = 'red'
        diagramContainer.appendChild(errorMessage)
      }
      console.error('流程圖渲染錯誤:', error)
    }
  }, [flowchartData, currentTab])

  // 處理分頁切換
  const handleTabChange = (tab: string) => {
    setCurrentTab(tab)
  }

  // 渲染題目資訊的內容
  const renderQuestionInfo = () => (
    <div>
      <div className="mb-5">
        <h3 className="">
          <strong>{question.questionTitle}</strong>
        </h3>
      </div>

      <div style={{ minHeight: '40vh' }}>
        <strong className="fs-4">題目敘述:</strong>
        <p className="mt-3 fs-5">{question.questionDescription}</p>
      </div>

      <div className="rounded">
        <div className="mb-4">
          <div className="d-flex justify-content-start mb-2">
            {question.testCases.slice(0, 3).map((_: any, index: number) => (
              <div
                key={index}
                className={`test-case-card ${currentTestCase === index ? 'active' : ''}`}
                onClick={() => handleTestCaseChange(index)}
              >
                <div
                  className="card-body text-center"
                  style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}
                >
                  <strong>測試範例 {index + 1}</strong>
                </div>
              </div>
            ))}

            <div
              className={`test-case-card ${currentTestCase === question.testCases.length ? 'active' : ''}`}
              onClick={() => handleTestCaseChange(question.testCases.length)}
            >
              <div
                className="card-body text-center"
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}
              >
                <strong>自訂測試</strong>
              </div>
            </div>
          </div>
          <strong className="fs-5 d-block mb-1" style={{ marginTop: '5px' }}>
            預期輸入:
          </strong>
          <div
            style={{
              backgroundColor: '#F9FAFB',
              padding: '10px',
              height: '15vh',
              border: '1px solid #DDD',
              borderRadius: '5px',
              overflowY: 'auto',
            }}
          >
            {currentTestCase === question.testCases.length ? (
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Enter your custom input here"
                style={{ width: '100%', height: '100%', border: 'none', outline: 'none', resize: 'none' }}
              />
            ) : (
              <pre>{question.testCases[currentTestCase]?.inputValue || ''}</pre>
            )}
          </div>
        </div>
        {currentTestCase !== question.testCases.length && (
          <div className="mb-4">
            <strong className="fs-5 d-block mb-2">預期輸出:</strong>
            <textarea
              value={question.testCases[currentTestCase]?.expectedOutput || ''}
              style={{
                backgroundColor: '#F9FAFB',
                padding: '10px',
                height: '15vh',
                width: '100%',
                border: '1px solid #DDD',
                borderRadius: '5px',
                overflowY: 'auto',
              }}
              readOnly
            />
          </div>
        )}
      </div>
    </div>
  )

  // 渲染流程圖的內容
  const renderFlowchart = () => (
    <div>
      <div className="mb-5">
        <h3 className="">
          <strong>程式碼流程圖視覺化</strong>
        </h3>
      </div>
      <div style={{ minHeight: '40vh' }}>
        {!connection ? (
          <p>正在連接到伺服器...</p>
        ) : !flowchartData ? (
          <div>
            <p>開始編輯程式碼，系統將每2秒自動更新流程圖</p>
            {executionData.code && <p className="text-muted">處理中...</p>}
          </div>
        ) : (
          <div
            id="f-diagram-container"
            style={{
              height: '500px',
              width: '100%',
              border: '2px solid #ccc',
              backgroundColor: '#f7f8fd',
              boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
              borderRadius: '10px',
            }}
          ></div>
        )}
      </div>
    </div>
  )

  const handleTestCaseChange = (index: number) => {
    setCurrentTestCase(index)
    setCustomInput('') // 重置自定義輸入
    setActualOutput('') // 重置執行結果
  }
  //執行程式碼
  const handleRunCode = async () => {
    if (executionData.code) {
      Swal.fire({
        title: '執行中...',

        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })
      const input =
        currentTestCase === question.testCases.length
          ? customInput
          : question.testCases[currentTestCase]?.inputValue || ''
      try {
        const response = await submitCode({
          code: executionData.code,
          inputTest: { test1: input },
          questionId: question.questionId,
        })

        if (response.success) {
          setActualOutput(response.output[0])
          Swal.close()
        } else {
          Swal.fire({
            title: '執行程式失敗',

            icon: 'error',
          })
        }
      } catch (error) {
        Swal.fire({
          title: '未知的錯誤',

          icon: 'error',
        })
      }
    } else {
      Swal.fire({
        title: '請輸入程式碼',
        icon: 'warning',
      })
    }
  }
  // 繳卷批改
  const handleSubmitAssignment = async () => {
    if (!executionData.code) {
      Swal.fire({
        title: '請輸入程式碼',
        icon: 'warning',
      })
      return
    }
    try {
      Swal.fire({
        title: '評分中...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      const response = await submitAssignment(String(question.questionId), executionData.code)
      console.log(response)
      if (response.success) {
        const passedCount = response.testResults.filter((result: { passed: boolean }) => result.passed).length
        const totalCount = response.testResults.length

        Swal.fire({
          title: `評分結果: ${passedCount}/${totalCount}`,
          text:
            passedCount === totalCount
              ? '恭喜！所有測試案例都通過了。'
              : `有 ${totalCount - passedCount} 個測試案例未通過，請檢查您的程式碼。`,
          icon: passedCount === totalCount ? 'success' : 'warning',
          confirmButtonText: '確定',
        })
      } else {
        Swal.fire({
          title: '繳卷失敗',
          text: response.message || '無法完成繳卷程序',
          icon: 'error',
        })
      }
    } catch (error) {
      console.error('提交作業時發生錯誤:', error)
      Swal.fire({
        title: '發生錯誤',
        text: '繳卷時發生未知錯誤，請稍後再試。',
        icon: 'error',
      })
    }
  }

  // 流程圖提示
  const handleGetFlowchartHint = async () => {
    if (!question || !question.questionId) {
      Swal.fire({
        title: '無法獲取提示',
        text: '題目資訊不完整',
        icon: 'error',
      })
      return
    }

    try {
      setIsLoadingHint(true)
      Swal.fire({
        title: '載入中...',
        text: '正在獲取流程圖提示',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      const response = await getFlowchartHint(question.questionId)

      if (response.success) {
        setHintFlowchartSyntax(response.flowchartSyntax)
        setShowHintModal(true)
        Swal.close()
      } else {
        Swal.fire({
          title: '獲取提示失敗',
          text: response.message || '未知錯誤',
          icon: 'error',
        })
      }
    } catch (error) {
      Swal.fire({
        title: '獲取提示失敗',
        text: '發生未知錯誤，請稍後再試',
        icon: 'error',
      })
    } finally {
      setIsLoadingHint(false)
    }
  }

  return (
    <>
      <Container fluid className="bg-white rounded-5  mt-5 mb-5 p-2" style={{ width: '90vw' }}>
        <Row className="row  w-100">
          {/* 左側分頁按鈕 */}
          <Col md={1} className="d-flex flex-column align-items-center pt-5">
            <Button
              variant="light"
              className={`custom-tab-btn ${currentTab === 'question' ? 'active' : ''}`}
              onClick={() => handleTabChange('question')}
            >
              <FileText size={24} />
              <span className="tab-text">題目</span>
            </Button>
            <Button
              variant="light"
              className={`custom-tab-btn ${currentTab === 'flowchart' ? 'active' : ''}`}
              onClick={() => handleTabChange('flowchart')}
            >
              <GitBranch size={24} />
              <span className="tab-text">流程圖</span>
            </Button>
          </Col>

          {/* 左側內容區域 - 根據分頁切換顯示不同內容 */}
          <Col md={5} className="border-end mt-5 ms-3 p-3">
            {currentTab === 'question' ? renderQuestionInfo() : renderFlowchart()}
          </Col>

          <Col className=" mt-5 w-80">
            <div>
              {/* 程式碼編輯器區域 */}
              <div className=" mb-3">
                <h5>
                  <strong>程式編輯區 </strong>
                </h5>

                <CodeEditor
                  height="40vh"
                  width="100%"
                  code={executionData.code}
                  onCodeChange={(newCode) => setExecutionData((prev) => ({ ...prev, code: newCode }))}
                />
              </div>
              <div>
                {/* 程式碼編輯與執行按鈕 */}
                <Button className="mb-3" style={{ backgroundColor: '#003D79' }} onClick={handleRunCode}>
                  <CirclePlay size={20} />
                  Run Code
                </Button>
                {/* 繳交作業按鈕 */}
                <Button className="mb-3 ms-2" style={{ backgroundColor: '#E57200' }} onClick={handleSubmitAssignment}>
                  <Send size={20} />
                  繳卷批改
                </Button>
                {/* 流程圖提示按鈕 */}
                <Button
                  className="mb-3 ms-2"
                  style={{ backgroundColor: '#5CB85C' }}
                  onClick={handleGetFlowchartHint}
                  disabled={isLoadingHint}
                >
                  <GitBranch size={20} />
                  {isLoadingHint ? '載入中...' : '流程圖提示'}
                </Button>
              </div>
              <div style={{ marginTop: '30px' }}>
                <strong className="fs-5 d-block mb-2">實際輸出:</strong>
                <textarea
                  value={actualOutput || 'Run the code to see the output'}
                  style={{
                    backgroundColor: '#F9FAFB',
                    padding: '10px',
                    height: '15vh',

                    width: '100%',
                    border: '1px solid #DDD',
                    borderRadius: '5px',
                    overflowY: 'auto',
                  }}
                  readOnly
                />
              </div>
            </div>
          </Col>
        </Row>
        {/* 添加流程圖提示 Modal */}
        <FlowchartPreviewModal
          show={showHintModal}
          handleClose={() => setShowHintModal(false)}
          flowchartSyntax={hintFlowchartSyntax}
          isHintMode={true} // 標記這是提示模式
        />
      </Container>
    </>
  )
}
