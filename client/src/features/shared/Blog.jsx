import { Link } from "react-router-dom";
import { BookOpen, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getAllBlogs } from "@/services/blogService";
import { toast } from "@/hooks/use-toast";

const insights = [
  {
    title: "Why transparent pricing matters",
    description:
      "Price discovery unlocks market confidence. Carbonix surfaces real-time credit pricing and historic trade data so buyers never overpay.",
  },
  {
    title: "Verifying every tonne",
    description:
      "Our due diligence pipeline double-checks registry certificates, project documentation, and live production metrics before a credit is listed.",
  },
  {
    title: "Turning climate action into engagement",
    description:
      "Gamified streaks, milestone badges, and automated reporting keep sustainability teams motivated while meeting compliance deadlines.",
  },
];

export default function Blog() {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await getAllBlogs({ status: "published" });
      setBlogPosts(response.data || []);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      toast({
        title: "Error",
        description: "Failed to load blog posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-brandMainColor" />
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="border-b border-border bg-muted/40 dark:bg-muted/20">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary shrink-0" />
          <div>
            <h1 className="text-lg font-semibold text-foreground leading-tight">
              Blog
            </h1>
            <p className="text-xs text-muted-foreground">
              Stories, playbooks, and trends powering credible climate action
            </p>
          </div>
        </div>
      </div>

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-12 lg:grid-cols-3 lg:px-8">
        {blogPosts.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-muted-foreground">
            No blog posts available at the moment. Check back soon!
          </div>
        ) : (
          blogPosts.map((post) => (
            <article
              key={post.slug}
              className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card/95 shadow-lg transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl"
            >
              {post.imageUrl && (
                <div className="w-full h-48 overflow-hidden">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              )}
              {!post.imageUrl && (
                <div
                  className={`h-2 w-full bg-gradient-to-r from-brandMainColor via-emerald-600 to-emerald-800`}
                />
              )}
              <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground dark:text-white/70">
                  <span>{post.category}</span>
                  <span>{post.readTime}</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground dark:text-white">
                    {post.title}
                  </h2>
                  <p className="mt-3 text-sm text-muted-foreground dark:text-white/80">
                    {post.excerpt}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-brandMainColor/40 bg-brandMainColor/10 px-3 py-1 text-xs font-medium text-brandMainColor dark:border-brandSubColor/50 dark:bg-brandSubColor/10 dark:text-brandSubColor"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground dark:text-white/70">
                  <span>{post.publishedOn}</span>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="text-sm font-semibold text-brandMainColor transition-colors hover:text-brandMainColor/80 dark:text-brandSubColor dark:hover:text-brandSubColor/90"
                  >
                    Read more →
                  </Link>
                </div>
              </div>
            </article>
          ))
        )}
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-16 lg:px-8">
        <div className="rounded-3xl border border-border bg-card/95 p-10 shadow-xl">
          <h2 className="text-2xl font-semibold text-foreground dark:text-white">
            Key takeaways for sustainability teams
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {insights.map((insight) => (
              <div
                key={insight.title}
                className="rounded-2xl border border-border bg-background/80 p-6 shadow-inner"
              >
                <h3 className="text-lg font-semibold text-foreground dark:text-white">
                  {insight.title}
                </h3>
                <p className="mt-3 text-sm text-muted-foreground dark:text-white/80">
                  {insight.description}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-brandMainColor/40 bg-brandMainColor/10 p-6 text-center dark:border-brandSubColor/40 dark:bg-brandSubColor/10">
            <h3 className="text-lg font-semibold text-brandMainColor dark:text-brandSubColor">
              Want these insights in your inbox?
            </h3>
            <p className="max-w-xl text-sm text-muted-foreground dark:text-white/80">
              We share a curated roundup of new climate policies, verified
              projects, and product updates every month. No spam, just
              actionable intelligence.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center rounded-full bg-brandMainColor px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brandMainColor/90 dark:bg-brandSubColor dark:text-slate-950 dark:hover:bg-brandSubColor/90"
            >
              Join Carbonix community
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
