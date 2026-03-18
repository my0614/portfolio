'use client';
import { Mail, Github, Linkedin } from "lucide-react";

const ContactWindow = () => {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Drop me a line. I'd love to hear from you.</p>

      <div className="space-y-3">
        {[
          { icon: Mail, label: "hello@example.com", href: "mailto:hello@example.com" },
          { icon: Github, label: "github.com/username", href: "https://github.com" },
          { icon: Linkedin, label: "linkedin.com/in/username", href: "https://linkedin.com" },
        ].map(({ icon: Icon, label, href }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg bg-foreground/[0.03] border border-foreground/[0.05] hover:border-primary/20 transition-all group"
          >
            <Icon size={16} strokeWidth={1} className="text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-sm text-foreground/70 group-hover:text-foreground/90 transition-colors">{label}</span>
          </a>
        ))}
      </div>

      <div className="space-y-3">
        <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Quick Message</h3>
        <input
          placeholder="Your email"
          className="w-full px-3 py-2 text-sm rounded-lg bg-foreground/[0.03] border border-foreground/[0.05] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/30"
        />
        <textarea
          placeholder="What's on your mind?"
          rows={3}
          className="w-full px-3 py-2 text-sm rounded-lg bg-foreground/[0.03] border border-foreground/[0.05] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/30 resize-none"
        />
        <button className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
          Send
        </button>
      </div>
    </div>
  );
};

export default ContactWindow;
