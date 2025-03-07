import React from "react";
import { Form, Spinner } from "react-bootstrap";

interface Props {
  testValue: string;
  outputValue: string | null;
  onTestChange: (value: string) => void;
  loading: boolean;
}

const TestInputAndOutput: React.FC<Props> = ({ testValue, outputValue, onTestChange, loading }) => (
  <div>
    <Form.Group className="mb-3">
      <Form.Label>測試輸入</Form.Label>
      <Form.Control as="textarea" rows={3} value={testValue} onChange={(e) => onTestChange(e.target.value)} />
    </Form.Group>
    <div style={{ backgroundColor: "#E0E0E0", padding: "10px" }}>
      {loading ? (
        <div className="d-flex justify-content-center">
          <Spinner animation="border" role="status" />
          <span className="ms-2">Loading...</span>
        </div>
      ) : (
        <div className="text-center">{outputValue || "尚無結果"}</div>
      )}
    </div>
  </div>
);

export default TestInputAndOutput;
