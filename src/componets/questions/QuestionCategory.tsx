import { Button, Container, ProgressBar } from "react-bootstrap";
import { Link } from "react-router-dom";
import Header from "../Header";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { getCategory } from "../../api/apiService";
import { IGetCategoryResponse } from "../../model/IQuestion";

export default function QuestionCategory() {
  const [categories, setCategories] = useState<Array<{ categoryId: number; categoryTitle: string }>>([]);
  const now = 60;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        Swal.fire({
          title: "載入中...",
          html: "正在取得題組資料",
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const response = await getCategory();

        if (response.success) {
          setCategories(response.data || []);
        } else {
          Swal.fire({
            title: "取得資料失敗",
            text: response.message || "未知錯誤",
            icon: "error",
          });
        }

        Swal.close();
      } catch (error) {
        Swal.fire({
          title: "取得資料失敗",
          text: error instanceof Error ? error.message : "未知錯誤",
          icon: "error",
        });
      }
    };

    fetchCategories();
  }, []);

  return (
    <>
      <Container fluid style={{ maxWidth: "90vw", padding: "2rem" }}>
        <div className="row mt-5 g-4">
          {categories.map((category) => (
            <div className="col-sm-6 col-md-4 col-lg-3 rounded-3" key={category.categoryId}>
              <div
                className="card bg-white shadow-sms"
                style={{
                  height: "30vh",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                {/* 標題區域延伸全寬 */}
                <div
                  style={{
                    backgroundColor: "	#97CBFF",
                    padding: "1rem",
                    width: "100%",
                    borderTopLeftRadius: "4px",
                    borderTopRightRadius: "4px",
                  }}
                >
                  <h5
                    className="card-title text-truncate"
                    style={{
                      fontSize: "2rem",
                      color: "black",
                      margin: 0,
                      textAlign: "center",
                    }}
                  >
                    {category.categoryTitle}
                  </h5>
                </div>

                <div className=" p-3 text-center">
                  <ProgressBar now={now} label={`${now}%`} animated style={{ height: "15px", borderRadius: "4px", marginBottom: "0.5rem", width: "100%" }} />
                  <small className="d-block mb-3 " style={{ color: "red", fontSize: "1rem" }}>
                    還剩餘 <strong>5</strong> 題
                  </small>
                  <Link to={`/question-list?categoryId=${category.categoryId}`}>
                    <Button
                      className="btn btn-primary w-50 "
                      style={{
                        backgroundColor: "#97CBFF",
                        border: "none",
                        borderRadius: "8px",
                        padding: "0.6rem",
                        color: "black",
                      }}
                    >
                      進入練習
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </>
  );
}
