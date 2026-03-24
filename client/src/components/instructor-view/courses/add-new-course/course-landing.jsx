import FormControls from "@/components/common-form/form-controls";
import { Card, CardContent } from "@/components/ui/card";
import { courseLandingPageFormControls } from "@/config";
import { InstructorContext } from "@/context/instructor-context";
import { useContext } from "react";
import { motion } from "framer-motion";

const CourseLanding = () => {
  const { courseLandingFormData, setCourseLandingFormData } =
    useContext(InstructorContext);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="bg-white/50 p-8 rounded-3xl border border-[#0d694f]/5 mb-4">
        <h3 className="text-xl font-headline font-bold text-[#0d694f] tracking-tight uppercase">
          Manifest Designation
        </h3>
        <p className="text-muted-foreground font-medium text-[10px] italic opacity-70 uppercase tracking-widest mt-1">
          Define the identity and scholarly categorization of this vault.
        </p>
      </div>

      <Card className="bg-white rounded-[2rem] border border-[#0d694f]/5 shadow-3d overflow-hidden">
        <CardContent className="p-8 lg:p-12">
          <FormControls
            formControls={courseLandingPageFormControls}
            formData={courseLandingFormData}
            setFormData={setCourseLandingFormData}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CourseLanding;
