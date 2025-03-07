export interface ICodeExecutionRequest {
  code: string;
  inputTest: {
    test1?: string;
    test2?: string;
    test3?: string;
    test4?: string;
  };
  questionId?: number;
}

// 定義 API 回傳類型
export interface ICodeExecutionResponse {
  success: boolean;
  output: string;
}
