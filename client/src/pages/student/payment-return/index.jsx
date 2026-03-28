import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";

const PaypalPaymentReturnPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Legacy route kept for older payment provider redirects.
    // Razorpay uses an in-app handler flow (no redirect required).
    const params = new URLSearchParams(location.search);
    const error = params.get("error");
    const reason = params.get("reason");

    if (error || reason) {
      toast.error(reason || "Payment failed. Please try again.");
    } else {
      toast.info("Redirecting to your courses...");
    }

    const timeout = setTimeout(() => {
      navigate("/home?tab=my-courses", { replace: true });
    }, 1200);

    return () => clearTimeout(timeout);
  }, [location.search, navigate]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Finalizing payment... Please wait</CardTitle>
      </CardHeader>
    </Card>
  );
};

export default PaypalPaymentReturnPage;
