import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Trophy, Users, Search, Share2, Award, Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen">
      <section className="px-4 pt-24 pb-32 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Discover & Participate in
              <span className="text-primary"> College Hackathons</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary">
              Your gateway to hackathons, workshops, and competitions across SIMATS colleges.
              Browse, bookmark, and participate — no login required.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link to="/events" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-background px-8 py-4 text-lg font-semibold rounded-xl transition-colors">
                Explore Events <ArrowRight className="h-5 w-5" />
              </Link>
              <Link to="/register" className="inline-flex items-center gap-2 border border-border text-text-primary hover:bg-surface px-8 py-4 text-lg font-semibold rounded-xl transition-colors">
                Get Started
              </Link>
            </div>
          </div>

          <div className="mt-24 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { icon: Calendar, value: '50+', label: 'Events Hosted' },
              { icon: Users, value: '5000+', label: 'Students Active' },
              { icon: Trophy, value: '10K+', label: 'Certificates Issued' },
            ].map(s => (
              <div key={s.label} className="glass rounded-2xl p-8 text-center">
                <s.icon className="mx-auto h-10 w-10 text-primary" />
                <div className="mt-4 font-heading text-3xl font-bold">{s.value}</div>
                <div className="text-text-secondary">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8 bg-surface/50">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-heading text-3xl font-bold text-center sm:text-4xl">Why Use HackathonHub?</h2>
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Search, title: 'Browse Freely', desc: 'No login needed to explore hackathons. Just search, filter, and discover.' },
              { icon: Share2, title: 'Share Bookmarks', desc: 'Save hackathons and share your curated list with a single link.' },
              { icon: Calendar, title: 'Multiple Views', desc: 'Switch between list, grid, or calendar view to find what works for you.' },
              { icon: Award, title: 'External Registration', desc: 'All registrations are handled via Google Forms, Devfolio, etc.' },
              { icon: Shield, title: 'Coordinator Tools', desc: 'Event coordinators get powerful tools to manage listings and analytics.' },
              { icon: Trophy, title: 'Stay Updated', desc: 'Find upcoming, ongoing, and past hackathons all in one place.' },
            ].map(f => (
              <div key={f.title} className="glass rounded-xl p-6 hover:border-primary/50 transition-colors">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-heading text-xl font-semibold">{f.title}</h3>
                <p className="mt-2 text-text-secondary">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
