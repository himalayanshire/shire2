import type { Metadata } from "next";
import { SiteNav } from "../components/SiteNav";
import { SiteFooter } from "../components/SiteFooter";

const TITLE = "Privacy Policy | The Himalayan Shire";
const DESCRIPTION =
  "How The Himalayan Shire collects, uses, stores and shares personal information when you visit our website or contact us.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/privacy-policy" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    url: "https://www.thehimalayanshire.com/privacy-policy",
    images: ["/images/hero-1.jpg"],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["/images/hero-1.jpg"] },
};

const EMAIL = "himalayanshire@gmail.com";
const DSAR_URL = "https://app.termly.io/dsar/1b337b0e-0f32-4565-9103-02c7c983592f";

const SECTIONS = [
  { id: "infocollect", title: "What information do we collect?" },
  { id: "infouse", title: "How do we process your information?" },
  { id: "whoshare", title: "When and with whom do we share your personal information?" },
  { id: "cookies", title: "Do we use cookies and other tracking technologies?" },
  { id: "inforetain", title: "How long do we keep your information?" },
  { id: "infominors", title: "Do we collect information from minors?" },
  { id: "privacyrights", title: "What are your privacy rights?" },
  { id: "DNT", title: "Controls for Do-Not-Track features" },
  { id: "policyupdates", title: "Do we make updates to this notice?" },
  { id: "contact", title: "How can you contact us about this notice?" },
  { id: "request", title: "How can you review, update, or delete the data we collect from you?" },
] as const;

const LINK = "break-words font-semibold text-gold-700 underline underline-offset-4 transition-colors hover:text-emerald-950";

function Ext({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={LINK}>
      {children}
    </a>
  );
}

function Jump({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <a href={`#${to}`} className={LINK}>
      {children}
    </a>
  );
}

function Mail() {
  return (
    <a href={`mailto:${EMAIL}`} className={LINK}>
      {EMAIL}
    </a>
  );
}

function Section({ index, children }: { index: number; children: React.ReactNode }) {
  const section = SECTIONS[index]!;
  return (
    <section id={section.id} className="scroll-mt-28 space-y-5 border-t border-emerald-900/10 pt-12">
      <h2 className="font-display text-3xl font-semibold leading-[1.15] text-emerald-950">
        {index + 1}. {section.title}
      </h2>
      {children}
    </section>
  );
}

function Sub({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h3 id={id} className="scroll-mt-28 pt-3 font-display text-xl font-semibold text-emerald-950">
      {children}
    </h3>
  );
}

function InShort({ children }: { children: React.ReactNode }) {
  return (
    <p className="border-l-2 border-gold-500 bg-gold-50/60 py-3 pl-4 pr-3 italic">
      <strong>In Short:</strong> {children}
    </p>
  );
}

function List({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc space-y-3 pl-5 marker:text-gold-600">{children}</ul>;
}

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#fffdf7] font-sans text-emerald-950 selection:bg-gold-200/30">
      <SiteNav />

      <header className="px-5 pb-12 pt-24 sm:px-8 sm:pt-32 lg:px-14 lg:pt-40">
        <div className="mx-auto max-w-4xl">
          <span className="luxe-kicker text-gold-700">Your Privacy</span>
          <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] text-emerald-950 sm:text-6xl lg:text-7xl">
            Privacy Policy
          </h1>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.22em] text-emerald-900/60">
            Last updated November 25, 2026
          </p>
        </div>
      </header>

      <article className="px-5 pb-20 text-base leading-[1.85] text-emerald-950/75 sm:px-8 sm:pb-28 lg:px-14">
        <div className="mx-auto max-w-4xl space-y-12">
          <div className="space-y-5">
            <p>
              This Privacy Notice for The Himalayan Shire (&apos;<strong>we</strong>&apos;, &apos;<strong>us</strong>
              &apos;, or &apos;<strong>our</strong>&apos;), describes how and why we might access, collect, store, use,
              and/or share (&apos;<strong>process</strong>&apos;) your personal information when you use our services (
              &apos;<strong>Services</strong>&apos;), including when you:
            </p>
            <List>
              <li>
                Visit our website at <Ext href="https://www.thehimalayanshire.com">https://www.thehimalayanshire.com</Ext>{" "}
                or any website of ours that links to this Privacy Notice
              </li>
              <li>Engage with us in other related ways, including any marketing or events</li>
            </List>
            <p>
              <strong>Questions or concerns?</strong> Reading this Privacy Notice will help you understand your privacy
              rights and choices. We are responsible for making decisions about how your personal information is
              processed. If you do not agree with our policies and practices, please do not use our Services. If you
              still have any questions or concerns, please contact us at <Mail />.
            </p>
          </div>

          <section className="space-y-5 border-t border-emerald-900/10 pt-12">
            <h2 className="font-display text-3xl font-semibold text-emerald-950">Summary of key points</h2>
            <p>
              <strong>
                <em>
                  This summary provides key points from our Privacy Notice, but you can find out more details about any
                  of these topics by clicking the link following each key point or by using our{" "}
                  <Jump to="toc">table of contents</Jump> below to find the section you are looking for.
                </em>
              </strong>
            </p>
            <p>
              <strong>What personal information do we process?</strong> When you visit, use, or navigate our Services,
              we may process personal information depending on how you interact with us and the Services, the choices you
              make, and the products and features you use. Learn more about{" "}
              <Jump to="personalinfo">personal information you disclose to us</Jump>.
            </p>
            <p>
              <strong>Do we process any sensitive personal information?</strong> Some of the information may be
              considered &apos;special&apos; or &apos;sensitive&apos; in certain jurisdictions, for example your racial
              or ethnic origins, sexual orientation, and religious beliefs. We do not process sensitive personal
              information.
            </p>
            <p>
              <strong>Do we collect any information from third parties?</strong> We do not collect any information from
              third parties.
            </p>
            <p>
              <strong>How do we process your information?</strong> We process your information to provide, improve, and
              administer our Services, communicate with you, for security and fraud prevention, and to comply with law.
              We may also process your information for other purposes with your consent. We process your information only
              when we have a valid legal reason to do so. Learn more about{" "}
              <Jump to="infouse">how we process your information</Jump>.
            </p>
            <p>
              <strong>In what situations and with which parties do we share personal information?</strong> We may share
              information in specific situations and with specific third parties. Learn more about{" "}
              <Jump to="whoshare">when and with whom we share your personal information</Jump>.
            </p>
            <p>
              <strong>What are your rights?</strong> Depending on where you are located geographically, the applicable
              privacy law may mean you have certain rights regarding your personal information. Learn more about{" "}
              <Jump to="privacyrights">your privacy rights</Jump>.
            </p>
            <p>
              <strong>How do you exercise your rights?</strong> The easiest way to exercise your rights is by submitting
              a <Ext href={DSAR_URL}>data subject access request</Ext>, or by contacting us. We will consider and act
              upon any request in accordance with applicable data protection laws.
            </p>
            <p>
              Want to learn more about what we do with any information we collect?{" "}
              <Jump to="toc">Review the Privacy Notice in full</Jump>.
            </p>
          </section>

          <nav id="toc" aria-label="Table of contents" className="scroll-mt-28 border-t border-emerald-900/10 pt-12">
            <h2 className="font-display text-3xl font-semibold text-emerald-950">Table of contents</h2>
            <ol className="mt-5 list-decimal space-y-2 pl-5 marker:font-bold marker:text-gold-700">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <Jump to={s.id}>{s.title}</Jump>
                </li>
              ))}
            </ol>
          </nav>

          <Section index={0}>
            <Sub id="personalinfo">Personal information you disclose to us</Sub>
            <InShort>We collect personal information that you provide to us.</InShort>
            <p>
              We collect personal information that you voluntarily provide to us when you express an interest in
              obtaining information about us or our products and Services, when you participate in activities on the
              Services, or otherwise when you contact us.
            </p>
            <p>
              <strong>Personal Information Provided by You.</strong> The personal information that we collect depends on
              the context of your interactions with us and the Services, the choices you make, and the products and
              features you use. The personal information we collect may include the following:
            </p>
            <List>
              <li>names</li>
              <li>phone numbers</li>
              <li>email addresses</li>
              <li>contact preferences</li>
              <li>billing addresses</li>
            </List>
            <p>
              <strong>Sensitive Information.</strong> We do not process sensitive information.
            </p>
            <p>
              All personal information that you provide to us must be true, complete, and accurate, and you must notify
              us of any changes to such personal information.
            </p>

            <Sub>Information automatically collected</Sub>
            <InShort>
              Some information — such as your Internet Protocol (IP) address and/or browser and device characteristics —
              is collected automatically when you visit our Services.
            </InShort>
            <p>
              We automatically collect certain information when you visit, use, or navigate the Services. This
              information does not reveal your specific identity (like your name or contact information) but may include
              device and usage information, such as your IP address, browser and device characteristics, operating
              system, language preferences, referring URLs, device name, country, location, information about how and
              when you use our Services, and other technical information. This information is primarily needed to
              maintain the security and operation of our Services, and for our internal analytics and reporting purposes.
            </p>
            <p>Like many businesses, we also collect information through cookies and similar technologies.</p>
            <p>The information we collect includes:</p>
            <List>
              <li>
                <em>Log and Usage Data.</em> Log and usage data is service-related, diagnostic, usage, and performance
                information our servers automatically collect when you access or use our Services and which we record in
                log files. Depending on how you interact with us, this log data may include your IP address, device
                information, browser type, and settings and information about your activity in the Services (such as the
                date/time stamps associated with your usage, pages and files viewed, searches, and other actions you take
                such as which features you use), device event information (such as system activity, error reports
                (sometimes called &apos;crash dumps&apos;), and hardware settings).
              </li>
              <li>
                <em>Device Data.</em> We collect device data such as information about your computer, phone, tablet, or
                other device you use to access the Services. Depending on the device used, this device data may include
                information such as your IP address (or proxy server), device and application identification numbers,
                location, browser type, hardware model, Internet service provider and/or mobile carrier, operating
                system, and system configuration information.
              </li>
              <li>
                <em>Location Data.</em> We collect location data such as information about your device&apos;s location,
                which can be either precise or imprecise. How much information we collect depends on the type and
                settings of the device you use to access the Services. For example, we may use GPS and other
                technologies to collect geolocation data that tells us your current location (based on your IP address).
                You can opt out of allowing us to collect this information either by refusing access to the information
                or by disabling your Location setting on your device. However, if you choose to opt out, you may not be
                able to use certain aspects of the Services.
              </li>
            </List>

            <Sub>Google API</Sub>
            <p>
              Our use of information received from Google APIs will adhere to{" "}
              <Ext href="https://developers.google.com/terms/api-services-user-data-policy">
                Google API Services User Data Policy
              </Ext>
              , including the{" "}
              <Ext href="https://developers.google.com/terms/api-services-user-data-policy#limited-use">
                Limited Use requirements
              </Ext>
              .
            </p>
          </Section>

          <Section index={1}>
            <InShort>
              We process your information to provide, improve, and administer our Services, communicate with you, for
              security and fraud prevention, and to comply with law. We may also process your information for other
              purposes with your consent.
            </InShort>
            <p>
              <strong>
                We process your personal information for a variety of reasons, depending on how you interact with our
                Services, including:
              </strong>
            </p>
            <List>
              <li>
                <strong>To deliver and facilitate delivery of services to the user.</strong> We may process your
                information to provide you with the requested service.
              </li>
              <li>
                <strong>To deliver targeted advertising to you.</strong> We may process your information to develop and
                display personalised content and advertising tailored to your interests, location, and more.
              </li>
              <li>
                <strong>To determine the effectiveness of our marketing and promotional campaigns.</strong> We may
                process your information to better understand how to provide marketing and promotional campaigns that are
                most relevant to you.
              </li>
            </List>
          </Section>

          <Section index={2}>
            <InShort>
              We may share information in specific situations described in this section and/or with the following third
              parties.
            </InShort>
            <p>We may need to share your personal information in the following situations:</p>
            <List>
              <li>
                <strong>Business Transfers.</strong> We may share or transfer your information in connection with, or
                during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion
                of our business to another company.
              </li>
            </List>
          </Section>

          <Section index={3}>
            <InShort>We may use cookies and other tracking technologies to collect and store your information.</InShort>
            <p>
              We may use cookies and similar tracking technologies (like web beacons and pixels) to gather information
              when you interact with our Services. Some online tracking technologies help us maintain the security of our
              Services, prevent crashes, fix bugs, save your preferences, and assist with basic site functions.
            </p>
            <p>
              We also permit third parties and service providers to use online tracking technologies on our Services for
              analytics and advertising, including to help manage and display advertisements or to tailor advertisements
              to your interests. The third parties and service providers use their technology to provide advertising
              about products and services tailored to your interests which may appear either on our Services or on other
              websites.
            </p>
            <p>
              Specific information about how we use such technologies and how you can refuse certain cookies is set out
              in our Cookie Notice.
            </p>
            <Sub>Google Analytics</Sub>
            <p>
              We may share your information with Google Analytics to track and analyse the use of the Services. The
              Google Analytics Advertising Features that we may use include: Remarketing with Google Analytics and Google
              Analytics Demographics and Interests Reporting. To opt out of being tracked by Google Analytics across the
              Services, visit{" "}
              <Ext href="https://tools.google.com/dlpage/gaoptout">https://tools.google.com/dlpage/gaoptout</Ext>. You
              can opt out of Google Analytics Advertising Features through{" "}
              <Ext href="https://adssettings.google.com/">Ads Settings</Ext> and Ad Settings for mobile apps. Other opt
              out means include{" "}
              <Ext href="http://optout.networkadvertising.org/">http://optout.networkadvertising.org/</Ext> and{" "}
              <Ext href="http://www.networkadvertising.org/mobile-choice">
                http://www.networkadvertising.org/mobile-choice
              </Ext>
              . For more information on the privacy practices of Google, please visit the{" "}
              <Ext href="https://policies.google.com/privacy">Google Privacy &amp; Terms page</Ext>.
            </p>
          </Section>

          <Section index={4}>
            <InShort>
              We keep your information for as long as necessary to fulfil the purposes outlined in this Privacy Notice
              unless otherwise required by law.
            </InShort>
            <p>
              We will only keep your personal information for as long as it is necessary for the purposes set out in this
              Privacy Notice, unless a longer retention period is required or permitted by law (such as tax, accounting,
              or other legal requirements).
            </p>
            <p>
              When we have no ongoing legitimate business need to process your personal information, we will either
              delete or anonymise such information, or, if this is not possible (for example, because your personal
              information has been stored in backup archives), then we will securely store your personal information and
              isolate it from any further processing until deletion is possible.
            </p>
          </Section>

          <Section index={5}>
            <InShort>We do not knowingly collect data from or market to children under 18 years of age.</InShort>
            <p>
              We do not knowingly collect, solicit data from, or market to children under 18 years of age, nor do we
              knowingly sell such personal information. By using the Services, you represent that you are at least 18 or
              that you are the parent or guardian of such a minor and consent to such minor dependent&apos;s use of the
              Services. If we learn that personal information from users less than 18 years of age has been collected, we
              will deactivate the account and take reasonable measures to promptly delete such data from our records. If
              you become aware of any data we may have collected from children under age 18, please contact us at{" "}
              <Mail />.
            </p>
          </Section>

          <Section index={6}>
            <InShort>
              You may review, change, or terminate your account at any time, depending on your country, province, or
              state of residence.
            </InShort>
            <p>
              <strong>Withdrawing your consent:</strong> If we are relying on your consent to process your personal
              information, which may be express and/or implied consent depending on the applicable law, you have the
              right to withdraw your consent at any time. You can withdraw your consent at any time by contacting us by
              using the contact details provided in the section{" "}
              <Jump to="contact">&apos;How can you contact us about this notice?&apos;</Jump> below.
            </p>
            <p>
              However, please note that this will not affect the lawfulness of the processing before its withdrawal nor,
              when applicable law allows, will it affect the processing of your personal information conducted in
              reliance on lawful processing grounds other than consent.
            </p>
            <p>
              <strong>Cookies and similar technologies:</strong> Most Web browsers are set to accept cookies by default.
              If you prefer, you can usually choose to set your browser to remove cookies and to reject cookies. If you
              choose to remove cookies or reject cookies, this could affect certain features or services of our Services.
            </p>
            <p>
              If you have questions or comments about your privacy rights, you may email us at <Mail />.
            </p>
          </Section>

          <Section index={7}>
            <p>
              Most web browsers and some mobile operating systems and mobile applications include a Do-Not-Track
              (&apos;DNT&apos;) feature or setting you can activate to signal your privacy preference not to have data
              about your online browsing activities monitored and collected. At this stage, no uniform technology
              standard for recognising and implementing DNT signals has been finalised. As such, we do not currently
              respond to DNT browser signals or any other mechanism that automatically communicates your choice not to be
              tracked online. If a standard for online tracking is adopted that we must follow in the future, we will
              inform you about that practice in a revised version of this Privacy Notice.
            </p>
          </Section>

          <Section index={8}>
            <InShort>Yes, we will update this notice as necessary to stay compliant with relevant laws.</InShort>
            <p>
              We may update this Privacy Notice from time to time. The updated version will be indicated by an updated
              &apos;Revised&apos; date at the top of this Privacy Notice. If we make material changes to this Privacy
              Notice, we may notify you either by prominently posting a notice of such changes or by directly sending you
              a notification. We encourage you to review this Privacy Notice frequently to be informed of how we are
              protecting your information.
            </p>
          </Section>

          <Section index={9}>
            <p>
              If you have questions or comments about this notice, you may email us at <Mail /> or contact us by post at:
            </p>
            <address className="not-italic">
              The Himalayan Shire
              <br />
              Dehna Road, near Talayi Village, Fagu
              <br />
              Shimla, Himachal Pradesh 171209
              <br />
              India
            </address>
          </Section>

          <Section index={10}>
            <p>
              Based on the applicable laws of your country, you may have the right to request access to the personal
              information we collect from you, details about how we have processed it, correct inaccuracies, or delete
              your personal information. You may also have the right to withdraw your consent to our processing of your
              personal information. These rights may be limited in some circumstances by applicable law. To request to
              review, update, or delete your personal information, please fill out and submit a{" "}
              <Ext href={DSAR_URL}>data subject access request</Ext>.
            </p>
          </Section>
        </div>
      </article>

      <SiteFooter />
    </main>
  );
}
