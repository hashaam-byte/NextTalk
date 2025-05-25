'use client';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
        About NextTalk
      </h1>

      <div className="space-y-6 text-gray-300">
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">Overview</h2>
          <p>
            NextTalk is a modern chat application that combines the best features of messaging apps with advanced security, privacy, and family safety features. Built with the latest technology, it offers a seamless communication experience while prioritizing user control and protection.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">Key Features</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Real-time messaging with end-to-end encryption</li>
            <li>Voice and video calls with crystal-clear quality</li>
            <li>Group chats and communities</li>
            <li>File sharing and media support</li>
            <li>Offline messaging capability</li>
            <li>Parental controls and screen time management</li>
            <li>Activity monitoring and reports</li>
            <li>Content filtering and safe mode</li>
            <li>Cross-platform synchronization</li>
            <li>Status updates and stories</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">Privacy & Security</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>End-to-end encryption for all messages</li>
            <li>Secure voice and video calls</li>
            <li>Two-factor authentication</li>
            <li>Customizable privacy settings</li>
            <li>Message deletion and auto-deletion</li>
            <li>Screen privacy features</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">Family Features</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Screen time limits and schedules</li>
            <li>Content filtering by age</li>
            <li>Activity monitoring</li>
            <li>Usage reports and analytics</li>
            <li>Safe mode for children</li>
            <li>Real-time location sharing</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">Technical Details</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Built with Next.js 13 and TypeScript</li>
            <li>Real-time updates using WebSocket</li>
            <li>WebRTC for voice and video calls</li>
            <li>Prisma ORM for database management</li>
            <li>NextAuth.js for authentication</li>
            <li>Responsive design for all devices</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
