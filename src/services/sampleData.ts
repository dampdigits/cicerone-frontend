import { PipelineResult } from '../types/research';

export const SAMPLE_GOOGLE_RESULT: PipelineResult = {
  status: 'completed',
  provider: 'google',
  markdown: `# Google: OAuth 2.0 Setup Guide

This guide details the complete process of setting up Google OAuth 2.0 authorization credentials, configuring sensitive scopes, and completing app verification.

## Summary

- **Primary Domain:** \`developers.google.com\`
- **Flow Types:** Authorization Code Flow with PKCE (for single-page and mobile apps) and Web Server flow with Client Secret.
- **Estimated Setup Time:** 35–45 minutes for core credentials; 3–7 business days for production verification.

---

## Prerequisites

1. A **Google Cloud Platform (GCP)** account with an active billing project.
2. Verified domain ownership in Google Search Console if requesting sensitive or restricted scopes.
3. Privacy policy and terms of service hosted on public HTTPS URLs.

---

## Setup Steps

### 1. Create a Google Cloud Project & Enable APIs
Navigate to the Google Cloud Console and establish an isolated project for your integration.
Enable the specific APIs needed by your application:
- **Google Meet REST API** (for video conferencing & call artifacts)
- **Google Drive API / Google Tasks API** (for file access and task synchronization)

### 2. Configure OAuth Consent Screen
Select your user type (**Internal** for Google Workspace organizations, **External** for general Google accounts).
Fill in required application branding details:
- Application Name and Logo
- User Support Email
- Authorized Domains (e.g. \`myapp.com\`)
- Developer Contact Information

### 3. Register Credentials
Choose your application client type:
- **Web application:** Specify authorized JavaScript origins and authorized redirect URIs.
- **Single-page app (SPA):** Use Authorization Code Flow with PKCE without a client secret.

### 4. App Verification & Sensitive Scope Audit
If your application requests sensitive scopes (e.g., \`https://www.googleapis.com/auth/drive.readonly\` or Google Meet scopes), Google requires an App Verification process before public launch:
- Upload an in-app walkthrough video demonstrating scope usage.
- Complete Google Cloud Security Assessment if requesting restricted scopes.

---

## Roadblocks & Mitigations

> **Unverified App Screen (Error 403 / Risk Screen)**
> - *Cause:* Users outside the test users list attempt to authorize before verification is approved.
> - *Mitigation:* Add testers explicitly to the "Test Users" table in OAuth consent screen during development.
`,
  json: {
    provider: 'google',
    slug: 'google',
    display_name: 'Google Cloud Platform',
    status: 'completed',
    model: 'openai/gpt-4o',
    retrieved_at: '2026-11-13T06:00:00Z',
    auto_detected: false,
    config: {
      domains: ['developers.google.com', 'cloud.google.com'],
      seeds: ['https://developers.google.com/identity/protocols/oauth2'],
      select_paths: ['/identity/.*', '/workspace/.*'],
      exclude_paths: ['.*pricing.*'],
      domain_source: 'registry',
    },
    workflow: {
      workflow: [
        {
          id: '1',
          title: 'Create GCP Project and Establish Organization',
          required_for: 'all',
          sub_steps: [
            'Sign in to Google Cloud Console (console.cloud.google.com)',
            'Create or select a dedicated Google Cloud project',
            'Link a billing account if required for high-quota APIs',
          ],
          depends_on: [],
          estimated_minutes: { min: 10, max: 15 },
          time_basis: 'verified',
          time_reasoning: 'Project provisioning and billing linkage typically complete in under 15 minutes.',
          basis: 'verified',
          sources: [
            {
              url: 'https://developers.google.com/workspace/guides/create-project',
              quote: 'A Google Cloud project is required to use Google APIs and manage OAuth consent settings.',
            },
          ],
        },
        {
          id: '2',
          title: 'Enable Target APIs: Choose Services Track',
          required_for: 'all',
          sub_steps: [
            'Go to APIs & Services > Library in Cloud Console',
            'Search for and enable target APIs (e.g. Google Meet REST API or Google Drive API)',
            'Review default rate limits and quota allowances',
          ],
          depends_on: ['1'],
          estimated_minutes: { min: 5, max: 10 },
          time_basis: 'estimated',
          time_reasoning: 'API enabling takes 2-3 clicks per service in the console.',
          basis: 'verified',
          sources: [
            {
              url: 'https://developers.google.com/identity/protocols/oauth2/web-server',
              quote: 'Before calling an API, make sure it has been enabled in the API Console.',
            },
          ],
        },
        {
          id: '3',
          title: 'Configure OAuth Consent Screen & User Type',
          required_for: 'all',
          sub_steps: [
            'Select User Type: Internal (Workspace only) or External (any Google account)',
            'Provide App Name, User Support Email, and Developer Contact Address',
            'Add Authorized Domains where redirect URIs reside',
            'Add development test users to the Test Users allowlist',
          ],
          depends_on: ['2'],
          estimated_minutes: { min: 15, max: 20 },
          time_basis: 'verified',
          time_reasoning: 'Requires entering mandatory policy links and support addresses.',
          basis: 'verified',
          sources: [
            {
              url: 'https://developers.google.com/identity/protocols/oauth2/production-readiness',
              quote: 'Configure your OAuth consent screen with an accurate app name, domain, and privacy policy link.',
            },
          ],
        },
        {
          id: '4',
          title: 'Service Branch: Google Meet Real-Time Conferencing Scopes',
          required_for: 'all',
          sub_steps: [
            'Add Google Meet scopes: https://www.googleapis.com/auth/meetings.space.created',
            'Configure Webhook event listeners for participant join/leave events',
            'Implement token refresh logic for 1-hour expiry access tokens',
          ],
          depends_on: ['3'],
          estimated_minutes: { min: 20, max: 30 },
          time_basis: 'estimated',
          time_reasoning: 'Setting up space authorization and webhook callbacks.',
          basis: 'verified',
          sources: [
            {
              url: 'https://developers.google.com/meet/api/guides/overview',
              quote: 'Google Meet REST API requires authorization for meeting space creation and artifact access.',
            },
          ],
        },
        {
          id: '5',
          title: 'Service Branch: Google Drive & Tasks Scopes (Restricted)',
          required_for: 'all',
          sub_steps: [
            'Add restricted drive scopes: https://www.googleapis.com/auth/drive.file or tasks',
            'Store drive credentials in encrypted secrets vault',
            'Configure incremental authorization for storage operations',
          ],
          depends_on: ['3'],
          estimated_minutes: { min: 15, max: 25 },
          time_basis: 'estimated',
          time_reasoning: 'Adding sensitive file scopes and testing file sync flows.',
          basis: 'verified',
          sources: [
            {
              url: 'https://developers.google.com/drive/api/guides/api-specific-auth',
              quote: 'Drive API includes restricted scopes that trigger CASA Tier 2 security review.',
            },
          ],
        },
        {
          id: '6',
          title: 'Generate OAuth Client ID & Redirect URIs',
          required_for: 'all',
          sub_steps: [
            'Select Application Type (Web Application or Single Page App)',
            'Add Authorized JavaScript Origins (e.g. https://app.example.com)',
            'Add Authorized Redirect URIs (e.g. https://app.example.com/api/auth/callback/google)',
            'Download and save client_id and client_secret safely',
          ],
          depends_on: ['4', '5'],
          estimated_minutes: { min: 10, max: 15 },
          time_basis: 'verified',
          time_reasoning: 'Credentials generation is immediate in GCP console.',
          basis: 'verified',
          sources: [
            {
              url: 'https://developers.google.com/identity/protocols/oauth2/web-server',
              quote: 'When registering an app, you specify Authorized redirect URIs for token callbacks.',
            },
          ],
        },
        {
          id: '7',
          title: 'Production Verification & CASA Security Assessment',
          required_for: 'production',
          sub_steps: [
            'Submit app for Google Brand & Scope Verification in Cloud Console',
            'Record and submit YouTube walkthrough video demonstrating consent screen',
            'Complete Cloud Application Security Assessment (CASA) if using restricted scopes',
            'Publish OAuth consent screen to move from Testing to Production status',
          ],
          depends_on: ['6'],
          estimated_minutes: { min: 30, max: 60 },
          time_basis: 'verified',
          time_reasoning: 'Form submission and video prep takes 30-60m; wait times vary from 3 to 7 business days.',
          basis: 'verified',
          sources: [
            {
              url: 'https://developers.google.com/identity/protocols/oauth2/production-readiness',
              quote: 'Apps requesting sensitive or restricted scopes must complete Google verification before public launch.',
            },
          ],
        },
      ],
      approvals: [
        {
          name: 'Google OAuth App Verification',
          approver: 'Google Trust & Safety Team',
          required: 'conditional',
          condition: 'Required if app status is set to Production and requests sensitive or restricted scopes',
          step_id: '7',
          wait_days: { min: 3, max: 7 },
          wait_basis: 'verified',
          wait_reasoning: 'Google documentation states 3 to 7 business days for app review.',
          basis: 'verified',
          sources: [
            {
              url: 'https://developers.google.com/identity/protocols/oauth2/production-readiness',
              quote: 'The verification review process typically takes 3 to 7 business days.',
            },
          ],
        },
      ],
      difficulty: {
        score: 3,
        label: 'Moderate',
        reasoning: 'Clear GCP console UI, but sensitive scope verification and video walkthrough require significant preparation.',
        factors: [
          'Strict domain verification in Google Search Console',
          'Video walkthrough demonstration requirement',
          'CASA Tier 2 assessment for restricted storage scopes',
        ],
        basis: 'estimate by the model based on documentation analysis',
      },
      roadblocks: [
        {
          description: 'OAuth 403 "Access Blocked: This app has not been verified" screen shown to users.',
          step_id: '3',
          mitigation: 'Add individual test emails under OAuth Consent Screen > Test Users until verification is finalized.',
          basis: 'verified',
          sources: [
            {
              url: 'https://developers.google.com/identity/protocols/oauth2/production-readiness',
              quote: 'Unverified apps in testing status can only be accessed by listed test users.',
            },
          ],
        },
        {
          description: 'Redirect URI mismatch error during token exchange.',
          step_id: '6',
          mitigation: 'Ensure exact URI string match including trailing slashes and port numbers in console.',
          basis: 'verified',
          sources: [
            {
              url: 'https://developers.google.com/identity/protocols/oauth2/web-server',
              quote: 'The redirect_uri value must match one of the authorized redirect URIs in the Google API Console.',
            },
          ],
        },
      ],
      dependencies: [
        {
          type: 'account',
          description: 'Active Google Cloud account with administrative access to organization or project.',
          needed_before_step: '1',
          basis: 'verified',
          sources: [
            {
              url: 'https://cloud.google.com/resource-manager/docs/creating-managing-projects',
              quote: 'You must have the resourcemanager.projects.create permission to create a project.',
            },
          ],
        },
        {
          type: 'domain',
          description: 'Registered public domain verified in Google Search Console.',
          needed_before_step: '3',
          basis: 'verified',
          sources: [
            {
              url: 'https://developers.google.com/identity/protocols/oauth2/production-readiness',
              quote: 'Authorized domains must be verified using Google Search Console.',
            },
          ],
        },
      ],
      gaps: [],
      totals: {
        approvals_required: { always: 0, conditional: 1, total: 1 },
        active_time_minutes: {
          minimum_setup: { min: 60, max: 90, steps_with_estimate: 6, steps_total: 6 },
          full_production: { min: 90, max: 150, steps_with_estimate: 7, steps_total: 7 },
        },
        approval_wait_days: {
          always_required: { min: 0, max: 0, approvals_with_estimate: 0, approvals_total: 0 },
          if_all_conditional_apply: { min: 3, max: 7, approvals_with_estimate: 1, approvals_total: 1 },
        },
        note: 'Sums assume sequential execution. Verification takes 3-7 business days.',
      },
    },
  },
};
