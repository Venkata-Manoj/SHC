import { Share2, Twitter, Linkedin, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ShareButtons({ event }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/events/${event._id}`;
  const text = `Check out ${event.name} at SIMATS Hackathons!`;

  const shareLinks = [
    { name: 'Twitter', icon: Twitter, href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}` },
    { name: 'LinkedIn', icon: Linkedin, href: `https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
    { name: 'WhatsApp', icon: Share2, href: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}` },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Link copied!');
    } catch {
      toast.error('Failed to copy link');
    }
  }

  return (
    <div className="flex items-center gap-2">
      {shareLinks.map(s => (
        <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer"
          className="p-2 bg-elevated hover:bg-border rounded-lg transition-colors"
          title={`Share on ${s.name}`} aria-label={`Share on ${s.name}`}>
          <s.icon className="h-4 w-4" />
        </a>
      ))}
      <button onClick={copyLink} className="p-2 bg-elevated hover:bg-border rounded-lg transition-colors" title="Copy link" aria-label="Copy event link">
        {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}
