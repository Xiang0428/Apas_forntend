import { createBrowserRouter } from 'react-router-dom'

import App from '../App'

import QuestionCategory from '../componets/questions/QuestionCategory'
import QuestionList from '../componets/questions/QuestionList'
import CreateQuestionPage from '../page/question/CreateQuestionPage'
import QuestionDetail from '../componets/questions/QuestionDetail'
import CreateCategoryPage from '../page/question/CreateCategoryPage'
import AssignQuestionsPage from '../page/question/AssignQuestionsPage'
import Login from '../componets/auth/Login'
import ProtectedRoute from './ProtectedRoute'

const router = createBrowserRouter([
  {
    path: '/Apas_forntend/',
    element: <App />,
    children: [
      { path: 'login', element: <Login /> }, // 登入頁面

      // 受保護的頁面（需登入）
      {
        element: <ProtectedRoute />, // 這邊檢查 JWT
        children: [
          {
            path: 'questions-category',
            element: <QuestionCategory />,
          },
          {
            path: 'question-list',
            element: <QuestionList />,
          },
          {
            path: 'create-questions',
            element: <CreateQuestionPage />,
          },
          {
            path: 'question-detail',
            element: <QuestionDetail />,
          },
          {
            path: 'create-questionCategory',
            element: <CreateCategoryPage />,
          },
          {
            path: 'assign-questions',
            element: <AssignQuestionsPage />,
          },
        ],
      },
    ],
  },
])

export default router
