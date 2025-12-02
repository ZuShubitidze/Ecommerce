import { auth } from "@/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { useNavigate } from "react-router";
import RegisterForm from "@/components/register-form";

const Register = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Attempt to create user with email and password
    createUserWithEmailAndPassword(auth, email, password)
      // Successful registration
      .then(() => {
        navigate("/");
      })
      // Failure
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
      });
  };

  return (
    <RegisterForm
      onSubmit={onSubmit}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
    />
  );
};

export default Register;
