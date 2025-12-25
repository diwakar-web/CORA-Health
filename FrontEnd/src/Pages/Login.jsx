import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import Header from "../Components/Header"
import Footer from "../Components/Footer"

export default function Login() {
  const navigate = useNavigate();

  const handleCredentialResponse = (response) => {
    const token = response.credential;

    localStorage.setItem("idToken", token);

    window.dispatchEvent(new Event("storage"));

    navigate("/my-account");
  };

  useEffect(() => {
    /* global google */
    google.accounts.id.initialize({
      client_id:
        "579937806128-qavjvucck5fp9tn33mmfrecvnplnvu4f.apps.googleusercontent.com",
      callback: handleCredentialResponse,
    });

    google.accounts.id.renderButton(document.getElementById("googleBtn"), {
      theme: "outline",
      size: "large",
      width: 300,
    });

    google.accounts.id.prompt();
  }, []);

  return (
    <>
    <Header/>
    <div className="login-page">
      <div className="login-card">

        <div className="brand">CORA Health</div>
        <div className="brand-sub">Sign in to continue</div>

        {/* GOOGLE BUTTON */}
        <div
          id="googleBtn"
          style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}
        ></div>

        <div className="fine-print">
          By continuing, you agree to our Terms and Privacy Policy.
        </div>
      </div>
    </div>
    <Footer/>
    </>
  );
}
