import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Send, ArrowRight } from "lucide-react";
import LegalLayout from "@/components/student-view/legal-layout";
import Loader from "@/components/common/loader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const PRIVACY_POLICY_CONTENT = `SkillNest (“we”, “our”, “us”) is dedicated to safeguarding your digital identity and learning journey. This policy outlines our rigorous data standards and your rights as a member of our atelier.

## 1. Information We Collect
We prioritize data minimization, collecting only what is essential for a premium experience:

### a. Personal Identity
- **Legal Name & Email**: Primary identifiers for account security.
- **Biographic Details**: Optional photo and bio for your public learning profile.

### b. Academic & Usage Data
- **Course Lifecycle**: Enrollment history, lecture progress, and completion milestones.
- **Engagement Logs**: Interactive session data to optimize teaching methods.

### c. Financial Security
- **Transaction Metadata**: Date, amount, and product (processed via Stripe/PayPal).
- **Zero-Storage Policy**: We never store, see, or process your raw card details.

### d. Technical Fingerprint
- **Environment**: IP address, browser engine, and device type for security auditing.

## 2. Strategic Data Usage
Your information powers the SkillNest ecosystem:
- **Personalization**: Tailoring course recommendations to your skill level.
- **Analytics**: Tracking aggregate performance to improve platform speed and UI.
- **Communication**: Critical updates, security alerts, and creator-led notifications.

## 3. Data Sovereignty & Sharing
We treat your data as a private asset. **We do not sell personal information.**
- **Service Partners**: Secure data handshakes with hosting (AWS) and payment providers.
- **Educators**: Limited access to student names and progress for instructional support.
- **Legal Mandates**: Disclosure only when strictly required by enforceable judicial orders.

## 4. Cookies & Personalization
We use "Essential Cookies" to maintain your session and "Preference Cookies" to remember your workspace settings (e.g., Dark Mode). You can manage these via your browser’s privacy dashboard.

## 5. Security Architecture
We employ industry-leading safeguards:
- **Encryption**: TLS 1.3 for data in transit and AES-256 for data at rest.
- **Authentication**: Multi-factor ready systems and secure hash-based password storage.

## 6. Your Rights
As a SkillNest user, you possess full control:
- **Portability**: Request a digital export of your learning data.
- **Correction**: Instant tools to update your profile and credentials.
- **Erasure**: Permanently delete your account and associated records (subject to legal retention).

For inquiries, contact: **support@skillnest.com**

## 7. Retention Standards
Data is retained only while your account remains "Active." Dormant accounts are flagged for deletion after 24 months of inactivity to protect your privacy.

## 8. Third-Party Integrations
We use best-in-class tools (hosting, analytics, payments) that maintain their own strict privacy standards. We audit these partners annually for compliance.

## 9. Minor's Privacy
SkillNest is an adult learning platform (13+). We do not knowingly target or collect data from children under this threshold.

## 10. Iterative Updates
This policy evolves with technology. Significant changes will be announced via your dashboard 30 days prior to implementation.

## 11. Support & Contact
If you have questions regarding these standards:
- 📧 **Direct Email**: support@skillnest.com
- 🌐 **Online Portal**: SkillNest Support Center`;

const TERMS_OF_SERVICE_CONTENT = `Welcome to SkillNest. By entering our learning atelier, you agree to these Terms of Service. These rules ensure a high-quality, respectful, and secure environment for all creators and students.

## 1. Acceptance & Eligibility
By creating an account, you affirm you are at least 13 years old and agree to be bound by these Terms and our Privacy Policy. Use of the platform constitutes "Active Acceptance."

## 2. Account Integrity
Protect your credentials. You are legally responsible for all activity under your banner.
- **Accuracy**: Keep your profile details current.
- **Security**: Report any suspected unauthorized access immediately.
- **Authority**: SkillNest reserves the right to audit and suspend accounts for suspicious activity.

## 3. Platform Conduct
We maintain a zero-tolerance policy for abuse. You agree **NOT** to:
- **Infringe**: Scrape, download, or redistribute course content without explicit license.
- **Disrupt**: Inject malware or interfere with platform API performance.
- **Mislead**: Impersonate other users or provide fraudulent billing data.

## 4. Intellectual Property Rights
SkillNest and its Educators own all original works on this platform.
- **Student License**: Upon purchase, you receive a non-exclusive, non-transferable license for personal, lifelong learning.
- **Prohibitions**: Commercial redistribution or public screening is strictly prohibited.

## 5. Commercial Transactions
SkillNest facilitates secure, global commerce:
- **Pricing**: Dynamic and subject to localized promotional adjustments.
- **Refunds**: Governed by our "Atelier Satisfaction Guarantee" (typically 30 days).
- **Billing**: Handled via third-party secure gateways; SkillNest does not store raw financial data.

## 6. Course Lifecycle
Content availability is subject to change. While we strive for 100% uptime, SkillNest may update, remove, or modify courses to maintain educational accuracy or legal standards.

## 7. Limitation of Responsibility
SkillNest is a facilitator of knowledge. We are not liable for:
- **Career Outcomes**: We provide the tools; success depends on individual application.
- **Service Gaps**: Occasional maintenance downtimes or ISP interruptions.
- **External Links**: Third-party resources provided within course materials.

## 8. Termination of Access
We reserve the right to revoke platform access for:
- Breach of Conduct (as outlined in Section 3).
- Sustained periods of account inactivity (24+ months).
- Legal compliance or regulatory requirements.

## 9. Governing Laws
These Terms are governed by international commerce standards and the laws of the jurisdiction where SkillNest is headquartered.

## 10. Continual Evolution
We update these Terms as we launch new features. Continuing to learn on SkillNest after an update signifies your acceptance of the revised Terms.

## 11. Contact & Support
If you have questions regarding your obligations:
- 📧 **Direct Email**: support@skillnest.com
- 🌐 **Help Center**: SkillNest Support Portal`;

const SupportHubPage = () => {
  const location = useLocation();
  const [document, setDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine view from path
  const isHelpCenter = location.pathname.includes("help-center");
  const type = location.pathname.includes("privacy") ? "privacy" : "terms";
  const title = isHelpCenter ? "Help Center" : type === "privacy" ? "Privacy Policy" : "Terms of Service";

  useEffect(() => {
    if (isHelpCenter) {
      setIsLoading(false);
      return;
    }

    const fetchDocument = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/support/legal/${type}`);
        const result = await response.json();
        if (result.success) {
          setDocument(result.data);
        }
      } catch (error) {
        console.error(`Error fetching ${type}:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, [type, isHelpCenter]);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target);
    const data = {
      email: formData.get('email'),
      message: formData.get('message')
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/support/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (result.success) {
        alert("Message sent successfully! We'll get back to you soon.");
        e.target.reset();
      } else {
        alert(result.message || "Failed to send message.");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcf8f1]">
        <Loader />
      </div>
    );
  }

  const effectiveContent = (type === 'privacy' && !document?.content) 
    ? PRIVACY_POLICY_CONTENT 
    : (type === 'terms' && !document?.content) 
    ? TERMS_OF_SERVICE_CONTENT 
    : document?.content;

  return (
    <LegalLayout 
      title={title} 
      content={effectiveContent}
      lastUpdated={document ? new Date(document.updatedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      }) : null}
    >
      {isHelpCenter ? (
        <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: "Student Guide", desc: "Learn how to enroll and track progress." },
              { title: "Educator Center", desc: "Everything you need to create courses." }
            ].map((item, i) => (
              <div key={i} className="group p-8 bg-white border border-emerald-900/5 rounded-[2rem] hover:border-[#ff7e5f] transition-all cursor-pointer shadow-sm hover:shadow-xl hover:shadow-emerald-900/5">
                <h4 className="text-lg font-headline font-black text-emerald-950 mb-2 group-hover:text-[#ff7e5f] transition-colors">{item.title}</h4>
                <p className="text-emerald-900/40 text-sm font-headline font-bold mb-4">{item.desc}</p>
                <ArrowRight className="h-5 w-5 text-emerald-900/10 group-hover:text-[#ff7e5f] transition-all transform group-hover:translate-x-1" />
              </div>
            ))}
          </div>

          {/* Contact Form Section */}
          <section className="bg-emerald-900 rounded-[3rem] p-10 lg:p-14 text-white relative overflow-hidden shadow-2xl shadow-emerald-950/20">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                  <Send className="h-6 w-6 text-[#ff7e5f]" />
                </div>
                <h3 className="text-3xl lg:text-4xl font-headline font-black mb-4 tracking-tight leading-tight">
                  Still have <span className="text-[#ff7e5f]">questions?</span>
                </h3>
                <p className="text-emerald-100/60 font-headline font-bold text-lg mb-8">
                  Write directly to the SkillNest creators for personalized support and platform insights.
                </p>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#ff7e5f]" />
                    <span className="text-sm font-headline font-bold text-emerald-100/40 uppercase tracking-widest">Email: creator@skillnest.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#ff7e5f]" />
                    <span className="text-sm font-headline font-bold text-emerald-100/40 uppercase tracking-widest">Response: Within 24 Hours</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <Input 
                  name="email"
                  type="email"
                  required
                  placeholder="Your Email"
                  className="h-14 bg-white/5 border-white/10 rounded-xl text-white font-headline font-bold placeholder:text-white/20"
                />
                <textarea 
                  name="message"
                  required
                  rows={4}
                  placeholder="Your Message"
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white font-headline font-bold placeholder:text-white/20 outline-none focus:ring-1 focus:ring-[#ff7e5f] transition-all resize-none"
                />
                <Button 
                  disabled={isSubmitting}
                  className="w-full h-14 bg-[#ff7e5f] hover:bg-[#ff6b4a] text-white rounded-xl font-headline font-black text-sm uppercase tracking-widest shadow-lg shadow-orange-900/20"
                >
                  {isSubmitting ? "Sending..." : "Submit Message"}
                </Button>
              </form>
            </div>
          </section>
        </div>
      ) : (
        <div className="legal-content max-h-[60vh] overflow-y-auto pr-6 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 scrollbar-thin scrollbar-thumb-emerald-900/10 scrollbar-track-transparent">
          {effectiveContent ? (
            effectiveContent.split('## ').map((section, index) => {
              if (index === 0 && !section.trim()) return null;
              
              const lines = section.split('\n');
              const heading = lines[0].trim();
              const body = lines.slice(1).join('\n').trim();
              const id = heading.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");

              // Special handling for the lead/introduction section (no number)
              const isIntroduction = index === 0 || !/^\d+\./.test(heading);

              return (
                <section key={index} id={id} className="scroll-mt-6 border-l border-emerald-900/10 pl-6 py-2 transition-all hover:border-[#ff7e5f]">
                  {isIntroduction ? (
                    <div className="text-base text-emerald-900/80 leading-relaxed font-headline font-semibold italic mb-6">
                      {heading && <div className="text-emerald-950 not-italic mb-2 text-lg font-black uppercase tracking-widest opacity-20">Intro</div>}
                      {body || heading}
                    </div>
                  ) : (
                    <>
                      <h2 className="text-base font-headline font-bold mb-3 tracking-snug flex items-center flex-wrap gap-[0.35rem]">
                        <span className="text-emerald-950">{heading.split(' ').slice(0, 2).join(' ')}</span>
                        <span className="text-[#ff7e5f] font-black">{heading.split(' ').slice(2).join(' ')}</span>
                      </h2>
                      <div className="text-emerald-900/60 leading-relaxed font-headline font-medium text-sm whitespace-pre-wrap space-y-4">
                        {body.split('\n').map((line, lIdx) => {
                          if (line.startsWith('### ')) {
                            return (
                              <h3 key={lIdx} className="text-emerald-900 text-xs font-black uppercase tracking-wider mt-6 mb-2">
                                {line.replace('### ', '')}
                              </h3>
                            );
                          }
                          return line ? <p key={lIdx}>{line}</p> : <div key={lIdx} className="h-2" />;
                        })}
                      </div>
                    </>
                  )}
                </section>
              );
            })
          ) : (
            <p className="text-emerald-900/40 font-headline font-bold text-center py-20 italic">
              Legal documentation currently unavailable. Please check back later.
            </p>
          )}
        </div>
      )}
    </LegalLayout>
  );
};

export default SupportHubPage;
