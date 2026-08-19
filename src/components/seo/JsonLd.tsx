export default function JsonLd({ data }: { data: object | object[] }) {
  const jsonLd = Array.isArray(data)
    ? data.map((d) => JSON.stringify(d)).join("\n")
    : JSON.stringify(data);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd }}
    />
  );
}
