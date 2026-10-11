// Shown in the FAQ section and published as FAQPage structured data.
export const FAQ: { q: string; a: string }[] = [
  {
    q: "Do we need our own Zoom account?",
    a: "Yes. Connect it once and the platform creates, moves and deletes meetings for you.",
  },
  {
    q: "What if an instructor doesn't show up?",
    a: "They're nudged at 3 minutes. At 20, the session is marked no-show, the credit goes back and ops is alerted. Admins can override with a reason.",
  },
  {
    q: "How do parents get recordings?",
    a: "In their portal, automatically. Links are signed for two hours and recordings are kept for six months.",
  },
  {
    q: "Families in other time zones?",
    a: "Everyone sees sessions in their own local time.",
  },
  {
    q: "Who can see what?",
    a: "Access is set by role and enforced in the database. Parents see only their children; instructors only their classes.",
  },
  {
    q: "Can we connect our own tools?",
    a: "Yes. Events are forwarded to your n8n webhook for Sheets, a CRM or WhatsApp flows.",
  },
  {
    q: "How is it priced?",
    a: "Per conducted session. No seat licences, no fee for inactive users.",
  },
  {
    q: "How do we switch over?",
    a: "We plan the move of your students, instructors and timetable with you on the demo call.",
  },
];
