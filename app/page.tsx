import Link from "next/link";

const services = [
  { code: "01", title: "Learner Licence", copy: "A guided application that saves as you go.", href: "/login" },
  { code: "02", title: "Track application", copy: "See what is done and what happens next.", href: "/track" },
  { code: "03", title: "Book an appointment", copy: "Choose a clear date and time at a demo RTO.", href: "/appointments" },
];

export default function Home() {
  return (
    <main>
      <div className="demo-strip">Demo mode · Fictional information only</div>
      <header className="site-header wrap">
        <Link className="brand" href="/" aria-label="Smart RTO home"><span className="brand-mark">SR</span><span>Smart RTO<small>Citizen portal</small></span></Link>
        <nav aria-label="Main navigation"><Link href="/services">Services</Link><Link href="/track">Track</Link><Link href="/how-it-works">Guides</Link><Link href="/help">Help</Link></nav>
        <Link className="button secondary" href="/login">Sign in</Link>
      </header>
      <section className="hero wrap">
        <div className="hero-copy">
          <p className="eyebrow">A simpler way through RTO services</p>
          <h1>Less confusion.<br /><span>More progress.</span></h1>
          <p className="lede">Smart RTO explains every step, remembers your progress and tells you exactly what to do next.</p>
          <div className="hero-actions"><Link className="button primary" href="/login">Try the demo account <span aria-hidden="true">→</span></Link><Link className="text-link" href="/how-it-works">See how it works</Link></div>
          <p className="microcopy">No real Aadhaar, payment or government records are used.</p>
        </div>
        <aside className="journey-card" aria-label="Example learner licence progress">
          <div className="card-head"><span className="badge">Demo / Mock service</span><span>8 min</span></div>
          <h2>Learner Licence</h2><p>Your application, explained one step at a time.</p>
          <div className="progress-row"><strong>60% complete</strong><span>Step 5 of 8</span></div><div className="progress-track"><span /></div>
          <ol className="mini-steps"><li className="done"><i>✓</i><span>Eligibility & identity<small>Completed</small></span></li><li className="active"><i>5</i><span>Choose your RTO<small>Current step</small></span></li><li><i>6</i><span>Documents & appointment<small>Up next</small></span></li></ol>
          <Link className="button primary full" href="/login">Continue application</Link><p className="saved">✓ Draft automatically saved</p>
        </aside>
      </section>
      <section className="services-section wrap">
        <div className="section-heading"><div><p className="eyebrow">Start with what you need</p><h2>Everyday services, clearly explained</h2></div><Link className="text-link" href="/services">View all services →</Link></div>
        <div className="service-grid">{services.map((service) => <Link className="service-card" href={service.href} key={service.title}><span>{service.code}</span><h3>{service.title}</h3><p>{service.copy}</p><b aria-hidden="true">↗</b></Link>)}</div>
      </section>
      <section className="trust-band"><div className="wrap trust-grid"><div><strong>Built around citizens</strong><p>Plain language, accessible controls and progress you can see.</p></div><div><strong>Your demo data stays local</strong><p>This prototype does not connect to government systems.</p></div><div><strong>Clear about what is simulated</strong><p>Mock services are labelled at every important step.</p></div></div></section>
      <footer><div className="wrap footer-grid"><div><span className="brand footer-brand"><span className="brand-mark">SR</span><span>Smart RTO<small>Independent hackathon prototype</small></span></span></div><p>Smart RTO is an independent hackathon prototype. It is not affiliated with MoRTH, NIC, Parivahan, Sarathi, VAHAN or any State Transport Department.</p><div><Link href="/about">About</Link><Link href="/security">Security</Link><Link href="/privacy">Privacy</Link></div></div></footer>
    </main>
  );
}
