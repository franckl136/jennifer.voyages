import { SoftImage } from "@/components/soft-image";
import type {
  BlockObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client";
import type { ReactNode } from "react";

type BlockWithKids = BlockObjectResponse & {
  _children?: BlockWithKids[];
};

function RichText({ items }: { items: RichTextItemResponse[] }) {
  if (!items?.length) return null;
  return (
    <>
      {items.map((fragment, i) => (
        <RichFragment key={i} fragment={fragment} />
      ))}
    </>
  );
}

function RichFragment({ fragment }: { fragment: RichTextItemResponse }) {
  const ann = fragment.annotations;
  const link =
    fragment.type === "text" && fragment.text.link
      ? fragment.text.link.url
      : undefined;
  const content = "plain_text" in fragment ? fragment.plain_text : "";

  let node: ReactNode = content;

  if (ann?.code) {
    node = (
      <code className="rounded-md bg-pastel-mist px-1.5 py-0.5 text-[0.9em] text-foreground">
        {node}
      </code>
    );
  }
  if (ann?.bold) node = <strong className="font-semibold">{node}</strong>;
  if (ann?.italic) node = <em>{node}</em>;
  if (ann?.strikethrough) node = <s>{node}</s>;
  if (link) {
    node = (
      <a
        href={link}
        className="font-medium text-accent-sky underline underline-offset-2 hover:text-accent-mint"
        target="_blank"
        rel="noopener noreferrer"
      >
        {node}
      </a>
    );
  }

  return <span>{node}</span>;
}

function ChildBlocks({ blocks }: { blocks: BlockWithKids[] | undefined }) {
  if (!blocks?.length) return null;
  return (
    <div className="mt-2 space-y-2 border-l-2 border-border pl-4">
      {blocks.map((b) => (
        <NotionBlock key={b.id} block={b} />
      ))}
    </div>
  );
}

function NotionBlock({ block }: { block: BlockWithKids }) {
  const kids = block._children;

  switch (block.type) {
    case "paragraph": {
      const p = block.paragraph;
      return (
        <p className="leading-relaxed text-foreground">
          <RichText items={p.rich_text} />
          <ChildBlocks blocks={kids} />
        </p>
      );
    }
    case "heading_1": {
      const h = block.heading_1;
      return (
        <h2 className="mt-10 text-balance text-2xl font-semibold tracking-tight text-foreground first:mt-0 sm:text-3xl">
          <RichText items={h.rich_text} />
        </h2>
      );
    }
    case "heading_2": {
      const h = block.heading_2;
      return (
        <h3 className="mt-8 text-2xl font-semibold tracking-tight text-foreground">
          <RichText items={h.rich_text} />
        </h3>
      );
    }
    case "heading_3": {
      const h = block.heading_3;
      return (
        <h4 className="mt-6 text-xl font-semibold text-foreground">
          <RichText items={h.rich_text} />
        </h4>
      );
    }
    case "bulleted_list_item": {
      const li = block.bulleted_list_item;
      return (
        <li className="leading-relaxed text-foreground">
          <RichText items={li.rich_text} />
          {kids?.length ? (
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {kids.map((c) => (
                <NotionBlock key={c.id} block={c} />
              ))}
            </ul>
          ) : null}
        </li>
      );
    }
    case "numbered_list_item": {
      const li = block.numbered_list_item;
      return (
        <li className="leading-relaxed text-foreground">
          <RichText items={li.rich_text} />
          {kids?.length ? (
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              {kids.map((c) => (
                <NotionBlock key={c.id} block={c} />
              ))}
            </ol>
          ) : null}
        </li>
      );
    }
    case "to_do": {
      const t = block.to_do;
      return (
        <div className="flex items-start gap-3 py-0.5 text-foreground">
          <span
            className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] leading-none ${
              t.checked
                ? "border-accent-mint bg-pastel-sage text-foreground"
                : "border-border bg-background"
            }`}
            aria-hidden
          >
            {t.checked ? "✓" : ""}
          </span>
          <span className={t.checked ? "text-muted line-through" : ""}>
            <RichText items={t.rich_text} />
          </span>
        </div>
      );
    }
    case "quote": {
      const q = block.quote;
      return (
        <blockquote className="border-l-4 border-accent-sky/50 pl-4 italic text-muted">
          <RichText items={q.rich_text} />
          <ChildBlocks blocks={kids} />
        </blockquote>
      );
    }
    case "divider":
      return <hr className="my-10 border-border" />;
    case "code": {
      const c = block.code;
      const code = c.rich_text.map((t) => t.plain_text).join("");
      return (
        <pre className="overflow-x-auto rounded-xl border border-border bg-pastel-sand/50 p-4 text-sm">
          {c.language ? (
            <span className="mb-2 block text-xs font-medium uppercase text-muted">
              {c.language}
            </span>
          ) : null}
          <code className="text-foreground">{code}</code>
        </pre>
      );
    }
    case "image": {
      const img = block.image;
      const rawUrl =
        img.type === "external" ? img.external.url : img.file.url;
      // Fichiers Notion signés : proxy stable (évite 403 après ~1 h)
      const url =
        img.type === "file"
          ? `/api/notion-file/${block.id}`
          : rawUrl;
      const caption = img.caption?.length
        ? img.caption.map((t) => t.plain_text).join("")
        : "";
      return (
        <figure className="my-8 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="relative aspect-[16/10] w-full bg-pastel-mist">
            <SoftImage
              src={url}
              alt={caption || "Illustration de l’article"}
            />
          </div>
          {caption ? (
            <figcaption className="px-4 py-3 text-center text-sm text-muted">
              {caption}
            </figcaption>
          ) : null}
        </figure>
      );
    }
    case "callout": {
      const c = block.callout;
      const icon = c.icon?.type === "emoji" ? c.icon.emoji : null;
      return (
        <div className="flex gap-3 rounded-2xl border border-border bg-pastel-mist/40 p-4">
          {icon ? (
            <span className="text-xl" aria-hidden>
              {icon}
            </span>
          ) : null}
          <div className="min-w-0 flex-1 space-y-2">
            <RichText items={c.rich_text} />
            <ChildBlocks blocks={kids} />
          </div>
        </div>
      );
    }
    case "toggle": {
      const t = block.toggle;
      return (
        <details className="group rounded-xl border border-border bg-card/60 p-4 open:bg-card">
          <summary className="cursor-pointer list-none font-medium text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
            <RichText items={t.rich_text} />
          </summary>
          <div className="mt-3 pl-1">
            <ChildBlocks blocks={kids} />
          </div>
        </details>
      );
    }
    case "bookmark": {
      const url = block.bookmark.url;
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block break-all rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-accent-sky underline-offset-2 hover:underline"
        >
          {url}
        </a>
      );
    }
    default:
      return null;
  }
}

function groupListBlocks(blocks: BlockWithKids[]) {
  const out: ReactNode[] = [];
  let i = 0;
  while (i < blocks.length) {
    const b = blocks[i];
    if (b.type === "bulleted_list_item") {
      const group: BlockWithKids[] = [];
      while (i < blocks.length && blocks[i].type === "bulleted_list_item") {
        group.push(blocks[i]);
        i++;
      }
      out.push(
        <ul
          key={group[0].id}
          className="my-4 list-disc space-y-2 pl-6 text-foreground"
        >
          {group.map((item) => (
            <NotionBlock key={item.id} block={item} />
          ))}
        </ul>,
      );
      continue;
    }
    if (b.type === "numbered_list_item") {
      const group: BlockWithKids[] = [];
      while (i < blocks.length && blocks[i].type === "numbered_list_item") {
        group.push(blocks[i]);
        i++;
      }
      out.push(
        <ol
          key={group[0].id}
          className="my-4 list-decimal space-y-2 pl-6 text-foreground"
        >
          {group.map((item) => (
            <NotionBlock key={item.id} block={item} />
          ))}
        </ol>,
      );
      continue;
    }
    out.push(<NotionBlock key={b.id} block={b} />);
    i++;
  }
  return out;
}

export function NotionContent({ blocks }: { blocks: BlockWithKids[] }) {
  return (
    <article className="max-w-3xl space-y-4 break-words text-base leading-relaxed">{groupListBlocks(blocks)}</article>
  );
}
