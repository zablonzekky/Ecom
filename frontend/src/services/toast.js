import toast from "react-hot-toast";

const baseStyle = {
  padding: "12px 14px",
  fontSize: "14px",
  fontWeight: "500",
  borderRadius: "8px",
};

export const showSuccess = (message) =>
  toast.success(message, {
    duration: 2500,
    position: "top-right",
    style: { ...baseStyle, background: "#05b749", color: "#ffffff" },
  });

export const showError = (message) =>
  toast.error(message, {
    duration: 4000,
    position: "top-right",
    style: { ...baseStyle, background: "#cd1919", color: "#ffffff" },
  });
