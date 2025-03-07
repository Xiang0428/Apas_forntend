export interface ICreateQuestionRequest {
  QuestionType: string;
  QuestionTitle: string;
  QuestionDescription: string;
  QuestionDifficulty: number;
  SampleCode: string;
  FlowchartSyntax: string;
  testCases: testCases[];
}

export interface testCases {
  inputValue: string;
  expectedOutput: string;
}

export interface IsubmitDataResponse {
  success: boolean;
  message: string;
  questionId?: number;
}
export interface IGetQuestionsResponse {
  success: boolean;
  message: string;
  data?: Array<{
    questionId: number;
    questionDescription: string;
    questionDifficulty: number;
    questionTitle: string;
    questionType: string;
  }>;
}

export interface IsubmitCategoryResponse {
  success: boolean;
  message: string;
  questionId?: number;
}

export interface IQuestion {
  questionId: number;
  questionDescription: string;
  questionDifficulty: number;
  questionTitle: string;
  questionType: string;
  sampleCode: string;
  flowchartSyntax: string;
  testCases: testCases[];
}

export interface IGetQuestionCategoryResponse {
  success: boolean;
  message: string;
  data?: {
    categoryId: number;
    categoryTitle: string;
    questions?: IQuestion[];
  };
}
export interface IGetCategoryResponse {
  success: boolean;
  message: string;
  data: Array<{
    categoryId: number;
    categoryTitle: string;
  }>;
}

export interface IQusetionInfoRequest {
  QuestionType: string;
  QuestionDifficulty: number;
  QuestionTitle: string;
  QuestionDescription: string;
}

export interface IFlowchartResponse {
  success: boolean;
  flowchartSyntax: string;
  message?: string;
}
