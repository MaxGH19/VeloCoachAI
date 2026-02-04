
import React from 'react';

interface LegalViewProps {
  type: 'privacy' | 'imprint';
  onClose: () => void;
}

const LegalView: React.FC<LegalViewProps> = ({ type, onClose }) => {
  return (
    <div className="max-w-3xl mx-auto py-12 px-6 animate-fade-in">
      <button 
        onClick={onClose}
        className="mb-8 text-slate-500 hover:text-emerald-500 transition-colors flex items-center gap-2 font-bold uppercase tracking-widest text-xs"
      >
        <i className="fas fa-arrow-left"></i> Zurück
      </button>

      <div className="glass rounded-[2rem] p-8 md:p-12 text-slate-300 leading-relaxed">
        {type === 'imprint' ? (
          <div className="space-y-6">
            <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Impressum</h1>
            <section>
              <h2 className="text-emerald-500 font-bold uppercase text-xs tracking-widest mb-2">Angaben gemäß § 5 TMG</h2>
              <p className="text-lg text-white font-semibold">Max Pütz</p>
              <p>Roonstraße 3</p>
              <p>50674 Köln</p>
            </section>
            <section className="pt-6 border-t border-white/5 text-sm text-slate-500">
              <p>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV: Max Pütz (Anschrift wie oben).</p>
              <p className="mt-4 italic">Hinweis: Dies ist eine private Webapplikation zu Demonstrationszwecken.</p>
            </section>
          </div>
        ) : (
          <div className="space-y-6">
            <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Datenschutzerklärung</h1>
            
            <section>
              <h2 className="text-emerald-500 font-bold uppercase text-xs tracking-widest mb-2">1. Datenschutz auf einen Blick</h2>
              <p className="text-white font-semibold mb-2">Allgemeine Hinweise</p>
              <p>Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.</p>
            </section>

            <section>
              <h2 className="text-emerald-500 font-bold uppercase text-xs tracking-widest mb-2">2. Datenerfassung auf dieser Website</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-white font-semibold">Wer ist verantwortlich für die Datenerfassung auf dieser Website?</p>
                  <p>Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber:</p>
                  <p className="mt-1 font-medium">Max Pütz<br />Roonstr. 3<br />50674 Köln<br />max.puetz92@gmail.com</p>
                </div>
                <div>
                  <p className="text-white font-semibold">Wie erfassen wir Ihre Daten?</p>
                  <p>Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei handelt es sich um Daten, die Sie in das Questionnaire eingeben (z.B. FTP-Wert, Gewicht, Alter) oder die durch die Registrierung anfallen.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-emerald-500 font-bold uppercase text-xs tracking-widest mb-2">3. Hosting und Firebase</h2>
              <p>Wir hosten unsere Web-App bei Netlify (Netlify, Inc., USA) und nutzen für die Authentifizierung und Datenbankdienste Google Firebase (Google Ireland Limited, Irland).</p>
              <ul className="list-disc ml-6 mt-4 space-y-2">
                <li><span className="text-white font-medium">Firebase Authentication:</span> Ermöglicht Ihnen den Login via Google oder E-Mail. Dabei werden Ihre Login-Daten (E-Mail, Name, UID) verarbeitet.</li>
                <li><span className="text-white font-medium">Firebase Firestore:</span> Hier speichern wir Ihre sportwissenschaftlichen Profile (FTP, Gewicht, Trainingspläne).</li>
                <li><span className="text-white font-medium">Datenübertragung:</span> Da Google ein US-Unternehmen ist, können Daten in die USA übertragen werden. Google ist unter dem EU-US Data Privacy Framework zertifiziert, was ein angemessenes Datenschutzniveau garantiert.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-emerald-500 font-bold uppercase text-xs tracking-widest mb-2">4. Besondere Kategorien von Daten (Gesundheitsdaten)</h2>
              <p>Im Rahmen der Erstellung von Trainingsplänen verarbeiten wir Daten, die gemäß Art. 9 DSGVO als Gesundheitsdaten gelten können (z.B. Leistungsfähigkeit in Watt, Herzfrequenz, Körpergewicht).</p>
              <p className="mt-4 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                <span className="text-emerald-400 font-bold block mb-1">Rechtsgrundlage:</span>
                Die Verarbeitung dieser Daten erfolgt ausschließlich auf Grundlage Ihrer ausdrücklichen Einwilligung (Art. 9 Abs. 2 lit. a DSGVO), die Sie mit der Registrierung oder der Nutzung des Dienstes erteilen.
              </p>
            </section>

            <section>
              <h2 className="text-emerald-500 font-bold uppercase text-xs tracking-widest mb-2">5. Ihre Rechte</h2>
              <p>Sie haben jederzeit das Recht:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Auskunft über Ihre gespeicherten Daten zu erhalten.</li>
                <li>Die Berichtigung oder Löschung Ihrer Daten zu verlangen.</li>
                <li>Ihre Einwilligung zur Datenverarbeitung mit Wirkung für die Zukunft zu widerrufen.</li>
                <li>Eine Kopie Ihrer Daten in einem gängigen Format zu erhalten (Datenübertragbarkeit).</li>
              </ul>
              <p className="mt-2 italic">Zur Ausübung dieser Rechte können Sie sich jederzeit an die oben angegebene Adresse wenden.</p>
            </section>

            <section>
              <h2 className="text-emerald-500 font-bold uppercase text-xs tracking-widest mb-2">6. Speicherdauer</h2>
              <p>Wir speichern Ihre Daten nur so lange, wie es für die Bereitstellung unserer Dienste erforderlich ist oder bis Sie Ihr Nutzerkonto löschen.</p>
            </section>

            <section className="pt-6 border-t border-white/5 text-sm text-slate-500 italic">
              <p>Stand: Februar 2026. Betreiber: Max Pütz.</p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default LegalView;
