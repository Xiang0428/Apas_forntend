import React, { useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import flowchart from "flowchart.js";
import * as d3 from "d3";
import Swal from "sweetalert2";

interface Props {
  show: boolean;
  handleClose: () => void;
  flowchartSyntax: string;
  isHintMode?: boolean; // 是否為提示模式
}

const FlowchartPreviewModal: React.FC<Props> = ({ show, handleClose, flowchartSyntax, isHintMode = false }) => {
  // 在 Modal 開啟時渲染流程圖
  useEffect(() => {
    try {
      if (show && flowchartSyntax.length !== 0) {
        const diagramContainer = document.getElementById("diagram-container");

        if (diagramContainer) {
          // 清空之前的內容
          diagramContainer.innerHTML = "";

          // 使用 flowchart.js 解析並繪製流程圖
          const chart = flowchart.parse(flowchartSyntax);
          chart.drawSVG("diagram-container");

          // 獲取生成的 SVG 元素
          const svg = diagramContainer.querySelector("svg");

          if (svg) {
            // 創建 <g> 元素，將所有子節點包裝起來
            const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
            while (svg.childNodes.length > 0) {
              g.appendChild(svg.childNodes[0]);
            }
            svg.appendChild(g);

            // 確保 SVG 容器填滿可視區域
            svg.style.width = "100%";
            svg.style.height = "100%";
            svg.style.display = "block";

            // 獲取 <g> 的邊界框
            const bbox = g.getBBox();

            // 取得容器的實際尺寸
            const containerWidth = diagramContainer.clientWidth || 500;
            const containerHeight = diagramContainer.clientHeight || 500;

            // 計算適合的縮放比例（確保流程圖完整顯示）
            const scaleX = containerWidth / bbox.width;
            const scaleY = containerHeight / bbox.height;
            const scale = Math.min(scaleX, scaleY) * 0.9; // 預留 10% 邊距

            // 計算置中偏移量
            const translateX = (containerWidth - bbox.width * scale) / 2 - bbox.x * scale;
            const translateY = (containerHeight - bbox.height * scale) / 2 - bbox.y * scale;

            // 設定 viewBox 讓 SVG 可以適應
            svg.setAttribute("viewBox", `0 0 ${containerWidth} ${containerHeight}`);
            svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

            // 設定縮放與位移
            const initialTransform = d3.zoomIdentity.translate(translateX, translateY).scale(scale);

            // 使用 d3 進行縮放與拖曳
            const zoom = d3
              .zoom()
              .scaleExtent([0.5, 5])
              .on("zoom", (event) => {
                g.setAttribute("transform", event.transform.toString());
              });

            d3.select(svg).call(zoom as any);
            d3.select(svg).call(zoom.transform as any, initialTransform);

            // 設定初始縮放
            g.setAttribute("transform", initialTransform.toString());
          }
        }
      }
    } catch (error) {
      console.error("生成失敗:", error);
      Swal.fire({
        title: "生成失敗",
        text: "請檢查程式碼是否正確",
        icon: "error",
      });
    }
  }, [show, flowchartSyntax]);

  return (
    <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false} size="lg" id="Modal">
      <Modal.Header closeButton>
        <Modal.Title>{isHintMode ? "流程圖提示" : "流程圖預覽"}</Modal.Title>
      </Modal.Header>
      <Modal.Body
        id="diagram-container"
        style={
          isHintMode
            ? {
                backgroundColor: "#f0f8ff", // 提示模式下使用淺藍色背景
                border: "2px solid #ccc",
                borderRadius: "5px",
                minHeight: "500px",
              }
            : {}
        }
      ></Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FlowchartPreviewModal;
