import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { filterOptions, sortOptions } from "@/config";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import {
  checkCoursePurchaseInfoService,
  fetchStudentViewCourseListService,
} from "@/services";
import { ArrowUpDown, Search, Filter, BookOpen, Star, BarChart, ChevronRight, CheckCircle2 } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { motion } from "framer-motion";
import StudentShell from "@/components/student-view/student-shell";

const createSearchParamsHelper = (filterParams) => {
  const queryParams = [];
  for (const [key, value] of Object.entries(filterParams)) {
    if (Array.isArray(value) && value.length > 0) {
      const paramValue = value.join(",");
      queryParams.push(`${key}=${encodeURIComponent(paramValue)}`);
    }
  }
  return queryParams.join("&");
};

const StudentViewCoursesPage = () => {
  const navigate = useNavigate();
  const [sort, setSort] = useState("price-lowtohigh");
  const [filters, setFilters] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    studentViewCoursesList,
    setStudentViewCoursesList,
    loadingState,
    setLoadingState,
  } = useContext(StudentContext);

  const { auth } = useContext(AuthContext);

  const handleCourseNavigate = async (currentCourseId) => {
    const response = await checkCoursePurchaseInfoService(currentCourseId, auth?.user?._id);
    if (response?.success) {
      if (response?.boughtOrNot) navigate(`/course-progress/${currentCourseId}`);
      else navigate(`/course/details/${currentCourseId}`);
    }
  };

  useEffect(() => {
    const buildQueryStringForFilters = createSearchParamsHelper(filters);
    const nextParams = new URLSearchParams(buildQueryStringForFilters);
    const existingSearch = searchParams.get("search");
    if (existingSearch) nextParams.set("search", existingSearch);

    const nextQueryString = nextParams.toString();
    if (nextQueryString !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [filters, searchParams, setSearchParams]);

  useEffect(() => {
    setSort("price-lowtohigh");
    setFilters(JSON.parse(sessionStorage.getItem("filters")) || {});
  }, []);

  useEffect(() => {
    if (filters !== null && sort !== null) {
      const fetchAllCoursesOfStudent = async () => {
        try {
          const query = new URLSearchParams({ ...filters, sortBy: sort });
          const searchQuery = searchParams.get("search");
          if (searchQuery) query.set("search", searchQuery);
          setLoadingState(true);
          const response = await fetchStudentViewCourseListService(query);
          if (response?.success) setStudentViewCoursesList(response?.courseList);
        } catch (error) {
          console.log("Error fetching courses", error);
        } finally {
          setLoadingState(false);
        }
      };
      fetchAllCoursesOfStudent();
    }
  }, [filters, sort, searchParams, setLoadingState, setStudentViewCoursesList]);

  useEffect(() => {
    return () => sessionStorage.removeItem("filters");
  }, []);

  const handleFilterOnChange = (getSectionId, getCurrentOption) => {
    let copyFilters = { ...filters };
    const indexOfCurrentSection = Object.keys(copyFilters).indexOf(getSectionId);
    if (indexOfCurrentSection === -1) {
      copyFilters = { ...copyFilters, [getSectionId]: [getCurrentOption.id] };
    } else {
      const indexOfCurrentOption = copyFilters[getSectionId].indexOf(getCurrentOption.id);
      if (indexOfCurrentOption === -1) copyFilters[getSectionId].push(getCurrentOption.id);
      else copyFilters[getSectionId].splice(indexOfCurrentOption, 1);
    }
    setFilters(copyFilters);
    sessionStorage.setItem("filters", JSON.stringify(copyFilters));
  };

  const content = (
    <div className={`min-h-screen bg-[#fcf8f1] pb-20 px-6 lg:px-12 ${auth?.authenticated ? "pt-0" : "pt-24"}`}>
      <div className="max-w-7xl mx-auto">
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-[#ff7e5f] font-headline font-black text-xs uppercase tracking-[0.2em]">
               The Sanctuary
               <span className="w-12 h-px bg-[#ff7e5f]/30"></span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-headline font-black text-[#0d694f] tracking-tight">Browse Courses</h1>
            <p className="text-muted-foreground font-medium text-lg">Explore our curated collection of high-fidelity digital masterclasses.</p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-2xl font-headline font-black text-xs flex items-center gap-3 border-[#0d694f]/20 bg-white hover:bg-[#fcf8f1] hover:border-[#0d694f] transition-all px-8 py-6 shadow-sm">
                <ArrowUpDown className="h-4 w-4" />
                SORT: {sortOptions.find(o => o.id === sort)?.label.toUpperCase() || "RANKING"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl border border-border p-3 min-w-[220px] shadow-2xl">
              <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
                {sortOptions.map((opt) => (
                  <DropdownMenuRadioItem key={opt.id} value={opt.id} className="rounded-xl font-headline font-bold text-xs py-3 cursor-pointer focus:bg-[#0d694f]/5">
                    {opt.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Filter Sidebar */}
          <aside className="w-full lg:w-80 shrink-0">
            <div className="bg-white rounded-[2.5rem] p-10 border border-[#0d694f]/10 shadow-xl shadow-emerald-950/5 sticky top-32">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3 text-[#0d694f] uppercase font-headline font-black tracking-widest text-[10px]">
                  <Filter className="h-4 w-4" />
                  Filter Catalog
                </div>
                {Object.keys(filters).length > 0 && (
                  <button 
                    onClick={() => setFilters({})}
                    className="text-[10px] font-black text-[#ff7e5f] uppercase tracking-widest hover:underline transition-all"
                  >
                    Reset
                  </button>
                )}
              </div>
              
              <div className="space-y-12">
                {Object.keys(filterOptions).map((keyItem) => (
                  <div key={keyItem} className="space-y-6">
                    <h3 className="text-xs font-headline font-black text-foreground uppercase tracking-widest ml-1">{keyItem}</h3>
                    <div className="grid gap-4">
                      {filterOptions[keyItem].map((option) => (
                        <label 
                          key={option.id}
                          className="flex items-center gap-4 cursor-pointer group"
                        >
                          <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${filters[keyItem]?.includes(option.id) ? 'bg-[#0d694f] border-[#0d694f]' : 'border-[#0d694f]/20 group-hover:border-[#0d694f]/50'}`}>
                             {filters[keyItem]?.includes(option.id) && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                             <input 
                               type="checkbox" 
                               className="hidden" 
                               checked={filters[keyItem]?.includes(option.id)}
                               onChange={() => handleFilterOnChange(keyItem, option)}
                             />
                          </div>
                          <span className={`text-sm font-headline font-bold transition-colors ${filters[keyItem]?.includes(option.id) ? 'text-[#0d694f]' : 'text-muted-foreground group-hover:text-foreground'}`}>
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1">
            {loadingState ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-[28rem] rounded-[3rem] bg-white/50 border border-[#0d694f]/10" />)}
              </div>
            ) : studentViewCoursesList && studentViewCoursesList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {studentViewCoursesList.map((course) => (
                  <div 
                    key={course._id}
                    onClick={() => handleCourseNavigate(course._id)}
                    className="group relative bg-[#011c14]/5 backdrop-blur-xl border border-[#0d694f]/20 rounded-[3rem] p-4 transition-all duration-700 hover:shadow-2xl hover:bg-[#011c14]/10 cursor-pointer flex flex-col"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden rounded-[2.5rem] bg-[#fcf8f1] border border-[#0d694f]/5 mb-8 shadow-inner">
                      <LazyLoadImage 
                        src={course.image} 
                        className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110 opacity-90 group-hover:opacity-100" 
                        effect="blur"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#011c14]/40 to-transparent"></div>
                      
                      {/* Top Badges */}
                      <div className="absolute top-5 left-5 right-5 flex justify-between items-center">
                         <span className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl text-[9px] font-black text-white border border-white/20 uppercase tracking-[0.2em] shadow-lg">
                           {course.category}
                         </span>
                         <div className="bg-white/10 backdrop-blur-md px-3 py-2 rounded-2xl flex items-center gap-1.5 border border-white/20 shadow-lg">
                           <Star className="h-3.5 w-3.5 text-[#ff7e5f] fill-current" />
                           <span className="text-[10px] font-black text-white">4.9</span>
                         </div>
                      </div>
                    </div>
                    
                    <div className="px-4 pb-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-6">
                        <h3 className="text-2xl font-headline font-black text-[#0d694f] leading-none group-hover:text-[#ff7e5f] transition-all uppercase tracking-tight line-clamp-1">
                          {course.title}
                        </h3>
                        
                        <div className="flex items-center gap-4 bg-white/30 backdrop-blur-sm p-4 rounded-[1.8rem] border border-white/40">
                          <div className="w-12 h-12 rounded-2xl bg-[#0d694f] flex items-center justify-center text-xs font-black text-white shadow-lg border-2 border-white/20">
                            {course.instructorName?.[0]}
                          </div>
                          <div className="flex-1">
                             <div className="text-[8px] font-black text-[#ff7e5f] uppercase tracking-widest opacity-60">Architect</div>
                             <div className="text-sm font-headline font-black text-[#0d694f] tracking-tight">{course.instructorName}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 px-2">
                           <div className="flex items-center gap-2 text-[#0d694f]/40 font-black text-[9px] uppercase tracking-widest">
                              <BookOpen className="h-4 w-4 opacity-40 text-[#0d694f]" />
                              {course.curriculum?.length} Lessons
                           </div>
                           <div className="flex items-center gap-2 text-[#0d694f]/40 font-black text-[9px] uppercase tracking-widest">
                              <BarChart className="h-4 w-4 opacity-40 text-[#0d694f]" />
                              {course.level}
                           </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-10 p-2">
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black text-[#ff7e5f] uppercase tracking-widest leading-none mb-1 opacity-70">Scholarly Investment</span>
                           <span className="text-3xl font-headline font-black text-[#0d694f]">₹{course.pricing}</span>
                        </div>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button className="rounded-[1.2rem] w-14 h-14 bg-[#ff7e5f] hover:bg-[#ff7e5f]/90 text-white p-0 shadow-3d-orange border-none transition-all flex items-center justify-center">
                            <ChevronRight className="h-6 w-6" />
                          </Button>
                        </motion.div>
                      </div>
                    </div>

                    {/* Decorative Element */}
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#0d694f]/5 rounded-full blur-3xl -z-10 group-hover:bg-[#0d694f]/10 transition-all duration-700"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-40 bg-white rounded-[4rem] border border-dashed border-[#0d694f]/20 shadow-xl shadow-emerald-950/2">
                <div className="max-w-xs mx-auto">
                  <div className="w-24 h-24 bg-[#fcf8f1] rounded-full flex items-center justify-center mx-auto mb-10 border border-[#0d694f]/10 shadow-inner">
                    <Search className="h-10 w-10 text-[#0d694f]/20" />
                  </div>
                  <h3 className="text-3xl font-headline font-black text-[#0d694f] mb-6 tracking-tight">Vault Empty</h3>
                  <p className="text-muted-foreground font-medium mb-12 leading-relaxed">Try adjusting your filters or search terms to uncover your learning sanctuary.</p>
                  <Button onClick={() => setFilters({})} className="rounded-2xl px-12 py-7 bg-[#0d694f] text-white font-headline font-black text-sm border-none shadow-xl shadow-[#0d694f]/20">
                    Reset Selection
                  </Button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );

  if (auth?.authenticated) {
    return <StudentShell>{content}</StudentShell>;
  }

  return content;
};

export default StudentViewCoursesPage;
