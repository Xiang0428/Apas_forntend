import axios, { AxiosInstance } from 'axios'

import {
  ICreateQuestionRequest,
  IFlowchartResponse,
  IGetCategoryResponse,
  IGetQuestionCategoryResponse,
  IGetQuestionsResponse,
  IsubmitCategoryResponse,
  IsubmitDataResponse,
} from '../model/IQuestion'
import { ICodeExecutionRequest, ICodeExecutionResponse } from '../model/ICodeExecution'
import { IloginRequest, IloginResponse, IregisterRequest, IregisterResponse } from '../model/Iuser'

const apiClient: AxiosInstance = axios.create({
  // baseURL: 'https://localhost:44305', // 後端 API 主機地址
  baseURL: 'http://140.130.33.140:80', // 後端 API 主機地址
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwtToken')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401) {
      // 提示使用者 Token 已過期
      alert('您的登入狀態已過期，請重新登入！')
      localStorage.removeItem('jwtToken')
      // 導向登入頁面
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

/*
Get
*/

// Get請求題組API
export const getQuestionCategory = async (): Promise<IGetCategoryResponse> => {
  const response = await apiClient.get('/api/Questions/getQuestionCategory')
  return response.data
}
// Get請求題目API
export const getQuestions = async (): Promise<IGetQuestionsResponse> => {
  const response = await apiClient.get('/api/Questions')
  return response.data
}

// Get請求題組API
export const getCategory = async (): Promise<IGetCategoryResponse> => {
  const response = await apiClient.get('/api/Questions/getCategory')
  return response.data
}

// Get請求題組API
export const getQuestionCategoryByID = async (id: number): Promise<IGetQuestionCategoryResponse> => {
  const response = await apiClient.get(`/api/Questions/${id}/getQuestionCategory`)
  return response.data
}

// 獲取流程圖提示 API
export const getFlowchartHint = async (questionId: number): Promise<IFlowchartResponse> => {
  const response = await apiClient.get<IFlowchartResponse>(`/api/FlowchartExecution/getFlowchartHint/${questionId}`)
  return response.data
}

/*
Post
*/
//執行測試程式碼API
export const submitCode = async (requestData: ICodeExecutionRequest): Promise<ICodeExecutionResponse> => {
  const response = await apiClient.post<ICodeExecutionResponse>('/api/CodeExecution/execute', requestData)
  return response.data
}

// 繳卷批改API
export const submitAssignment = async (questionId: string, code: string) => {
  const response = await apiClient.post(`/api/CodeExecution/submitAssiginment/${questionId}`, { code })
  return response.data
}

// 生成流程圖語法API
export const generateFlowchart = async (code: string): Promise<IFlowchartResponse> => {
  const response = await apiClient.post<IFlowchartResponse>('/api/FlowchartExecution/generateFlowChart', { code })
  return response.data
}
// 提交新增題目資料API
export const submitCreateQuestionData = async (data: ICreateQuestionRequest): Promise<IsubmitDataResponse> => {
  const response = await apiClient.post<IsubmitDataResponse>('/api/Questions/createQuestion', data)
  return response.data
}
// 提交新增題組API
export const submitCreateQuestionCategory = async (data: {
  CategoryTitle: string
}): Promise<IsubmitCategoryResponse> => {
  const response = await apiClient.post('/api/Questions/createQuestionCategory', data)
  return response.data
}

// 提交新增題組API
export const UpdateCategoryQuestions = async (
  categoryId: number,
  data: Array<number>
): Promise<IGetCategoryResponse> => {
  const response = await apiClient.post(`/api/Questions/categories/${categoryId}/update-questions`, data)
  return response.data
}

//User API
export const LoginApi = async (data: IloginRequest): Promise<IloginResponse> => {
  const response = await apiClient.post('/api/Auth/Login', data)
  return response.data
}
export const RegisterApi = async (data: IregisterRequest): Promise<IregisterResponse> => {
  const response = await apiClient.post('/api/Auth/Register', data)
  return response.data
}

export default apiClient
