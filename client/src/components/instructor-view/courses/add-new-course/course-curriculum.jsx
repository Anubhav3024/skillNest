import MediaProgressbar from "@/components/media-progress-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import VideoPlayer from "@/components/video-player";
import { courseCurriculumInitialFormData } from "@/config";
import { InstructorContext } from "@/context/instructor-context";
import {
  mediaBulkUploadService,
  mediaDeleteService,
  mediaUploadService,
} from "@/services";
import { Upload, Trash2, Plus, RefreshCw, Layers, FileText, X } from "lucide-react";
import { useContext, useRef } from "react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const CourseCurriculum = () => {
  const {
    courseCurriculumFormData,
    setCourseCurriculumFormData,
    mediaUploadProgress,
    setMediaUploadProgress,
    mediaUploadProgressPercentage,
    setMediaUploadProgressPercentage,
  } = useContext(InstructorContext);

  const handleNewLecture = () => {
    setCourseCurriculumFormData([
      ...courseCurriculumFormData,
      {
        ...courseCurriculumInitialFormData[0],
        resources: [], // Initialize resources array
      },
    ]);
  };

  const handleCourseTitleChange = (event, currentIndex) => {
    let copyCourseCurriculumFormData = [...courseCurriculumFormData];
    copyCourseCurriculumFormData[currentIndex] = {
      ...copyCourseCurriculumFormData[currentIndex],
      title: event.target.value,
    };
    setCourseCurriculumFormData(copyCourseCurriculumFormData);
  };

  const handleFreepreviewChange = (currentValue, currentIndex) => {
    let copyCourseCurriculumFormData = [...courseCurriculumFormData];
    copyCourseCurriculumFormData[currentIndex] = {
      ...copyCourseCurriculumFormData[currentIndex],
      freePreview: currentValue,
    };
    setCourseCurriculumFormData(copyCourseCurriculumFormData);
  };

  const handleSingleLectureUpload = async (event, currentIndex) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const videoFormData = new FormData();
      videoFormData.append("file", selectedFile);

      try {
        setMediaUploadProgress(true);
        const res = await mediaUploadService(
          videoFormData,
          setMediaUploadProgressPercentage
        );

        if (res?.success) {
          let copyCourseCurriculumFormData = [...courseCurriculumFormData];
          copyCourseCurriculumFormData[currentIndex] = {
            ...copyCourseCurriculumFormData[currentIndex],
            videoUrl: res?.result?.url,
            public_id: res?.result?.public_id,
          };
          setCourseCurriculumFormData(copyCourseCurriculumFormData);
          toast.success("Lecture transmission successful.");
        }
      } catch {
        toast.error("Shields down: Video transmission failed.");
      } finally {
        setMediaUploadProgress(false);
      }
    }
  };

  const handleResourceUpload = async (event, currentIndex) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const resourceFormData = new FormData();
      resourceFormData.append("file", selectedFile);

      try {
        setMediaUploadProgress(true);
        const res = await mediaUploadService(
          resourceFormData,
          setMediaUploadProgressPercentage
        );

        if (res?.success) {
          let copyCourseCurriculumFormData = [...courseCurriculumFormData];
          const lecture = copyCourseCurriculumFormData[currentIndex];
          
          if (!lecture.resources) lecture.resources = [];
          
          lecture.resources.push({
            title: selectedFile.name,
            fileUrl: res?.result?.url,
            public_id: res?.result?.public_id,
          });

          setCourseCurriculumFormData(copyCourseCurriculumFormData);
          toast.success("Scholarly resource archived.");
        }
      } catch {
        toast.error("Resource transmission failed.");
      } finally {
        setMediaUploadProgress(false);
      }
    }
  };

  const handleDeleteResource = async (lectureIndex, resourceIndex) => {
    let copyCourseCurriculumFormData = [...courseCurriculumFormData];
    const resource = copyCourseCurriculumFormData[lectureIndex].resources[resourceIndex];

    try {
      if (resource.public_id) {
        await mediaDeleteService(resource.public_id);
      }
      copyCourseCurriculumFormData[lectureIndex].resources.splice(resourceIndex, 1);
      setCourseCurriculumFormData(copyCourseCurriculumFormData);
      toast.info("Resource purged from archives.");
    } catch {
      toast.error("Failed to dissolve resource.");
    }
  };

  const handleReplaceVideo = async (currentIndex) => {
    let copyCourseCurriculumFormData = [...courseCurriculumFormData];
    const currentItem = copyCourseCurriculumFormData[currentIndex];

    if (!currentItem?.public_id) {
      toast.error("Knowledge anchor missing: public_id not found.");
      return;
    }

    const deleteCurrentMedia = await mediaDeleteService(currentItem.public_id);

    if (deleteCurrentMedia?.success) {
      copyCourseCurriculumFormData[currentIndex] = {
        ...copyCourseCurriculumFormData[currentIndex],
        videoUrl: "",
        public_id: "",
      };
      setCourseCurriculumFormData(copyCourseCurriculumFormData);
      toast.info("Lecture data purged for revision.");
    }
  };

  const bulkUploadInputRef = useRef(null);
  const handleOpenBulkUploadDialog = () => bulkUploadInputRef.current?.click();

  const areAllCourseCurriculumFormDataObjectsEmpty = (arr) => {
    return arr.every((obj) => {
      return Object.values(obj).every((value) => {
        if (typeof value === "boolean" || Array.isArray(value)) return true;
        return value === "";
      });
    });
  };

  const handleMediaBulkUpload = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles.length === 0) return;

    const bulkFormData = new FormData();
    selectedFiles.forEach((fileItem) => bulkFormData.append("files", fileItem));

    try {
      setMediaUploadProgress(true);
      const response = await mediaBulkUploadService(
        bulkFormData,
        setMediaUploadProgressPercentage
      );

      if (response?.success) {
        let copyCourseCurriculumFormData =
          areAllCourseCurriculumFormDataObjectsEmpty(courseCurriculumFormData)
            ? []
            : [...courseCurriculumFormData];

        copyCourseCurriculumFormData = [
          ...copyCourseCurriculumFormData,
          ...(response?.result || []).map((item) => ({
            videoUrl: item?.url,
            public_id: item?.public_id,
            title: `Lecture ${copyCourseCurriculumFormData.length + 1}`,
            freePreview: false,
            resources: [],
          })),
        ];

        setCourseCurriculumFormData(copyCourseCurriculumFormData);
        toast.success(`Augmented curriculum with ${response?.result?.length} new lectures.`);
      }
    } catch {
      toast.error("Mass transmission failed.");
    } finally {
      setMediaUploadProgress(false);
    }
  };

  const handleDeleteLecture = async (currentIndex) => {
    let copyCourseCurriculumFormData = [...courseCurriculumFormData];
    const publicId = copyCourseCurriculumFormData[currentIndex].public_id;

    if (!publicId) {
      setCourseCurriculumFormData(copyCourseCurriculumFormData.filter((_, idx) => idx !== currentIndex));
      return;
    }

    try {
      const response = await mediaDeleteService(publicId);
      if (response?.success) {
        setCourseCurriculumFormData(copyCourseCurriculumFormData.filter((_, index) => index !== currentIndex));
        toast.success("Curriculum module dissolved.");
      }
    } catch {
      toast.error("Dissolution failed.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/50 p-8 rounded-3xl border border-[#0d694f]/5 mb-8">
        <div>
          <h3 className="text-xl font-headline font-black text-[#0d694f] tracking-tight uppercase">
            Curriculum Architecture
          </h3>
          <p className="text-muted-foreground font-medium text-[10px] italic opacity-70 uppercase tracking-widest mt-1">
            Orchestrate the sequence of transmission modules.
          </p>
        </div>
        <div className="flex gap-4">
          <Input
            type="file"
            ref={bulkUploadInputRef}
            accept="video/*"
            multiple
            className="hidden"
            id="bulk-media-upload"
            onChange={handleMediaBulkUpload}
          />
          <Button
            as="label"
            htmlFor="bulk-media-upload"
            className="cursor-pointer bg-white border border-[#0d694f]/10 rounded-2xl px-8 py-5 h-auto text-[10px] font-black uppercase tracking-widest text-[#0d694f] hover:bg-[#0d694f] hover:text-white shadow-3d transition-all"
            onClick={handleOpenBulkUploadDialog}
          >
            <Layers className="w-4 h-4 mr-2" />
            MASS SYNC
          </Button>
          
          <Button
            disabled={!courseCurriculumFormData.every(item => item.title.trim() !== "" && item.videoUrl.trim() !== "") || mediaUploadProgress}
            onClick={handleNewLecture}
            className="bg-[#0d694f] hover:bg-[#ff7e5f] text-white rounded-2xl px-10 py-5 h-auto font-headline font-black text-[10px] tracking-widest uppercase shadow-3d transition-all border-none disabled:bg-[#0d694f]/20"
          >
            <Plus className="mr-2 h-4 w-4" />
            APPEND MODULE
          </Button>
        </div>
      </div>

      {mediaUploadProgress && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl border border-[#0d694f]/5 shadow-3d"
        >
          <MediaProgressbar
            isMediaUploading={mediaUploadProgress}
            progress={mediaUploadProgressPercentage}
          />
        </motion.div>
      )}

      <div className="space-y-6">
        <AnimatePresence>
          {courseCurriculumFormData.map((curriculumItem, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-[2rem] border border-[#0d694f]/5 shadow-3d overflow-hidden group"
            >
              <div className="p-8 border-b border-[#fcf8f1] flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-6 flex-1 min-w-[300px]">
                  <div className="w-12 h-12 rounded-2xl bg-[#fcf8f1] border border-[#0d694f]/10 flex items-center justify-center font-headline font-black text-[#0d694f] text-sm shrink-0 shadow-inner">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div className="flex-1">
                    <Input
                      name={`title ${index + 1}`}
                      placeholder="ENTER MODULE DESIGNATION"
                      className="bg-[#fcf8f1]/50 border-none rounded-xl px-4 py-3 h-auto text-xs font-black uppercase tracking-widest text-[#0d694f] outline-none focus:ring-2 focus:ring-[#0d694f]/10 transition-all placeholder:opacity-30"
                      onChange={(event) => handleCourseTitleChange(event, index)}
                      value={curriculumItem.title}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-8 bg-[#fcf8f1]/50 px-6 py-4 rounded-2xl border border-[#0d694f]/5">
                  <div className="flex items-center gap-3">
                    <Switch
                      onCheckedChange={(value) => handleFreepreviewChange(value, index)}
                      checked={curriculumItem.freePreview}
                      className="data-[state=checked]:bg-[#0d694f]"
                    />
                    <Label className="text-[9px] font-black uppercase tracking-widest text-[#0d694f] opacity-60">
                      OPEN ACCESS
                    </Label>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteLecture(index)}
                    className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                   >
                     <Trash2 className="h-4 w-4" />
                   </motion.button>
                </div>
              </div>

              <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12 bg-[#fcf8f1]/30">
                {/* Video Section */}
                <div>
                   <Label className="text-[10px] font-black uppercase tracking-widest text-[#0d694f] mb-4 block opacity-60">TRANSMISSION SOURCE</Label>
                   {curriculumItem.videoUrl ? (
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-[#0d694f]/10 shadow-3d bg-black aspect-video">
                        <VideoPlayer url={curriculumItem.videoUrl} width="100%" height="100%" useProgressUpdate={false} />
                      </div>
                      <Button 
                        variant="outline"
                        className="w-full bg-white border-[#0d694f]/10 rounded-xl px-8 py-4 h-auto text-[9px] font-black uppercase tracking-widest text-[#0d694f] hover:bg-[#0d694f] hover:text-white shadow-3d"
                        onClick={() => handleReplaceVideo(index)}
                       >
                         <RefreshCw className="w-3.5 h-3.5 mr-2" /> REVISE SOURCE
                       </Button>
                    </div>
                  ) : (
                    <div className="relative group/upload h-48">
                      <Input type="file" accept="video/*" onChange={(e) => handleSingleLectureUpload(e, index)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                      <div className="absolute inset-0 border-2 border-dashed border-[#0d694f]/10 rounded-2xl flex flex-col items-center justify-center gap-3 bg-white/50 group-hover/upload:bg-white group-hover/upload:border-[#0d694f]/30 transition-all">
                        <Upload className="w-5 h-5 text-[#0d694f]/30 group-hover/upload:text-[#ff7e5f] transition-colors" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#0d694f]/40 text-center px-4">TRANSMIT MODULE VIDEO</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Resources Section */}
                <div className="border-t lg:border-t-0 lg:border-l border-[#0d694f]/5 lg:pl-12 pt-8 lg:pt-0">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-[#0d694f] mb-4 block opacity-60">SCHOLARLY ARCHIVES (PDF/DOC/ZIP)</Label>
                  <div className="space-y-4">
                <AnimatePresence>
                  {curriculumItem.resources?.map((resource, resIndex) => (
                    <motion.div 
                      key={resIndex}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex items-center justify-between bg-white/80 p-4 rounded-xl border border-[#0d694f]/5 shadow-sm group/res"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                         <div className="w-8 h-8 rounded-lg bg-[#fcf8f1] flex items-center justify-center">
                           <FileText className="w-4 h-4 text-[#0d694f]/40" />
                         </div>
                         <span className="text-[10px] font-black uppercase tracking-widest text-[#0d694f] truncate pr-4">{resource.title}</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleDeleteResource(index, resIndex)}
                        className="w-6 h-6 rounded-md hover:bg-red-50 text-[#0d694f]/20 hover:text-red-500 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                    
                    <div className="relative group/resupload h-16 mt-4">
                      <Input type="file" onChange={(e) => handleResourceUpload(e, index)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                      <div className="absolute inset-0 border border-dashed border-[#0d694f]/10 rounded-xl flex items-center justify-center gap-3 bg-white/40 group-hover/resupload:bg-white transition-all">
                        <Plus className="w-4 h-4 text-[#0d694f]/20 group-hover/resupload:text-[#ff7e5f]" />
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#0d694f]/30">APPEND ARCHIVE</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {courseCurriculumFormData.length === 0 && (
         <div className="py-20 text-center bg-white rounded-[3rem] border border-[#0d694f]/5 shadow-3d">
            <Layers className="w-12 h-12 text-[#0d694f]/20 mx-auto mb-6" />
            <h4 className="text-xl font-headline font-black text-[#0d694f] uppercase tracking-tighter">Null Curriculum detected</h4>
            <p className="text-muted-foreground font-medium text-xs italic opacity-60 mt-2">The vault is empty. Initiate module sequence to continue.</p>
         </div>
      )}
    </div>
  );
};

export default CourseCurriculum;
