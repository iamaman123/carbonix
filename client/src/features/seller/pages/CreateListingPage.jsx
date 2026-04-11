import React, { useState, useEffect } from "react";
import PopupForm from "./PopupForm";
import { useNavigate } from "react-router-dom";

const CreateListingPage = () => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // If the dialog is closed, navigate back to dashboard or listings
    if (!isOpen) {
      navigate("/dashboard");
    }
  }, [isOpen, navigate]);

  return <PopupForm isOpen={isOpen} setIsOpen={setIsOpen} />;
};

export default CreateListingPage;
