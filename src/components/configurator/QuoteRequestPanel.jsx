/**
 * components/configurator/QuoteRequestPanel.jsx
 * Shown below ConfigurationSummary when configuration is complete.
 * Calls quoteRequestService only — never imports a delivery adapter directly.
 */

import React, { useState, useRef } from 'react';
import { useConfiguration } from '@/context/ConfigurationContext';
import { buildQuotePayload, validateContactForm, submitQuoteRequest, generateSubmissionId } from '@/services/quoteRequestService';
import { CheckCircle, Send, AlertTriangle, Loader } from 'lucide-react';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

const FIELD_STYLE = {
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

const FIELD_ERROR_STYLE = { ...FIELD_STYLE, borderColor: '#dc2626' };

function Field({ label, required, error, children }) {
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

const EMPTY_FORM = { name: '', agency: '', email: '', phone: '', vehicleCount: '', notes: '' };
const SALES_PHONE = '800-621-9959';

export default function QuoteRequestPanel({ productMeta }) {
  const { session, summary } = useConfiguration();
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [submitError, setSubmitError] = useState('');
  const [referenceId, setReferenceId] = useState(null);
  const [deliveryMethod, setDeliveryMethod] = useState(null);
  const [mailtoUrl, setMailtoUrl] = useState(null);
  // Stable per-session ID — created once, reused on retry so no duplicate records are created
  const submissionIdRef = useRef(generateSubmissionId());

  if (!session || !summary) return null;

  const { isComplete, pendingSteps, violations } = summary;
  const hardViolations = violations.filter(v => v.type === 'excludes');
  const canSubmit = isComplete; // isComplete already gates on pendingSteps + hardViolations

  // ── Incomplete state ────────────────────────────────────────────────────────
  if (!canSubmit) {
    return (
      <div style={{ ...FS, border: '1px solid #e8e8e8', background: '#fafafa', padding: '20px' }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', marginBottom: 10 }}>
          Request a Quote
        </p>
        {hardViolations.length > 0 && (
          <div style={{ display: 'flex', gap: 8, padding: '10px 12px', background: '#fef2f2', border: '1px solid #fecaca', marginBottom: 8 }}>
            <AlertTriangle size={14} style={{ color: '#dc2626', flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: '#991b1b', margin: 0 }}>
              Resolve {hardViolations.length} incompatibility conflict{hardViolations.length > 1 ? 's' : ''} before requesting a quote.
            </p>
          </div>
        )}
        {pendingSteps.length > 0 && (
          <div style={{ display: 'flex', gap: 8, padding: '10px 12px', background: '#fffbeb', border: '1px solid #fde68a' }}>
            <AlertTriangle size={14} style={{ color: '#d97706', flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ fontSize: 12, color: '#92400e', margin: '0 0 4px', fontWeight: 600 }}>
                Complete required selections to unlock the quote form:
              </p>
              <ul style={{ margin: 0, padding: '0 0 0 14px' }}>
                {pendingSteps.map(s => (
                  <li key={s.id} style={{ fontSize: 12, color: '#92400e' }}>{s.label}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Success state ───────────────────────────────────────────────────────────
  if (status === 'success') {
    const isMailto = deliveryMethod === 'mailto';
    return (
      <div style={{ ...FS, border: '1px solid #bbf7d0', background: '#f0fdf4', padding: '28px 24px', textAlign: 'center' }}>
        <CheckCircle size={36} style={{ color: '#16a34a', margin: '0 auto 12px' }} />
        <p style={{ fontSize: 15, fontWeight: 700, color: '#15803d', marginBottom: 6 }}>
          {isMailto ? 'Almost There — Finish Sending Your Email' : 'Quote Request Submitted'}
        </p>
        <p style={{ fontSize: 13, color: '#166534', margin: 0 }}>
          {isMailto
            ? <>We opened your email client with your configuration for <strong>{productMeta?.productTitle || 'this product'}</strong> pre-filled. Click <strong>Send</strong> in your email client to complete the request.</>
            : <>Your configuration for <strong>{productMeta?.productTitle || 'this product'}</strong> has been received. A representative will be in touch shortly.</>}
        </p>
        {isMailto && (
          <p style={{ fontSize: 12, color: '#166534', margin: '10px 0 0' }}>
            Nothing opened? <a href={mailtoUrl} style={{ color: '#15803d', fontWeight: 700 }}>Click here to email us directly</a>, or call{' '}
            <a href={`tel:${SALES_PHONE}`} style={{ color: '#15803d', fontWeight: 700 }}>{SALES_PHONE}</a>.
          </p>
        )}
        <div style={{ marginTop: 14, padding: '10px 16px', background: '#dcfce7', border: '1px solid #bbf7d0', display: 'inline-block' }}>
          {referenceId && (
            <p style={{ fontSize: 13, fontWeight: 700, color: '#15803d', margin: '0 0 2px' }}>
              Reference #: {referenceId}
            </p>
          )}
          <p style={{ fontSize: 11, color: '#166534', margin: 0, fontStyle: 'italic' }}>
            SKU: {summary.skuPreview || '(pending)'}
          </p>
        </div>
      </div>
    );
  }

  // ── Form state ──────────────────────────────────────────────────────────────
  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { valid, errors } = validateContactForm(form);
    if (!valid) { setFieldErrors(errors); return; }
    setFieldErrors({});
    setStatus('submitting');
    setSubmitError('');

    const payload = buildQuotePayload(session, summary, productMeta, form, submissionIdRef.current);

    const result = await submitQuoteRequest(payload).catch(err => ({ success: false, error: err.message }));

    if (result.referenceId) setReferenceId(result.referenceId);
    if (result.deliveryMethod) setDeliveryMethod(result.deliveryMethod);
    if (result.mailtoUrl) setMailtoUrl(result.mailtoUrl);

    if (result.success) {
      setStatus('success');
    } else {
      setStatus('error');
      setSubmitError(result.error || 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div style={{ ...FS, border: '1px solid #c8102e', background: '#fff' }}>
      {/* Header */}
      <div style={{ background: '#c8102e', color: '#fff', padding: '14px 20px' }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Request a Quote
        </p>
        <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>
          Configuration complete — Selected SKU: {summary.selectedSku || summary.skuPreview || '(pending)'}
        </p>
      </div>

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
            <input value={form.phone} onChange={set('phone')} placeholder="(555) 000-0000"
              style={FIELD_STYLE} />
          </Field>
        </div>

        <Field label="Number of Vehicles">
          <input value={form.vehicleCount} onChange={set('vehicleCount')} placeholder="e.g. 12"
            style={FIELD_STYLE} />
        </Field>

        <Field label="Additional Notes">
          <textarea value={form.notes} onChange={set('notes')} rows={3}
            placeholder="Special requirements, fleet details, delivery timeline..."
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
            ...FS,
            width: '100%',
            background: status === 'submitting' ? '#999' : '#c8102e',
            color: '#fff',
            border: 'none',
            padding: '12px 20px',
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: '0.04em',
            cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          {status === 'submitting'
            ? <><Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> Submitting…</>
            : <><Send size={15} /> Submit Quote Request</>
          }
        </button>

        <p style={{ marginTop: 10, fontSize: 10, color: '#aaa', textAlign: 'center', fontStyle: 'italic' }}>
          Prototype — no production orders will be placed.
        </p>
      </form>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}