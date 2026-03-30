import { useState } from 'react'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="container-page py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl text-brand-dark">Get in Touch</h1>
          <p className="text-brand-text-light text-sm mt-2">
            Questions about an order, stock, or anything else — we're here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 lg:gap-8">
          {/* Contact info sidebar */}
          <div className="md:col-span-2 space-y-4">
            <div className="card p-5 space-y-5">
              <div>
                <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-brand-dark mb-2">Visit Us</h3>
                <p className="text-sm text-brand-text-light leading-relaxed">
                  BookHeaven Store<br />
                  Main Mall<br />
                  Gaborone, Botswana
                </p>
              </div>
              <div className="border-t border-brand-border/40 pt-4">
                <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-brand-dark mb-2">Call / WhatsApp</h3>
                <a href="tel:+26771234567" className="text-sm text-brand-gold hover:text-brand-gold-dark transition-colors font-medium">
                  +267 71 234 567
                </a>
              </div>
              <div className="border-t border-brand-border/40 pt-4">
                <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-brand-dark mb-2">Email</h3>
                <a href="mailto:hello@bookheaven.co.bw" className="text-sm text-brand-gold hover:text-brand-gold-dark transition-colors font-medium">
                  hello@bookheaven.co.bw
                </a>
              </div>
              <div className="border-t border-brand-border/40 pt-4">
                <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-brand-dark mb-2">Hours</h3>
                <div className="text-sm text-brand-text-light space-y-1">
                  <div className="flex justify-between">
                    <span>Mon – Fri</span>
                    <span className="font-medium text-brand-text">8am – 6pm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span className="font-medium text-brand-text">9am – 4pm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span className="text-brand-error font-medium">Closed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/26771234567"
              target="_blank"
              rel="noopener noreferrer"
              className="card flex items-center gap-3 p-4 hover:border-brand-success/40 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-brand-success-light flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-brand-success" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-brand-dark group-hover:text-brand-success transition-colors">Message us on WhatsApp</p>
                <p className="text-xs text-brand-text-light">Quick responses during business hours</p>
              </div>
            </a>
          </div>

          {/* Form */}
          <div className="md:col-span-3">
            {submitted ? (
              <div className="card p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-brand-success-light flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-brand-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl text-brand-dark mb-2">Message sent</h3>
                <p className="text-sm text-brand-text-light mb-5">We'll get back to you as soon as we can.</p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }) }}
                  className="text-sm text-brand-gold hover:text-brand-gold-dark font-medium transition-colors"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="card p-5 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-brand-text-light mb-1.5 font-sans">Your Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="input-field"
                      placeholder="Full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-brand-text-light mb-1.5 font-sans">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="input-field"
                      placeholder="you@email.com"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-brand-text-light mb-1.5 font-sans">Subject</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    className="input-field"
                    placeholder="What can we help with?"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-brand-text-light mb-1.5 font-sans">Message</label>
                  <textarea
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    className="input-field h-32 resize-none"
                    placeholder="Tell us more..."
                    required
                  />
                </div>
                <button type="submit" className="btn-primary">Send Message</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
