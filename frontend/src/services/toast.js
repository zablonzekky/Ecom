import toast from "react-hot-toast";

const baseStyle = {
  padding: "12px 16px",
  fontSize: "14px",
  fontWeight: "500",
  borderRadius: "10px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
};

export const showSuccess = (message) =>
  toast.success(message, {
    duration: 2500,
    position: "top-right",
    style: {
      ...baseStyle,
      background: "#1a3a2a",
      color: "#86efac",
      border: "1px solid #166534",
    },
    iconTheme: {
      primary: "#4ade80",
      secondary: "#09a959",
    },
  });

export const showError = (message) =>
  toast.error(message, {
    duration: 4000,
    position: "top-right",
    style: {
      ...baseStyle,
      background: "#3a1a1a",
      color: "#fca5a5",
      border: "1px solid #7f1d1d",
    },
    iconTheme: {
      primary: "#f87171",
      secondary: "#3a1a1a",
    },
  });