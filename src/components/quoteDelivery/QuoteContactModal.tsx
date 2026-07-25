/**
 * components/quoteDelivery/QuoteContactModal.tsx
 *
 * Reusable contact-capture modal for "Request a Quote" actions. Owns form
 * state, validation, submission-ID generation, and honest success/failure
 * messaging (mirrors src/components/configurator/QuoteRequestPanel.jsx,
 * which this replaces — that component was never actually mounted anywhere).
 * Payload construction is the caller's job (`buildPayload`), since the PDP
 * configurator and the cart have unrelated source data shapes.
 */

import React, { useState } from 'react';
import { X, CheckCircle, Send, AlertTriangle, Loader } from 'lucide-react';
import { generateSubmissionId, validateContactForm, submitQuoteRequest } from '@/services/quoteRequestService';
import type { QuoteContact, QuotePayload, QuoteSubmissionResult } from '@/adapters/quoteDelivery';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };
const SALES_PHONE = '800-621-9959';

const FIELD_STYLE: React.CSSProperties = {
  ...FS,
  width: '100%',
  fontSize: 13,
  padding: '8px 10px',
  border: '1.5px solid #d0d0d0',
  outline: 'none',
  background: '#fff',
  color: '#1a1a1a',
  boxSizing: 'border-box',
};

const FIELD_ERROR_STYLE: React.CSSProperties = { ...FIELD_STYLE, borderColor: '#dc2626' };

const EMPTY_FORM = { name: '', agency: '', email: '', phone: '', vehicleCount: '', notes: '' };

interface FieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

function Field({ label, required, error, children }: FieldProps) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#1a2744', marginBottom: 4 }}>
        {label}{required && <span style={{ color: '#c8102e', marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {error && <p style={{ margin: '3px 0 0', fontSize: 11, color: '#dc2626' }}>{error}</p>}
    </div>
  );
}

export interface QuoteContactModalProps {
  onClose: () => void;
  title: string;
  description?: string;
  buildPayload: (contact: QuoteContact, submissionId: string) => QuotePayload;
}

type Status = 'idle' | 'submitting' | 'success' | 'error';

export default function QuoteContactModal({ onClose, title, description, buildPayload }: QuoteContactModalProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [submitError, setSubmitError] = useState('');
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<string | null>(null);
  const [mailtoUrl, setMailtoUrl] = useState<string | null>(null);
  const [submissionId] = useState(() => generateSubmissionId());

  const set = (field: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { valid, errors } = validateContactForm(form) as unknown as { valid: boolean; errors: Record<string, string> };
    if (!valid) { setFieldErrors(errors); return; }
    setFieldErrors({});
    setStatus('submitting');
    setSubmitError('');

    const contact: QuoteContact = {
      name: form.name.trim(),
      agency: form.agency.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      vehicleCount: form.vehicleCount || undefined,
      notes: form.notes.trim() || undefined,
    };

    const payload = buildPayload(contact, submissionId);
    const result: QuoteSubmissionResult = await submitQuoteRequest(payload).catch((err: unknown): QuoteSubmissionResult => ({
      success: false,
      error: err instanceof Error ? err.message : 'An unexpected error occurred.',
    }));

    if (result.referenceId) setReferenceId(result.referenceId);
    if (result.deliveryMethod) setDeliveryMethod(result.deliveryMethod);
    if (result.mailtoUrl) setMailtoUrl(result.mailtoUrl);

    if (result.success) {
      setStatus('success');
    } else {
      setStatus('error');
      setSubmitError(result.error || 'An unexpected error occurred. Please try again.');
    }
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 999 }} />
      <div style={{
        ...FS,
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000,
        background: '#fff', width: 'calc(100% - 32px)', maxWidth: 520, maxHeight: '88vh',
        display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', borderRadius: 3, overflow: 'hidden',
      }}>
        <div style={{ background: '#1a2744', padding: '14px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#fff' }}>{title}</p>
            {description && <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>{description}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', padding: 4, flexShrink: 0 }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          {status === 'success' ? (
            <div style={{ padding: '28px 24px', textAlign: 'center' }}>
              <CheckCircle size={36} style={{ color: '#16a34a', margin: '0 auto 12px' }} />
              <p style={{ fontSize: 15, fontWeight: 700, color: '#15803d', marginBottom: 6 }}>
                {deliveryMethod === 'mailto' ? 'Almost There — Finish Sending Your Email' : 'Quote Request Submitted'}
              </p>
              <p style={{ fontSize: 13, color: '#166534', margin: 0 }}>
                {deliveryMethod === 'mailto'
                  ? 'We opened your email client with your request pre-filled. Click Send in your email client to complete the request.'
                  : 'Your request has been received. A representative will be in touch shortly.'}
              </p>
              {deliveryMethod === 'mailto' && mailtoUrl && (
                <p style={{ fontSize: 12, color: '#166534', margin: '10px 0 0' }}>
                  Nothing opened? <a href={mailtoUrl} style={{ color: '#15803d', fontWeight: 700 }}>Click here to email us directly</a>, or call{' '}
                  <a href={`tel:${SALES_PHONE}`} style={{ color: '#15803d', fontWeight: 700 }}>{SALES_PHONE}</a>.
                </p>
              )}
              {referenceId && (
                <p style={{ marginTop: 14, fontSize: 13, fontWeight: 700, color: '#15803d' }}>Reference #: {referenceId}</p>
              )}
              <button
                type="button"
                onClick={onClose}
                style={{ ...FS, marginTop: 16, background: '#1a2744', color: '#fff', border: 'none', padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ padding: '20px' }} noValidate>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                <Field label="Full Name" required error={fieldErrors.name}>
                  <input value={form.name} onChange={set('name')} placeholder="Jane Smith"
                    style={fieldErrors.name ? FIELD_ERROR_STYLE : FIELD_STYLE} />
                </Field>
                <Field label="Agency / Company" required error={fieldErrors.agency}>
                  <input value={form.agency} onChange={set('agency')} placeholder="Metro Police Dept."
                    style={fieldErrors.agency ? FIELD_ERROR_STYLE : FIELD_STYLE} />
                </Field>
                <Field label="Email Address" required error={fieldErrors.email}>
                  <input type="email" value={form.email} onChange={set('email')} placeholder="you@agency.gov"
                    style={fieldErrors.email ? FIELD_ERROR_STYLE : FIELD_STYLE} />
                </Field>
                <Field label="Phone">
                  <input value={form.phone} onChange={set('phone')} placeholder="(555) 000-0000" style={FIELD_STYLE} />
                </Field>
              </div>

              <Field label="Number of Vehicles">
                <input value={form.vehicleCount} onChange={set('vehicleCount')} placeholder="e.g. 12" style={FIELD_STYLE} />
              </Field>

              <Field label="Additional Notes">
                <textarea value={form.notes} onChange={set('notes')} rows={3}
                  placeholder="Special requirements, delivery timeline..."
                  style={{ ...FIELD_STYLE, resize: 'vertical' }} />
              </Field>

              {status === 'error' && (
                <div style={{ display: 'flex', gap: 8, padding: '10px 12px', background: '#fef2f2', border: '1px solid #fecaca', marginBottom: 14 }}>
                  <AlertTriangle size={14} style={{ color: '#dc2626', flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <p style={{ fontSize: 12, color: '#991b1b', margin: 0 }}>{submitError}</p>
                    <p style={{ fontSize: 12, color: '#991b1b', margin: '4px 0 0' }}>
                      Or call us directly at <a href={`tel:${SALES_PHONE}`} style={{ color: '#991b1b', fontWeight: 700 }}>{SALES_PHONE}</a>.
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'submitting'}
                style={{
                  ...FS, width: '100%', background: status === 'submitting' ? '#999' : '#c8102e', color: '#fff', border: 'none',
                  padding: '12px 20px', fontSize: 14, fontWeight: 700, letterSpacing: '0.04em',
                  cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {status === 'submitting'
                  ? <><Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> Submitting…</>
                  : <><Send size={15} /> Submit Quote Request</>}
              </button>
            </form>
          )}
        </div>
      </div>
      <style>{'@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }'}</style>
    </>
  );
}
