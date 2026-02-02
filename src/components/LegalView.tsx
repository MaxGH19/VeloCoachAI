
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
              <p>Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen.</p>
            </section>

            <section>
              <h2 className="text-emerald-500 font-bold uppercase text-xs tracking-widest mb-2">2. Authentifizierung via Google</h2>
              <p>Diese Website nutzt Google Firebase zur Authentifizierung. Wenn Sie sich via "Login mit Google" anmelden, erhalten wir von der Google Ireland Limited folgende Daten:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Ihren Namen (zur Anzeige im Header der App)</li>
                <li>Ihre E-Mail-Adresse (zur Identifizierung Ihres Kontos)</li>
                <li>Ihr Profilbild (optional zur Personalisierung)</li>
              </ul>
              <p className="mt-2">Diese Daten sind notwendig, um Ihnen einen persönlichen Zugang zu ermöglichen und künftig erstellte Trainingspläne Ihrem Profil zuzuordnen.</p>
            </section>

            <section>
              <h2 className="text-emerald-500 font-bold uppercase text-xs tracking-widest mb-2">3. Erstellung von Trainingsplänen</h2>
              <p>Die physiologischen Daten (Alter, Gewicht, Geschlecht) sowie Leistungsdaten (FTP, Puls), die Sie im Questionnaire eingeben, werden verschlüsselt an die Google Gemini API übertragen, um Ihren individuellen Plan zu berechnen.</p>
              <p className="mt-2 text-white font-medium">Keine dauerhafte Speicherung:</p>
              <p>Sofern nicht anders angegeben, werden Ihre physiologischen Eingabewerte nur für die Dauer der Session verarbeitet. Die Gemini-Modelle nutzen diese Daten zur einmaligen Generierung des Plans.</p>
            </section>

            <section>
              <h2 className="text-emerald-500 font-bold uppercase text-xs tracking-widest mb-2">4. Ihre Rechte</h2>
              <p>Sie haben jederzeit das Recht auf Auskunft, Berichtigung oder Löschung Ihrer Daten. Durch den Logout und das Löschen lokaler Browser-Daten können Sie die meisten Session-basierten Informationen entfernen. Für die Löschung Ihres Firebase-Nutzerkontos kontaktieren Sie uns bitte per E-Mail.</p>
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
