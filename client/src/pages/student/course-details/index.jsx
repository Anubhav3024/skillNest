import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import VideoPlayer from "@/components/video-player";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import {
  checkCoursePurchaseInfoService,
  createPaymentService,
  captureAndFinalizePaymentService,
  fetchStudentViewCourseDetailsService,
  addReviewService,
  getReviewsService,
} from "@/services";
import { CheckCircle, Globe, Lock, PlayCircle, Star, Send, BarChart, ChevronRight, Award } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";

const StudentViewCourseDetailsPage = () => {
  const {
    studentViewCourseDetails,
    setStudentViewCourseDetails,
    currentCourseDetailsId,
    setCurrentCourseDetailsId,
    loadingState,
    setLoadingState,
  } = useContext(StudentContext);

  const { auth } = useContext(AuthContext);

  const [displayCurrentVideoFreePreview, setDisplayCurrentVideoFreePreview] =
    useState(null);

  const [showFreePreviewDialog, setShowFreePreviewDialog] = useState(false);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, reviewText: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasPurchasedCourse, setHasPurchasedCourse] = useState(false);

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!hasPurchasedCourse) {
      return toast.error("You can review this course only after purchase.");
    }
    if (newReview.reviewText.trim() === "") {
      return toast.error("Review text is required");
    }

    setSubmittingReview(true);

    try {
      const response = await addReviewService({
        courseId: studentViewCourseDetails._id,
        ...newReview,
      });

      if (!response.success) {
        toast.error(response.message || "Failed to add review");
        return;
      }

      toast.success("Review added!");
      setNewReview({ rating: 5, reviewText: "" });

      const refreshedReviews = await getReviewsService(
        studentViewCourseDetails._id,
      );
      if (refreshedReviews.success) {
        setReviews(refreshedReviews.reviews);
      }
    } catch (error) {
      console.error("Error adding review", error);
      toast.error(error?.response?.data?.message || "Failed to add review");
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    const fetchReviews = async () => {
      if (studentViewCourseDetails?._id) {
        const response = await getReviewsService(studentViewCourseDetails._id);
        if (response.success) setReviews(response.reviews);
      }
    };
    fetchReviews();
  }, [studentViewCourseDetails?._id]);

  const handleSetFreePreview = (getCurrentVideoInfo) => {
    setDisplayCurrentVideoFreePreview(getCurrentVideoInfo?.videoUrl);
  };

  const handleCreatePayment = async () => {
    setPaymentSubmitting(true);
    const paymentPayload = {
      userId: auth?.user?._id,
      userName: auth?.user?.userName,
      userEmail: auth?.user?.userEmail,
      orderStatus: "pending",
      paymentMethod: "razorpay",
      paymentStatus: "initiated",
      orderDate: new Date(),
      instructorId: studentViewCourseDetails?.instructorId,
      instructorName: studentViewCourseDetails?.instructorName,
      courseImage: studentViewCourseDetails?.image,
      courseTitle: studentViewCourseDetails?.title,
      courseId: studentViewCourseDetails?._id,
      coursePricing: studentViewCourseDetails?.pricing,
    };

    try {
      const response = await createPaymentService(paymentPayload);

      if (response.success && response.result) {
        const { razorpayOrderId, orderId, amount, currency } = response.result;

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: amount,
          currency: currency,
          name: "SkillNest Academy",
          description: studentViewCourseDetails?.title,
          image: studentViewCourseDetails?.image,
          order_id: razorpayOrderId,
          handler: async function (response) {
            try {
              const capturePayload = {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: orderId,
              };

              const captureResponse =
                await captureAndFinalizePaymentService(capturePayload);

              if (captureResponse.success) {
                setPaymentSubmitting(false);
                toast.success("Payment successful! Redirecting to course...");
                navigate(`/course-progress/${studentViewCourseDetails?._id}`);
              } else {
                setPaymentSubmitting(false);
                toast.error(
                  captureResponse.message || "Payment verification failed.",
                );
              }
            } catch (err) {
              setPaymentSubmitting(false);
              console.error("Capture payment error:", err);
              toast.error("Error verifying payment. Please contact support.");
            }
          },
          modal: {
            ondismiss: function () {
              setPaymentSubmitting(false);
            },
          },
          prefill: {
            name: auth?.user?.userName,
            email: auth?.user?.userEmail,
          },
          theme: {
            color: "#0d694f",
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        setPaymentSubmitting(false);
        const msg = response.message || "Failed to create Razorpay order.";
        toast.error(msg);
      }
    } catch (err) {
      setPaymentSubmitting(false);
      console.error("Error creating payment:", err);
      toast.error("Something went wrong while initiating payment. Try again.");
    }
  };

  useEffect(() => {
    if (displayCurrentVideoFreePreview !== null) {
      setShowFreePreviewDialog(true);
    }
  }, [displayCurrentVideoFreePreview]);

  const { id } = useParams();

  useEffect(() => {
    if (id) {
      setCurrentCourseDetailsId(id);
    }
  }, [id, setCurrentCourseDetailsId]);

  const navigate = useNavigate();
  useEffect(() => {
    if (currentCourseDetailsId) {
      const fetchCourseDetails = async () => {
        try {
          const coursePurchaseInfoResponse =
            await checkCoursePurchaseInfoService(
              currentCourseDetailsId,
              auth?.user?._id,
            );

          if (
            coursePurchaseInfoResponse?.success &&
            coursePurchaseInfoResponse?.boughtOrNot
          ) {
            setHasPurchasedCourse(true);
            navigate(`/course-progress/${currentCourseDetailsId}`);
            return;
          } else {
            setHasPurchasedCourse(false);
            setLoadingState(true);
            const response = await fetchStudentViewCourseDetailsService(
              currentCourseDetailsId,
            );
            if (response?.success) {
              setStudentViewCourseDetails(response?.courseDetails);
            } else {
              setStudentViewCourseDetails(null);
            }
          }
        } catch (error) {
          console.log("Error fetching details of the course with id ", error);
          toast.error(
            "Error fetching details of the course. Please try again later.",
          );
        } finally {
          setLoadingState(false);
        }
      };

      fetchCourseDetails();
    }
  }, [
    currentCourseDetailsId,
    auth?.user?._id,
    navigate,
    setLoadingState,
    setStudentViewCourseDetails,
  ]);

  const location = useLocation();

  useEffect(() => {
    if (!location.pathname.includes("course/details")) {
      setStudentViewCourseDetails(null);
      setCurrentCourseDetailsId(null);
    }
  }, [
    location.pathname,
    setCurrentCourseDetailsId,
    setStudentViewCourseDetails,
  ]);

  const getIndexOfFreePreviewUrl =
    studentViewCourseDetails !== null
      ? studentViewCourseDetails?.curriculum?.findIndex(
          (item) => item.freePreview,
        )
      : -1;

  if (loadingState) {
    return (
      <div className="min-h-screen bg-[#fcf8f1] flex flex-col items-center justify-center gap-6">
         <ClipLoader color="#0d694f" size={50} />
         <p className="font-headline font-black text-[#0d694f] text-xs uppercase tracking-widest">Entering Vault...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcf8f1] pt-24 pb-20 px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb & Subtitle */}
        <div className="mb-12">
           <div className="inline-flex items-center gap-2 text-[#ff7e5f] font-headline font-black text-xs uppercase tracking-[0.2em] mb-4">
               Course Masterclass
               <span className="w-12 h-px bg-[#ff7e5f]/30"></span>
           </div>
           <h1 className="text-5xl lg:text-7xl font-headline font-black text-[#0d694f] tracking-tight leading-tight mb-6">
             {studentViewCourseDetails?.title}
           </h1>
           <p className="text-xl lg:text-2xl text-muted-foreground font-medium max-w-4xl leading-relaxed">
             {studentViewCourseDetails?.subtitle}
           </p>
        </div>

        {/* Hero Banner Area */}
        <div className="flex flex-col lg:flex-row gap-16">
          <main className="flex-1 space-y-16">
            {/* Meta Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 bg-white p-10 rounded-[2.5rem] border border-[#0d694f]/5 shadow-xl shadow-emerald-950/5 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Globe className="h-20 w-20 text-[#0d694f]" />
               </div>
               
               <div className="space-y-1">
                  <div className="text-[10px] font-black text-[#ff7e5f] uppercase tracking-widest">Master</div>
                  <div className="text-sm font-headline font-black text-[#0d694f]">{studentViewCourseDetails?.instructorName}</div>
               </div>
               
               <div className="space-y-1 text-center md:text-left">
                  <div className="text-[10px] font-black text-[#ff7e5f] uppercase tracking-widest">Enrolled</div>
                  <div className="text-sm font-headline font-black text-[#0d694f]">
                    {studentViewCourseDetails?.students?.length ?? 0} Scholars
                  </div>
               </div>
               
               <div className="space-y-1 text-center md:text-left">
                  <div className="text-[10px] font-black text-[#ff7e5f] uppercase tracking-widest">Intensity</div>
                  <div className="text-sm font-headline font-black text-[#0d694f]">{studentViewCourseDetails?.level}</div>
               </div>
               
               <div className="space-y-1 text-right md:text-left">
                  <div className="text-[10px] font-black text-[#ff7e5f] uppercase tracking-widest">Edition</div>
                  <div className="text-sm font-headline font-black text-[#0d694f]">
                    {studentViewCourseDetails?.date?.split("T")[0] ?? '2024'}
                  </div>
               </div>
            </div>

            {/* What you'll learn */}
            <section className="space-y-8">
               <h3 className="text-3xl font-headline font-black text-[#0d694f] flex items-center gap-4">
                  Syllabus Highlights
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff7e5f]"></span>
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {studentViewCourseDetails?.objectives?.split(",").map((objective, index) => (
                   <div key={index} className="flex items-start gap-4 bg-white p-6 rounded-3xl border border-[#0d694f]/5 hover:border-[#0d694f]/20 transition-all group">
                     <div className="w-8 h-8 rounded-xl bg-[#fcf8f1] flex items-center justify-center text-[#ff7e5f] group-hover:bg-[#ff7e5f] group-hover:text-white transition-all shadow-sm">
                        <CheckCircle className="h-4 w-4" />
                     </div>
                     <span className="font-headline font-bold text-[#0d694f]/80 leading-relaxed text-sm">{objective}</span>
                   </div>
                 ))}
               </div>
            </section>

            {/* Description */}
            <section className="space-y-8">
               <h3 className="text-3xl font-headline font-black text-[#0d694f] flex items-center gap-4">
                  The Masterclass
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff7e5f]/20"></span>
               </h3>
               <div className="bg-white p-10 lg:p-12 rounded-[3.5rem] border border-[#0d694f]/5 shadow-sm text-lg text-muted-foreground leading-relaxed font-body">
                  {studentViewCourseDetails?.description}
               </div>
            </section>

            {/* About the Educator */}
            <section className="space-y-8">
               <h3 className="text-3xl font-headline font-black text-[#0d694f] flex items-center gap-4">
                  Meet Your Educator
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0d694f]/40"></span>
               </h3>
               <div className="bg-white rounded-[3rem] p-10 border border-[#0d694f]/5 shadow-xl flex flex-col md:flex-row gap-10 items-center overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#0d694f]/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                  
                  <div className="w-32 h-32 rounded-full border-4 border-[#ff7e5f]/5 p-1 flex items-center justify-center overflow-hidden bg-[#fcf8f1] shrink-0">
                     {studentViewCourseDetails?.instructorDetails?.avatar ? (
                        <img src={studentViewCourseDetails.instructorDetails.avatar} alt="Educator" className="w-full h-full object-cover rounded-full" />
                     ) : (
                        <div className="w-full h-full bg-[#0d694f]/10 flex items-center justify-center rounded-full">
                           <Globe className="h-8 w-8 text-[#0d694f]/30" />
                        </div>
                     )}
                  </div>
                  
                  <div className="flex-1 space-y-4">
                     <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#ff7e5f] mb-1 block">Course Architect</span>
                        <h4 className="text-3xl font-headline font-black text-[#0d694f] tracking-tight truncate uppercase">
                           {studentViewCourseDetails?.instructorDetails?.userName || studentViewCourseDetails?.instructorName}
                        </h4>
                        <p className="text-[#0d694f]/60 font-medium text-xs mt-1 uppercase tracking-widest">
                           {studentViewCourseDetails?.instructorDetails?.experience || 0} Years of Command
                        </p>
                     </div>
                     <p className="text-base text-muted-foreground leading-relaxed italic font-medium">
                        &quot;{studentViewCourseDetails?.instructorDetails?.philosophy || "Dedicated to scholarly evolution and intellectual synchronicity."}&quot;
                     </p>
                  </div>
               </div>
            </section>

            {/* Curriculum */}
            <section className="space-y-8">
               <h3 className="text-3xl font-headline font-black text-[#0d694f] flex items-center gap-4">
                  Curriculum
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0d694f]/20"></span>
               </h3>
               <div className="space-y-4">
                  {studentViewCourseDetails?.curriculum?.map((item, index) => (
                    <div 
                      key={index}
                      onClick={item?.freePreview ? () => handleSetFreePreview(item) : null}
                      className={`flex items-center justify-between p-8 rounded-3xl border transition-all group ${item?.freePreview ? 'bg-white border-[#0d694f]/10 cursor-pointer hover:shadow-xl hover:shadow-emerald-950/5 hover:-translate-y-1' : 'bg-[#fcf8f1]/50 border-transparent cursor-not-allowed opacity-60'}`}
                    >
                      <div className="flex items-center gap-6">
                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${item?.freePreview ? 'bg-[#0d694f] text-white' : 'bg-muted text-muted-foreground'}`}>
                            {item?.freePreview ? <PlayCircle className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
                         </div>
                         <div>
                            <div className="text-lg font-headline font-black text-[#0d694f]">{item?.title}</div>
                            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Module {index + 1}</div>
                         </div>
                      </div>
                      {item?.freePreview && (
                        <div className="text-[10px] font-black text-[#ff7e5f] uppercase tracking-widest bg-[#ff7e5f]/10 px-4 py-2 rounded-xl">Free Preview</div>
                      )}
                    </div>
                  ))}
               </div>
            </section>

            {/* Reviews */}
            <section className="space-y-12 pt-16 border-t border-[#0d694f]/5">
               <div className="flex justify-between items-end">
                  <h3 className="text-3xl font-headline font-black text-[#0d694f] flex items-center gap-4">
                     Scholar Feedback
                     <span className="w-2.5 h-2.5 rounded-full bg-[#ff7e5f]"></span>
                  </h3>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 {reviews.length > 0 ? (
                   reviews.map((review, index) => (
                     <div key={index} className="bg-white p-10 rounded-[2.5rem] border border-[#0d694f]/5 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-5">
                           <Star className="h-12 w-12 text-[#ff7e5f]" />
                        </div>
                        <div className="flex gap-1 mb-6">
                           {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < review.rating ? "text-[#ff7e5f] fill-current" : "text-muted-foreground/20"}`} />
                           ))}
                        </div>
                        <p className="text-lg font-body text-[#0d694f]/80 italic mb-8 leading-relaxed">
                          &quot;{review.reviewText}&quot;
                        </p>
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-[#fcf8f1] border border-[#0d694f]/10 flex items-center justify-center font-black text-[#0d694f]">
                              {review.userName?.[0]}
                           </div>
                           <span className="text-xs font-headline font-black uppercase tracking-widest text-[#0d694f]">{review.userName}</span>
                        </div>
                     </div>
                   ))
                 ) : (
                   <div className="col-span-full py-20 bg-white rounded-[3rem] border border-dashed border-[#0d694f]/20 text-center">
                      <p className="text-muted-foreground font-medium italic">No reviews yet. Be the first to share your journey.</p>
                   </div>
                 )}
               </div>

               {/* Add Review */}
               {auth?.user && (
                  <div className="bg-[#0d694f] rounded-[3rem] p-12 text-white shadow-2xl shadow-emerald-950/20">
                     <h4 className="text-3xl font-headline font-black mb-8">Contribute to the Archive</h4>
                     {hasPurchasedCourse ? (
                       <form onSubmit={handleAddReview} className="space-y-8">
                         <div className="flex items-center gap-6">
                           <div className="text-xs font-black uppercase tracking-widest text-white/60">Your Rating</div>
                           <div className="flex gap-2">
                             {[1, 2, 3, 4, 5].map((star) => (
                               <Star
                                 key={star}
                                 className={`h-8 w-8 cursor-pointer transition-all ${star <= newReview.rating ? "text-[#ff7e5f] fill-current scale-110" : "text-white/20 hover:text-white/40"}`}
                                 onClick={() => setNewReview({ ...newReview, rating: star })}
                               />
                             ))}
                           </div>
                         </div>
                         <div className="relative">
                           <textarea
                             className="w-full p-8 rounded-[2rem] bg-white/5 border border-white/10 focus:border-[#ff7e5f] outline-none transition-all duration-500 min-h-[150px] text-white placeholder:text-white/20"
                             placeholder="Share your intellectual growth with fellow scholars..."
                             value={newReview.reviewText}
                             onChange={(e) => setNewReview({ ...newReview, reviewText: e.target.value })}
                           />
                         </div>
                         <Button
                           type="submit"
                           disabled={submittingReview}
                           className="bg-[#ff7e5f] hover:bg-white hover:text-[#0d694f] text-white rounded-2xl px-12 py-7 font-headline font-black text-sm border-none shadow-xl shadow-orange-950/20 transition-all flex items-center gap-3"
                         >
                           {submittingReview ? <ClipLoader size={18} color="#fff" /> : <>POST FEEDBACK <Send className="h-4 w-4" /></>}
                         </Button>
                       </form>
                     ) : (
                       <p className="p-8 bg-white/5 border border-white/5 rounded-2xl text-white/60 font-medium italic text-center">
                         Enroll in this masterclass to share your feedback.
                       </p>
                     )}
                  </div>
               )}
            </section>
          </main>

          {/* Sticky Purchase Card */}
          <aside className="w-full lg:w-[450px]">
            <div className="sticky top-32 space-y-8">
              <div className="bg-white rounded-[3rem] overflow-hidden border border-[#0d694f]/5 shadow-[0_50px_100px_-20px_rgba(13,105,79,0.12)]">
                <div className="aspect-video relative group overflow-hidden">
                   <div className="absolute inset-0 bg-[#0d694f]/10 group-hover:bg-[#0d694f]/0 transition-all z-10"></div>
                   <VideoPlayer
                     url={getIndexOfFreePreviewUrl !== -1 ? studentViewCourseDetails?.curriculum[getIndexOfFreePreviewUrl].videoUrl : ""}
                     width="100%"
                     height="100%"
                   />
                </div>
                
                <div className="p-10 space-y-10">
                  <div className="space-y-3">
                     <span className="text-[10px] font-black text-[#ff7e5f] uppercase tracking-widest">Pricing Model</span>
                     <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-headline font-black text-[#0d694f]">Rs {studentViewCourseDetails?.pricing}</span>
                        <span className="text-muted-foreground font-bold line-through opacity-40">Rs {Math.round(studentViewCourseDetails?.pricing * 1.5)}</span>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <Button
                       className="w-full py-8 rounded-2xl bg-[#0d694f] hover:bg-[#0b5c45] text-white font-headline font-black text-sm border-none shadow-2xl shadow-[#0d694f]/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                       disabled={paymentSubmitting}
                       onClick={handleCreatePayment}
                     >
                       {paymentSubmitting ? <ClipLoader size={20} color="#fff" /> : <>ENROLL IN VAULT <ChevronRight className="h-5 w-5" /></>}
                     </Button>
                     <p className="text-center text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">30-Day Intellectual Guarantee</p>
                  </div>

                  <div className="grid grid-cols-1 gap-6 pt-10 border-t border-[#fcf8f1]">
                     {[
                       { icon: CheckCircle, text: "LIFETIME SANCTUARY ACCESS" },
                       { icon: BarChart, text: "FULL INTENSITY SYLLABUS" },
                       { icon: Globe, text: "GLOBAL SCHOLAR COMMUNITY" },
                       { icon: Award, text: "VERIFIED ARCHIVE CERTIFICATE" }
                     ].map((item, i) => (
                       <div key={i} className="flex items-center gap-4">
                          <item.icon className="h-4 w-4 text-[#ff7e5f]" />
                          <span className="text-[10px] font-black text-[#0d694f]/60 uppercase tracking-widest font-headline">{item.text}</span>
                       </div>
                     ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Free Preview Dialog */}
      <Dialog
        open={showFreePreviewDialog}
        onOpenChange={() => {
          setShowFreePreviewDialog(false);
          setDisplayCurrentVideoFreePreview(null);
        }}
      >
        <DialogContent className="rounded-[3rem] border-none shadow-3xl p-0 overflow-hidden max-w-4xl bg-white">
          <div className="flex flex-col lg:flex-row h-full min-h-[500px]">
             <div className="lg:w-2/3 bg-black flex items-center justify-center relative">
                <VideoPlayer
                  url={displayCurrentVideoFreePreview}
                  width="100%"
                  height="100%"
                />
             </div>
             
             <div className="lg:w-1/3 p-10 flex flex-col justify-between bg-white border-l border-[#0d694f]/5">
                <div>
                  <div className="text-[10px] font-black text-[#ff7e5f] uppercase tracking-widest mb-4">Sample Lesson</div>
                  <DialogTitle className="text-3xl font-headline font-black text-[#0d694f] leading-tight mb-8">Masterclass Sneak-Peek</DialogTitle>
                  
                  <div className="space-y-4">
                    {studentViewCourseDetails?.curriculum?.filter((item) => item.freePreview).map((filteredItem, index) => (
                      <div
                        onClick={() => handleSetFreePreview(filteredItem)}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${displayCurrentVideoFreePreview === filteredItem.videoUrl ? 'bg-[#0d694f] border-[#0d694f] text-white shadow-lg' : 'bg-[#fcf8f1] border-transparent hover:border-[#0d694f]/20 text-[#0d694f]'}`}
                        key={index}
                      >
                        <PlayCircle className={`h-4 w-4 ${displayCurrentVideoFreePreview === filteredItem.videoUrl ? 'text-[#ff7e5f]' : 'text-[#ff7e5f]/60'}`} />
                        <span className="text-xs font-headline font-bold uppercase tracking-wide">{filteredItem.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button 
                   onClick={() => setShowFreePreviewDialog(false)}
                   className="w-full mt-10 rounded-xl bg-[#fcf8f1] hover:bg-[#0d694f] hover:text-white text-[#0d694f] border-none shadow-sm transition-all font-headline font-black text-[10px] tracking-widest uppercase"
                >
                   Return to Sanctuary
                </Button>
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentViewCourseDetailsPage;
