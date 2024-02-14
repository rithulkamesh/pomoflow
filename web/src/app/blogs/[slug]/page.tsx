/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import fs from "fs";
import matter from "gray-matter";
import path from "path";

import Footer from "@/components/footer";
import { MDXRemote } from "next-mdx-remote/rsc";
import Image from "next/image";
import remarkGfm from "remark-gfm";
import BlogHeader from "../blogHeader";

interface Props {
  params: {
    slug: string;
  };
}

export function generateMetadata({ params }: Props) {
  const blog = getPost(params);

  return {
    title: blog.frontMatter.title,
    description: blog.frontMatter.description,
  };
}

export function generateStaticParams() {
  const files = fs.readdirSync(path.join("src/blogs"));

  const paths = files.map((filename) => ({
    slug: filename.replace(".mdx", ""),
  }));

  return paths;
}

const options = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [],
  },
};

const Post: React.FC<Props> = ({ params }) => {
  const props = getPost(params);

  return (
    <main className="flex flex-col mx-auto max-w-container px-4 gap-3 py-8">
      <BlogHeader />
      <article className="py-10 prose w-full prose-sm md:prose-base lg:prose-lg prose-slate dark:!prose-invert mx-auto">
        <Image
          src={props.frontMatter.image}
          alt={"blog-image"}
          width={800}
          height={400}
          className="rounded-lg"
        />
        <h1>{props.frontMatter.title}</h1>
        <hr className="light:bg-black" />
        <MDXRemote source={props.content} options={options} />
      </article>
      <Footer />
    </main>
  );
};

const getPost = ({ slug }: { slug: string }) => {
  const markdownFile = fs.readFileSync(
    path.join("src/blogs", slug + ".mdx"),
    "utf-8"
  );

  const { data: frontMatter, content } = matter(markdownFile);

  return {
    frontMatter,
    slug,
    content,
  };
};

export default Post;
