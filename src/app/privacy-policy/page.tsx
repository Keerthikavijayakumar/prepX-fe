'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Talentflow
          </Link>
          <Link href="/">
            <Button variant="outline" size="sm">
              Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
            <p className="text-slate-600">Last updated: January 26, 2026</p>
          </div>

          {/* Content */}
          <div className="space-y-8 text-slate-700 leading-relaxed">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Introduction</h2>
              <p>
                Welcome to Talentflow (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;, or &quot;Company&quot;). Talentflow is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
              </p>
              <p className="mt-4">
                Please read this Privacy Policy carefully. If you do not agree with our policies and practices, please do not use our services.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">1. Information We Collect</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">1.1 Information You Provide Directly</h3>
                  <ul className="list-disc list-inside space-y-2 text-slate-700">
                    <li><strong>Account Information:</strong> Name, email address, phone number, password, and profile information</li>
                    <li><strong>Interview Data:</strong> Transcripts, recordings, responses, and assessment scores</li>
                    <li><strong>Resume and Career Information:</strong> Educational background, work experience, and skills</li>
                    <li><strong>Communication Data:</strong> Messages, feedback, and any correspondence with our team</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">1.2 Information Collected Automatically</h3>
                  <ul className="list-disc list-inside space-y-2 text-slate-700">
                    <li><strong>Device Information:</strong> Browser type, IP address, operating system, and device identifiers</li>
                    <li><strong>Usage Information:</strong> Pages visited, time spent, interview duration, and interaction patterns</li>
                    <li><strong>Cookies and Similar Technologies:</strong> Session data and user preferences</li>
                    <li><strong>Location Data:</strong> Approximate location based on IP address</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. How We Use Your Information</h2>
              <p className="mb-3">We use the information we collect for the following purposes:</p>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li>To provide, maintain, and improve our interview preparation services</li>
                <li>To process your interview requests and deliver assessment results</li>
                <li>To personalize your experience and provide recommendations</li>
                <li>To send transactional emails and service-related updates</li>
                <li>To conduct research, analytics, and performance monitoring</li>
                <li>To detect and prevent fraud or unauthorized access</li>
                <li>To comply with legal obligations and enforce our Terms of Service</li>
                <li>To communicate with you about changes to our policies or services</li>
              </ul>
            </section>

            {/* Data Sharing and Disclosure */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">3. Data Sharing and Disclosure</h2>
              <p className="mb-4">We may share your information in the following circumstances:</p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">3.1 Service Providers</h3>
                  <p>We share information with third-party service providers who assist us in operating our website and conducting our business, including cloud hosting providers, analytics services, and communication platforms.</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">3.2 Business Transfers</h3>
                  <p>If Talentflow is involved in a merger, acquisition, bankruptcy, dissolution, reorganization, or similar transaction or proceeding, your information may be transferred as part of that transaction.</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">3.3 Legal Requirements</h3>
                  <p>We may disclose your information when required by law or when we believe in good faith that such disclosure is necessary to comply with legal obligations, enforce our agreements, or protect the safety of our users and the public.</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">3.4 Employer Sharing (With Consent)</h3>
                  <p>If you explicitly consent, we may share your assessment results and interview performance with prospective employers or organizations you authorize.</p>
                </div>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">4. Data Security</h2>
              <p>
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include encryption, secure authentication, regular security audits, and access controls.
              </p>
              <p className="mt-4">
                However, no method of transmission over the internet or electronic storage is completely secure. While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">5. Data Retention</h2>
              <p>
                We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this Privacy Policy. Interview transcripts and assessment data are retained for up to 24 months unless you request deletion. You may request deletion of your account and associated data at any time by contacting us.
              </p>
            </section>

            {/* Your Rights and Choices */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">6. Your Rights and Choices</h2>
              <p className="mb-3">Depending on your location, you may have the following rights:</p>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li><strong>Right to Access:</strong> You can request a copy of the personal information we hold about you</li>
                <li><strong>Right to Correction:</strong> You can request that we correct inaccurate or incomplete information</li>
                <li><strong>Right to Deletion:</strong> You can request that we delete your personal information</li>
                <li><strong>Right to Opt-Out:</strong> You can opt out of marketing communications and cookie tracking</li>
                <li><strong>Right to Data Portability:</strong> You can request your data in a portable format</li>
                <li><strong>Right to Object:</strong> You can object to certain processing of your information</li>
              </ul>
              <p className="mt-4">
                To exercise any of these rights, please contact us at <a href="mailto:privacy@talentflow.io" className="text-blue-600 hover:underline">privacy@talentflow.io</a>.
              </p>
            </section>

            {/* Cookies and Tracking */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">7. Cookies and Tracking Technologies</h2>
              <p className="mb-3">
                We use cookies and similar tracking technologies to enhance your experience. These include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                <li><strong>Essential Cookies:</strong> Required for authentication and basic functionality</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how you use our services</li>
                <li><strong>Marketing Cookies:</strong> Track your interactions for marketing purposes</li>
              </ul>
              <p className="mt-4">
                You can control cookie preferences through your browser settings or our cookie management tool.
              </p>
            </section>

            {/* Third-Party Links */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">8. Third-Party Links</h2>
              <p>
                Our website may contain links to third-party websites and services that are not operated by Talentflow. This Privacy Policy applies only to our services. We are not responsible for the privacy practices of third-party websites, and we encourage you to review their privacy policies before providing any personal information.
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">9. Children's Privacy</h2>
              <p>
                Our services are not intended for individuals under the age of 18 without parental consent. We do not knowingly collect personal information from children under 18. If we discover that we have collected information from a child under 18 without proper consent, we will take steps to delete such information promptly.
              </p>
            </section>

            {/* International Data Transfers */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">10. International Data Transfers</h2>
              <p>
                Your information may be transferred to, stored in, and processed in countries other than your country of residence. These countries may have data protection laws that differ from your home country. By using our services, you consent to the transfer of your information to countries outside your country of residence.
              </p>
            </section>

            {/* Changes to Privacy Policy */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">11. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. We will notify you of any material changes by posting the updated policy on our website and updating the &quot;Last updated&quot; date. Your continued use of our services after such modifications constitutes your acceptance of the updated Privacy Policy.
              </p>
            </section>

            {/* Contact Us */}
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">12. Contact Us</h2>
              <p className="mb-4">
                If you have questions about this Privacy Policy or our privacy practices, please contact us at:
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 space-y-2">
                <p><strong>Talentflow Privacy Team</strong></p>
                <p>
                  Email: <a href="mailto:privacy@talentflow.io" className="text-blue-600 hover:underline">privacy@talentflow.io</a>
                </p>
                <p>
                  Website: <a href="https://talentflow.io" className="text-blue-600 hover:underline">https://talentflow.io</a>
                </p>
                <p>
                  Support: <a href="mailto:support@talentflow.io" className="text-blue-600 hover:underline">support@talentflow.io</a>
                </p>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-slate-200">
            <p className="text-sm text-slate-500 text-center">
              &copy; 2026 Talentflow. All rights reserved. | 
              <Link href="/terms-of-service" className="text-blue-600 hover:underline ml-2">
                Terms of Service
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
