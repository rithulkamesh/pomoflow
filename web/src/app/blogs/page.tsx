import Footer from "@/components/footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import fs from "fs";
import matter from "gray-matter";
import Image from "next/image";
import Link from "next/link";
import path from "path";
import React from "react";
import BlogHeader from "./blogHeader";

export function generateStaticParams() {
  const files = fs.readdirSync(path.join("src/blogs"));

  const paths = files.map((filename) => ({
    slug: filename.replace(".mdx", ""),
  }));

  return paths;
}

interface Blog {
  meta: {
    title: string;
    author: string;
    date: string;
    image: string;
  };
  slug: string;
}

const Blogs: React.FC = () => {
  const blogDir = "src/blogs";

  const files = fs.readdirSync(path.join(blogDir));

  const blogs = files.map((filename) => {
    const fileContent = fs.readFileSync(path.join(blogDir, filename), "utf-8");

    const { data: frontMatter } = matter(fileContent);

    return {
      meta: frontMatter,
      slug: filename.replace(".mdx", ""),
    } as Blog;
  });

  return (
    <main className="flex flex-col mx-auto max-w-container px-4 gap-3 py-8">
      <BlogHeader />

      <section className="py-10">
        <h2 className="text-2xl font-bold">Latest Publications</h2>

        <div className="py-2">
          {blogs.map((blog: Blog) => (
            <Link href={"/blogs/" + blog.slug} passHref key={blog.slug}>
              <Card>
                <CardContent className="my-auto flex justify-between p-2 px-5">
                  <div className="flex flex-col justify-center text-left">
                    <CardTitle className="text-lg font-bold text-2xl">
                      {blog.meta.title}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      {blog.meta.author} - {blog.meta.date}
                    </CardDescription>
                  </div>
                  <Image
                    src={blog.meta.image}
                    alt={blog.meta.title}
                    width={300}
                    height={200}
                    className="rounded-md"
                  />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default Blogs;
