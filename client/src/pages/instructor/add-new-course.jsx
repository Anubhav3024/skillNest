import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import CourseCurriculum from "@/components/instructor-view/courses/add-new-course/course-curriculum";
import CourseLanding from "@/components/instructor-view/courses/add-new-course/course-landing";
import CourseSettings from "@/components/instructor-view/courses/add-new-course/course-settings";
import {
  courseCurriculumInitialFormData,
  courseLandingInitialFormData,
} from "@/config";
import Loader from "../../components/common/loader";
import { InstructorContext } from "@/context/instructor-context";
import { AuthContext } from "@/context/auth-context";
import {
  addNewCourseService,
  fetchInstructorCourseDetailsService,
  updateCourseByIdService,
} from "@/services";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { ChevronRight, Save, XCircle, Sparkles, Send } from "lucide-react";

const AddNewCoursePage = () => {
  const {
    courseLandingFormData,
    courseCurriculumFormData,
    setCourseLandingFormData,
    setCourseCurriculumFormData,
    currentEditedCourseId,
    setCurrentEditedCourseId,
    setActiveTab,
  } = useContext(InstructorContext);
  const authContext = useContext(AuthContext);
  const auth = authContext?.auth;

  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const requestedTab = searchParams.get("tab");
  const initialTab = ["curriculum", "landing-page", "settings"].includes(requestedTab)
    ? requestedTab
    : "curriculum";

  const validateFormData = () => {
    return true; // Allow saving at any time to prevent blocking the user
  };

  const handleCreateCourse = async () => {
    const courseFinalFormData = {
      instructorId: auth?.user?._id,
      instructorName: auth?.user?.userName,
      date: new Date(),
      ...courseLandingFormData,
      curriculum: courseCurriculumFormData,
      isPublished: courseLandingFormData.isPublished || false,
    };

    console.log("Submitting course data:", courseFinalFormData);
    try {
      const response =
        currentEditedCourseId !== null
          ? await updateCourseByIdService(currentEditedCourseId, courseFinalFormData)
          : await addNewCourseService(courseFinalFormData);

      console.log("Update response:", response);
      if (response?.success) {
        setCourseLandingFormData(courseLandingInitialFormData);
        setCourseCurriculumFormData(courseCurriculumInitialFormData);
        navigate("/instructor");
        setActiveTab("courses");
        setCurrentEditedCourseId(null);
        toast.success(currentEditedCourseId !== null ? "Vault records updated." : "New course forged successfully.");
      } else {
        toast.error(response?.message || "Operation failed.");
      }
    } catch (error) {
      console.error("Transmission error:", error);
      toast.error("Transmission error: Matrix unstable.");
    }
  };

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setIsLoading(true);
        const response = await fetchInstructorCourseDetailsService(params.courseId);
        if (response?.success) {
          const courseDetails = response.courseDetails;
          
          // Map only relevant fields to avoid polluting form data with DB artifacts
          const landingData = {};
          Object.keys(courseLandingInitialFormData).forEach(key => {
             landingData[key] = courseDetails[key] || "";
          });
          landingData.isPublished = courseDetails.isPublished;

          setCourseLandingFormData(landingData);
          setCourseCurriculumFormData(courseDetails.curriculum || []);
          setCurrentEditedCourseId(params.courseId);
        }
      } catch {
        toast.error("Resource retrieval failed.");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.courseId) {
      setCurrentEditedCourseId(params.courseId);
      fetchCourseDetails();
    } else {
      setCurrentEditedCourseId(null);
      setCourseLandingFormData(courseLandingInitialFormData);
      setCourseCurriculumFormData(courseCurriculumInitialFormData);
    }
  }, [params.courseId, setCurrentEditedCourseId, setCourseLandingFormData, setCourseCurriculumFormData]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#fcf8f1] flex items-center justify-center z-[100]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcf8f1] font-sans selection:bg-[#0d694f]/10">
      {/* Premium Sticky Header */}
      <header className="sticky top-0 z-50 bg-[#0d694f] px-8 py-4 flex items-center justify-between shadow-2xl border-b border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <div className="bg-[#ff7e5f] p-2.5 rounded-2xl shadow-3d rotate-3 group hover:rotate-0 transition-transform cursor-pointer" onClick={() => navigate(-1)}>
             <XCircle className="w-6 h-6 text-white" />
          </div>
          <div className="hidden md:block">
            <h1 className="text-xl font-headline font-bold text-white tracking-tighter uppercase flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#ff7e5f]" />
              {currentEditedCourseId !== null ? "REVISE VAULT" : "FORGE NEW COURSE"}
            </h1>
            <p className="text-[9px] text-white/50 font-bold tracking-widest uppercase mt-0.5 italic">EDUMANAGE SYSTEM v2.0</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4 bg-white/10 px-6 py-2.5 rounded-2xl border border-white/5">
            <Switch 
              checked={courseLandingFormData.isPublished || false}
              onCheckedChange={(val) => setCourseLandingFormData({...courseLandingFormData, isPublished: val})}
              className="data-[state=checked]:bg-[#ff7e5f]"
            />
            <Label className="text-[10px] font-bold uppercase tracking-widest text-white/80">
              {courseLandingFormData.isPublished ? "PUBLISHED" : "DRAFT"}
            </Label>
          </div>

          <Button
            disabled={!validateFormData()}
            onClick={handleCreateCourse}
            className="bg-[#ff7e5f] hover:bg-[#ff7e5f]/90 text-white rounded-2xl px-10 py-5 h-auto font-headline font-bold text-[10px] tracking-widest uppercase shadow-3d transition-all border-none flex items-center gap-3 disabled:opacity-30"
          >
            {currentEditedCourseId !== null ? <Save className="w-5 h-5" /> : <Send className="w-5 h-5" />}
            {currentEditedCourseId !== null ? "ENFORCE CHANGES" : "PUBLISH MANIFEST"}
          </Button>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto p-12 lg:p-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <Tabs defaultValue={initialTab} className="space-y-12">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16">
               <TabsList className="bg-white/50 p-2 rounded-[2.5rem] h-auto border border-[#0d694f]/5 shadow-3d flex flex-wrap lg:flex-nowrap gap-2">
                <TabsTrigger value="curriculum" className="rounded-[2rem] px-8 py-4 data-[state=active]:bg-[#0d694f] data-[state=active]:text-white font-headline font-bold text-[10px] tracking-widest uppercase transition-all flex items-center gap-2">
                  <ChevronRight className="w-3 h-3 text-[#ff7e5f]" /> 01. CURRICULUM
                </TabsTrigger>
                <TabsTrigger value="landing-page" className="rounded-[2rem] px-8 py-4 data-[state=active]:bg-[#0d694f] data-[state=active]:text-white font-headline font-bold text-[10px] tracking-widest uppercase transition-all flex items-center gap-2">
                  <ChevronRight className="w-3 h-3 text-[#ff7e5f]" /> 02. LANDING DETAILS
                </TabsTrigger>
                <TabsTrigger value="settings" className="rounded-[2rem] px-8 py-4 data-[state=active]:bg-[#0d694f] data-[state=active]:text-white font-headline font-bold text-[10px] tracking-widest uppercase transition-all flex items-center gap-2">
                  <ChevronRight className="w-3 h-3 text-[#ff7e5f]" /> 03. VAULT SETTINGS
                </TabsTrigger>
              </TabsList>

              <div className="lg:text-right hidden sm:block">
                 <h2 className="text-3xl font-headline font-bold text-[#0d694f] tracking-tighter uppercase leading-none">{courseLandingFormData.title || "UNTITLED MANIFEST"}</h2>
                 <span className="text-[10px] font-bold text-[#ff7e5f] tracking-[0.3em] uppercase block mt-2 opacity-60">Status: {currentEditedCourseId !== null ? "Revision Phase" : "Creation Phase"}</span>
              </div>
            </div>

            <div className="mt-8">
              <TabsContent value="curriculum">
                <CourseCurriculum />
              </TabsContent>
              <TabsContent value="landing-page">
                <CourseLanding />
              </TabsContent>
              <TabsContent value="settings">
                <CourseSettings />
              </TabsContent>
            </div>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default AddNewCoursePage;
