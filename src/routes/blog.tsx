/**
 * Blog Page
 * Following Supabase blog UI design: https://supabase.com/blog
 */

import { createFileRoute } from "@tanstack/react-router";
import { blogPosts, getFeaturedPost, BlogPost } from "~/lib/blog/data";
import { Header } from "~/components/header";
import { Footer } from "~/components/footer";
import { AnimatedPageBackground } from "~/components/background/animated-page-background";

export const Route = createFileRoute("/blog")({
  component: BlogPage,
});

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="group cursor-pointer">
      <a href={`/blog/${post.slug}`}>
        <div className="border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 h-full flex flex-col">
          <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary/30"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" x2="8" y1="13" y2="13" />
              <line x1="16" x2="8" y1="17" y2="17" />
              <line x1="10" x2="8" y1="9" y2="9" />
            </svg>
          </div>
          <div className="p-5 flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              {post.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-medium px-2 py-1 rounded-full bg-primary text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">{post.excerpt}</p>
            <div className="flex items-center gap-3 pt-4 border-t">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{post.author.name}</p>
                <p className="text-xs text-muted-foreground">
                  {post.publishedAt} · {post.readTime}
                </p>
              </div>
            </div>
          </div>
        </div>
      </a>
    </article>
  );
}

function FeaturedPost({ post }: { post: BlogPost }) {
  return (
    <article className="group cursor-pointer mb-12">
      <a href={`/blog/${post.slug}`}>
        <div className="grid md:grid-cols-2 gap-8 items-center border rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
          <div className="aspect-video md:aspect-auto bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary/30"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" x2="8" y1="13" y2="13" />
              <line x1="16" x2="8" y1="17" y2="17" />
              <line x1="10" x2="8" y1="9" y2="9" />
            </svg>
          </div>
          <div className="p-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary text-primary-foreground">
                Featured
              </span>
              {post.tags.slice(0, 1).map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
              {post.title}
            </h2>
            <p className="text-muted-foreground mb-6 text-lg leading-relaxed">{post.excerpt}</p>
            <div className="flex items-center gap-3">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-medium text-foreground">{post.author.name}</p>
                <p className="text-sm text-muted-foreground">
                  {post.publishedAt} · {post.readTime}
                </p>
              </div>
            </div>
          </div>
        </div>
      </a>
    </article>
  );
}

function BlogPage() {
  const featuredPost = getFeaturedPost();
  const recentPosts = blogPosts.filter((p) => !p.featured);

  return (
    <div className="relative isolate min-h-screen bg-background">
      <AnimatedPageBackground />
      <Header />

      {/* Main Content */}
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">Blog</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Latest updates, tutorials, and insights from the TSS Elysia team
            </p>
          </div>

          {/* Featured Post */}
          {featuredPost && <FeaturedPost post={featuredPost} />}

          {/* Recent Posts Grid */}
          <section>
            <h2 className="text-2xl font-bold mb-6 text-foreground">Recent Posts</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}