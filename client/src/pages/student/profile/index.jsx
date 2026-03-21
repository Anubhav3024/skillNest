import { useContext, useState } from "react";
import { AuthContext } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  updateUserProfileService,
  changePasswordService,
  getUserPaymentHistoryService,
} from "@/services";
import { toast } from "react-toastify";
import { useEffect } from "react";

const StudentProfilePage = () => {
  const { auth, updateAuthUser } = useContext(AuthContext);
  const [profileData, setProfileData] = useState({
    userName: auth?.user?.userName || "",
    userEmail: auth?.user?.userEmail || "",
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [paymentHistory, setPaymentHistory] = useState([]);

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      if (!auth?.user?._id) return;
      try {
        const response = await getUserPaymentHistoryService(auth.user._id);
        if (response?.success) {
          setPaymentHistory(response.orders || []);
        }
      } catch (error) {
        console.error("Error loading payment history", error);
      }
    };

    fetchPaymentHistory();
  }, [auth?.user?._id]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await updateUserProfileService({
        userId: auth?.user?._id,
        ...profileData,
      });
      if (response.success) {
        toast.success(response.message);
        updateAuthUser({ ...auth.user, ...profileData });
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error updating profile", error);
      toast.error(error?.response?.data?.message || "Failed to update profile");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    try {
      const response = await changePasswordService({
        userId: auth?.user?._id,
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      if (response.success) {
        toast.success(response.message);
        setPasswordData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error changing password", error);
      toast.error(
        error?.response?.data?.message || "Failed to change password",
      );
    }
  };

  return (
    <div className="container mx-auto p-4 lg:p-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-lg border-indigo-100">
          <CardHeader>
            <CardTitle>Update Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label>Username</Label>
                <Input
                  value={profileData.userName}
                  onChange={(e) =>
                    setProfileData({ ...profileData, userName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={profileData.userEmail}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      userEmail: e.target.value,
                    })
                  }
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                Update Profile
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-indigo-100">
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label>Old Password</Label>
                <Input
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      oldPassword: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Change Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg border-indigo-100">
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {paymentHistory.length ? (
            <div className="space-y-3">
              {paymentHistory.slice(0, 6).map((item) => (
                <div
                  key={item._id}
                  className="flex justify-between text-sm border-b pb-2"
                >
                  <span className="font-medium">{item.courseTitle}</span>
                  <span>Rs {item.coursePricing}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No payments yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentProfilePage;
