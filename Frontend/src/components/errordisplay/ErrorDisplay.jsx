import React from "react";
import toast, { Toaster } from "react-hot-toast";

// Utility function to show a toast
export const makeToast = (type, message) => {
  if (toast[type]) {
    toast[type](message);
  } else {
    toast(message);
  }
};

// Component to render the Toaster (should be included once in your app, e.g., in App.jsx)
export const ErrorToaster = () => <Toaster   position="bottom-right"
  reverseOrder={false}
 />;
