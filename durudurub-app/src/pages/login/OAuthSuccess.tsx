import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../contexts/AppContext";

export default function OAuthSuccess() {

  const navigate = useNavigate();
  const { handleLogin } = useApp();

  useEffect(() => {

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    console.log("TOKEN", token);

    if (!token) return;   // ⭐ 핵심 수정

    handleLogin(
      {
        id: "social",
        email: "",
        name: "social"
      },
      token
    );

    navigate("/", { replace: true });

  }, []);

  return <div>로그인 처리 중...</div>;
}