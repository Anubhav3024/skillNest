import MediaProgressbar from "@/components/media-progress-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InstructorContext } from "@/context/instructor-context";
import { mediaDeleteService, mediaUploadService } from "@/services";
import { useContext } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Upload, RefreshCw, Image as ImageIcon } from "lucide-react";

const CourseSettings = () => {
  const {
    courseLandingFormData,
    setCourseLandingFormData,
    mediaUploadProgress,
    setMediaUploadProgress,
    mediaUploadProgressPercentage,
    setMediaUploadProgressPercentage,
  } = useContext(InstructorContext);

  const handleImageChange = async (event) => {
    const selectedImage = event.target.files[0];

    if (selectedImage) {
      const imageFormData = new FormData();
      imageFormData.append("file", selectedImage);

      try {
        setMediaUploadProgress(true);

        const res = await mediaUploadService(
          imageFormData,
          setMediaUploadPercentage => setMediaUploadProgressPercentage(setMediaUploadPercentage)
        );

        if (res?.success) {
          setCourseLandingFormData({
            ...courseLandingFormData,
            image: res?.result?.url,
            imagePublicId: res?.result?.public_id,
          });
          toast.success("Identity Manifest synced successfully.");
        }
      } catch {
        toast.error("Visual upload failure.");
      } finally {
        setMediaUploadProgress(false);
      }
    }
  };

  const handleReplaceImage = async () => {
    const imagePublicId = courseLandingFormData.imagePublicId;

    if (!imagePublicId) {
      toast.warning("Knowledge anchor missing: imagePublicId not found.");
      return;
    }

    try {
      const response = await mediaDeleteService(imagePublicId);

      if (response?.success) {
        setCourseLandingFormData({
          ...courseLandingFormData,
          image: "",
          imagePublicId: "",
        });
        toast.info("Vault identity reset.");
      }
    } catch {
      toast.error("Reset protocol failed.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="bg-white/50 p-8 rounded-3xl border border-[#0d694f]/5 mb-4">
        <h3 className="text-xl font-headline font-black text-[#0d694f] tracking-tight uppercase">
          Identity Manifest
        </h3>
        <p className="text-muted-foreground font-medium text-[10px] italic opacity-70 uppercase tracking-widest mt-1">
          Upload the visual signature for this curriculum vault.
        </p>
      </div>

      <Card className="bg-white rounded-[2rem] border border-[#0d694f]/5 shadow-3d overflow-hidden">
        <div className="p-8">
          {mediaUploadProgress && (
            <MediaProgressbar
              isMediaUploading={mediaUploadProgress}
              progress={mediaUploadProgressPercentage}
            />
          )}
        </div>
        <CardContent className="flex flex-col items-center justify-center p-12 lg:p-16">
          {courseLandingFormData?.image ? (
            <div className="w-full max-w-2xl text-center">
              <div className="relative group rounded-3xl overflow-hidden shadow-3d border border-[#0d694f]/10 mb-8">
                <LazyLoadImage
                  src={courseLandingFormData.image}
                  alt="Course Thumbnail"
                  effect="blur"
                  className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[#0d694f]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                   <ImageIcon className="text-white w-12 h-12" />
                </div>
              </div>
              <Button 
                variant="outline"
                className="bg-white border-[#0d694f]/10 rounded-xl px-10 py-5 h-auto text-[10px] font-black uppercase tracking-widest text-[#0d694f] transition-all hover:bg-[#0d694f] hover:text-white shadow-3d"
                onClick={() => handleReplaceImage()}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                REVISE SIGNATURE
              </Button>
            </div>
          ) : (
            <div className="w-full max-w-md">
              <div className="relative group/upload h-64 cursor-pointer">
                <Input 
                  onChange={handleImageChange} 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className="absolute inset-0 border-4 border-dashed border-[#0d694f]/10 rounded-3xl flex flex-col items-center justify-center gap-6 bg-[#fcf8f1]/30 group-hover/upload:bg-white group-hover/upload:border-[#0d694f]/30 transition-all">
                  <div className="w-20 h-20 rounded-2xl bg-white shadow-3d flex items-center justify-center">
                    <Upload className="w-8 h-8 text-[#0d694f]" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-[#0d694f]">UPLOAD SIGNATURE</p>
                    <p className="text-[9px] font-medium italic opacity-40 mt-2">Recommended: 1280x720 (16:9)</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CourseSettings;
