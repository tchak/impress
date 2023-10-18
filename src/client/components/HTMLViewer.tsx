export function HTMLViewer({ html }: { html: string }) {
  return (
    <iframe
      className="m-2"
      width="700"
      height="1000"
      title="preview"
      srcDoc={html}
    ></iframe>
  );
}
