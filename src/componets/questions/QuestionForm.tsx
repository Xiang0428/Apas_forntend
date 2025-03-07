import React from "react";
import { Row, Col, Form } from "react-bootstrap";
import { IQusetionInfoRequest } from "../../model/IQuestion";

interface Props {
  questionInfo: IQusetionInfoRequest;
  onInputChange: (key: string, value: string) => void;
}

const QuestionForm: React.FC<Props> = ({ questionInfo, onInputChange }) => (
  <>
    <Row className="mb-3">
      {/*題目類型欄位*/}

      <Col>
        <Form.Group controlId="questionType">
          <Form.Label>題目類型</Form.Label>
          <Form.Select className="w-100" value={questionInfo.QuestionType} onChange={(e) => onInputChange("QuestionType", e.target.value)} required>
            <option value="" disabled>
              請選擇題目類型
            </option>
            <option value="inputOutput">1 輸入輸出</option>
            <option value="conditionalJudgement">2 條件判斷</option>
            <option value="loopApplication">3 迴圈應用</option>
            <option value="arrayApplication">4 串列應用</option>
            <option value="functionApplication">5 函數應用</option>
          </Form.Select>
        </Form.Group>
      </Col>

      {/*題目難度欄位*/}
      <Col>
        <Form.Group className="mb-3">
          <Form.Label>題目難度</Form.Label>
          <Form.Select value={questionInfo.QuestionDifficulty} onChange={(e) => onInputChange("QuestionDifficulty", e.target.value)} required>
            <option>選擇難度</option>
            <option value="1">簡單</option>
            <option value="2">中等</option>
            <option value="3">困難</option>
          </Form.Select>
        </Form.Group>
      </Col>
    </Row>

    {/*標題名稱欄位*/}
    <Form.Group className="mb-3">
      <Form.Label>標題名稱</Form.Label>
      <Form.Control type="text" placeholder="輸入標題名稱" value={questionInfo.QuestionTitle} onChange={(e) => onInputChange("QuestionTitle", e.target.value)} required />
    </Form.Group>

    {/* 問題描述欄位 */}
    <Form.Group className="mb-3">
      <Form.Label>問題描述</Form.Label>
      <Form.Control as="textarea" rows={5} placeholder="輸入問題描述" value={questionInfo.QuestionDescription} onChange={(e) => onInputChange("QuestionDescription", e.target.value)} required />
    </Form.Group>
  </>
);

export default QuestionForm;
