# Quote PDF Generation

## Purpose

The Quote PDF Generation foundation defines typed, validated architecture for turning a validated Quote Builder draft into a generated PDF document. It is architecture-only and does not change Quote Builder runtime behavior, pricing calculations, checkout, Shopify integration, routing, styling, or visible UI. It does not send email, persist generated PDFs, or integrate document storage.

## Ownership

- `src/types/quotePdf.ts` owns quote PDF render input, render options, render output, render result, document metadata, and render error contracts.
- `src/schemas/quotePdf.schema.ts` owns Zod validation for quote PDF render input and result contracts.
- `src/adapters/quotePdf/quotePdfRenderer.ts` owns the `QuotePdfRenderer` render-engine boundary that turns validated render input into a rendered document or a render failure.
- `src/adapters/quotePdf/quotePdfAdapter.ts` owns the `QuotePdfAdapter` boundary that normalizes renderer output into the domain `QuotePdfRenderResult`, mapping an unavailable or failing renderer to an explicit status and folding in the source draft's review flags.
- `src/services/quotePdf` owns `quotePdfService`, which validates render input before calling the adapter and exposes a non-throwing pre-flight validation entry point.
- `src/hooks/quotePdf` owns typed React-facing hooks for future UI migration.

## Dependency Direction

```text
React quote PDF hooks → quotePdfService → QuotePdfAdapter → QuotePdfRenderer → future PDF rendering engine
                                  ↓
                         quote PDF schemas / quote PDF types
                                  ↓
                    QuoteDraft (Quote Builder Foundation) by contract only
```

The default renderer, `unavailableQuotePdfRenderer`, always returns a `failed` output tagged `QUOTE_PDF_RENDERER_UNAVAILABLE`. `unavailableQuotePdfAdapter` wraps it and maps that failure to render status `unavailable`, so no existing runtime path starts generating PDFs by accident.

## Supported Contracts

The foundation supports typed representation of:

- Quote draft input, reused directly from the Quote Builder Foundation's `QuoteDraft` (customer metadata, quote lines, package references, pricing references, workflow state, and review flags) rather than duplicating those shapes.
- Document metadata input (title, template identifier, file name, revision, page size, orientation, locale, currency, watermark) and generated document metadata (adds generated-at timestamp, generated-by, content type, and page count).
- Render options for including pricing, package details, review flags, and a cover page.
- Render status (`rendered`, `invalid`, `unavailable`, `failed`) and render errors with code, message, field path, and detail.
- A renderer-level output contract (`QuotePdfRenderOutput`) distinct from the service-level result contract (`QuotePdfRenderResult`), so renderer implementations only report render success or failure while the adapter owns status normalization and review-flag composition.

## Non-goals

This foundation does not implement a real PDF rendering engine, email delivery, file storage, document persistence, checkout, Shopify integration, pricing calculations, or Quote Builder runtime changes. Future issues must connect a rendering engine behind `QuotePdfRenderer` and a storage/delivery integration behind dedicated, separately scoped adapters.

## Future Migration Plan

1. Add quote-pdf fixture tests around renderer success, renderer failure, and adapter status-mapping paths as they are added.
2. Replace `unavailableQuotePdfRenderer` with a rendering-engine implementation (for example, a server-side or headless-browser renderer) only after a rendering engine is approved.
3. Migrate future "Download Quote PDF" UI through `src/hooks/quotePdf` rather than direct service or adapter imports.
4. Connect document storage and retrieval through a dedicated storage-owned adapter in a separate issue; do not add storage calls to `QuotePdfAdapter`.
5. Connect email delivery of the generated document through a dedicated email-owned service in a separate issue; do not add email sending to `quotePdfService`.

## Rollback

Because this work is additive and unwired, rollback is a code revert of the quote-pdf type, schema, adapter, service, hook, test, and documentation additions. Existing Quote Builder, pricing, commerce, checkout, and package builder paths remain unchanged.
