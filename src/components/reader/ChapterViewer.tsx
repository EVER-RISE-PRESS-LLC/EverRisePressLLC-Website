interface ChapterViewerProps {
  title: string;
  body: string;
}

export default function ChapterViewer({ title, body }: ChapterViewerProps) {
  return (
    <article className="max-w-[720px] mx-auto px-6 md:px-12 py-12 md:py-16">
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-8 leading-tight">
        {title}
      </h1>
      <div
        className="prose prose-lg prose-charcoal max-w-none
          prose-headings:font-heading prose-headings:text-charcoal
          prose-p:text-text-body prose-p:leading-[1.75] prose-p:mb-6
          prose-strong:text-charcoal prose-strong:font-bold
          prose-em:text-charcoal
          first:[&_p:first-of-type]:first-letter:font-heading 
          first:[&_p:first-of-type]:first-letter:text-5xl 
          first:[&_p:first-of-type]:first-letter:font-bold 
          first:[&_p:first-of-type]:first-letter:text-gold
          first:[&_p:first-of-type]:first-letter:float-left 
          first:[&_p:first-of-type]:first-letter:mr-2 
          first:[&_p:first-of-type]:first-letter:mt-1"
        dangerouslySetInnerHTML={{ __html: body }}
      />
    </article>
  );
}
