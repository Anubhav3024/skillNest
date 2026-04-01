import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MoveLeft, Clock, Eye, ThumbsUp, ThumbsDown } from "lucide-react";
import ReactMarkdown from "react-markdown";
import BackgroundDecorations from "@/components/background-decorations";
import Loader from "@/components/common/loader";

const HelpArticlePage = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/support/article/${slug}`);
        const result = await response.json();
        if (result.success) {
          setArticle(result.data);
        }
      } catch (error) {
        console.error("Error fetching article:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcf8f1]">
        <Loader />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcf8f1] gap-6">
        <h2 className="text-3xl font-headline font-black text-emerald-950">Article not found</h2>
        <Link to="/help-center" className="text-emerald-900/60 hover:text-emerald-900 font-headline font-bold flex items-center gap-2">
          <MoveLeft className="h-4 w-4" />
          Back to Help Center
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcf8f1] relative flex flex-col pt-20">
      <BackgroundDecorations />
      
      <div className="max-w-4xl mx-auto w-full px-6 py-12 lg:py-20 relative z-10 flex-1">
        <Link 
          to={`/help-center/${article.categoryId?.slug || ""}`}
          className="group flex items-center gap-2 text-emerald-900/60 hover:text-emerald-900 font-headline font-bold text-sm transition-colors mb-12"
        >
          <MoveLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to {article.categoryId?.name || "Categories"}
        </Link>

        {/* Article Header */}
        <header className="mb-12 border-b border-emerald-900/5 pb-12">
          <div className="flex items-center gap-3 text-[#ff7e5f] font-headline font-black text-xs uppercase tracking-widest mb-6">
            <span>Help Article</span>
            <span className="w-1 h-1 rounded-full bg-emerald-900/10" />
            <span>{article.categoryId?.name}</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-headline font-black text-emerald-950 mb-8 tracking-tighter leading-tight italic">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-emerald-900/40 font-headline font-bold text-xs uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Published {new Date(article.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              {article.viewsCount} Views
            </div>
          </div>
        </header>

        {/* Content */}
        <article className="bg-white rounded-[3rem] p-8 lg:p-16 shadow-2xl shadow-emerald-900/5 border border-emerald-900/5 mb-12">
          <div className="prose prose-emerald lg:prose-xl max-w-none prose-headings:font-headline prose-headings:font-black prose-headings:tracking-tighter prose-p:text-emerald-900/70 prose-p:leading-relaxed">
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </div>
        </article>

        {/* Feedback Section */}
        <section className="bg-emerald-900 rounded-[3rem] p-12 text-center text-white relative overflow-hidden shadow-2xl shadow-emerald-950/20">
          <BackgroundDecorations />
          <div className="relative z-10">
            <h3 className="text-2xl font-headline font-black mb-4 tracking-tight">Was this article helpful?</h3>
            <p className="text-emerald-100/60 text-sm font-headline font-bold mb-8">
              Your feedback help us improve the documentation for everyone.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button 
                onClick={() => setFeedback('yes')}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-headline font-black text-sm transition-all border-none ${
                    feedback === 'yes' 
                      ? "bg-[#ff7e5f] text-white" 
                      : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
                }`}
              >
                <ThumbsUp className="h-4 w-4" />
                Yes, it helped!
              </button>
              <button 
                onClick={() => setFeedback('no')}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-headline font-black text-sm transition-all border-none ${
                    feedback === 'no' 
                      ? "bg-[#ff7e5f] text-white" 
                      : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
                }`}
              >
                <ThumbsDown className="h-4 w-4" />
                No, I need more help
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HelpArticlePage;
