'use client';

export default function ResumeWindow() {
  return (
    <div className="w-full h-full -m-6" style={{ height: "calc(100% + 48px)" }}>
      <iframe
        src="/resume.pdf"
        className="w-full h-full border-0"
        title="Resume"
      />
    </div>
  );
}
