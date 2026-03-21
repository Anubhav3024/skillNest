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
    setSearchParams(new URLSearchParams(buildQueryStringForFilters));
  }, [filters, setSearchParams]);

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

  return (
    <div className="min-h-screen bg-[#fcf8f1] pt-24 pb-20 px-6 lg:px-12">
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
                    className="bg-white rounded-[3rem] overflow-hidden border border-[#0d694f]/5 hover:shadow-[0_40px_80px_-20px_rgba(13,105,79,0.12)] hover:-translate-y-3 transition-all duration-700 group cursor-pointer flex flex-col relative"
                  >
                    <div className="h-64 overflow-hidden relative">
                      <LazyLoadImage 
                        src={course.image} 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                        effect="blur"
                      />
                      <div className="absolute top-6 left-6 flex gap-2">
                         <span className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-headline font-black text-[#0d694f] border border-emerald-50 shadow-lg uppercase tracking-widest">
                           {course.category}
                         </span>
                      </div>
                      <div className="absolute top-6 right-6">
                        <div className="bg-white/95 px-3 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-lg border border-emerald-50">
                           <Star className="h-4 w-4 text-[#ff7e5f] fill-current" />
                           <span className="text-[10px] font-headline font-black text-foreground">4.9</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-10 pb-8 flex-1 flex flex-col">
                      <h3 className="text-2xl font-headline font-black text-[#0d694f] leading-tight mb-4 group-hover:text-[#ff7e5f] transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                      
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 rounded-2xl bg-[#fcf8f1] flex items-center justify-center text-xs font-black text-[#0d694f] border border-[#0d694f]/10 shadow-sm uppercase">
                          {course.instructorName?.[0]}
                        </div>
                        <div className="space-y-0.5">
                           <div className="text-[10px] font-black text-[#ff7e5f] uppercase tracking-widest">Master</div>
                           <div className="text-sm font-headline font-bold text-muted-foreground">{course.instructorName}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-8 border-t border-[#fcf8f1] mt-auto">
                        <div className="flex gap-4">
                           <div className="flex items-center gap-2 text-muted-foreground">
                              <BookOpen className="h-4 w-4 text-[#0d694f]/40" />
                              <span className="text-[10px] font-black uppercase tracking-widest">{course.curriculum?.length} Lessons</span>
                           </div>
                           <div className="flex items-center gap-2 text-muted-foreground">
                              <BarChart className="h-4 w-4 text-[#0d694f]/40" />
                              <span className="text-[10px] font-black uppercase tracking-widest">{course.level}</span>
                           </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-10">
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black text-[#ff7e5f] uppercase tracking-widest mb-1">Investment</span>
                           <span className="text-3xl font-headline font-black text-[#0d694f]">Rs {course.pricing}</span>
                        </div>
                        <Button className="rounded-2xl w-14 h-14 bg-[#0d694f] hover:bg-[#ff7e5f] text-white p-0 shadow-lg shadow-[#0d694f]/20 transition-all border-none">
                          <ChevronRight className="h-6 w-6" />
                        </Button>
                      </div>
                    </div>
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
};

export default StudentViewCoursesPage;
