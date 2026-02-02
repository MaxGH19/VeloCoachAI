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
              <h2 className="text-emerald-500 font-bold uppercase text-xs tracking-widest mb-2">2. Datenerfassung in dieser App</h2>
              <p>Diese Applikation erfasst physiologische Daten (Alter, Gewicht, Geschlecht) sowie radsportbezogene Leistungsdaten (FTP, Puls), um mittels künstlicher Intelligenz Trainingspläne zu erstellen.</p>
              <p className="mt-2 text-white font-medium">Übermittlung an Dritte:</p>
              <p>Die von Ihnen im Questionnaire eingegebenen Daten werden verschlüsselt an die Google Gemini API (Google Ireland Limited) übertragen, um den individuellen Trainingsplan zu generieren. Es erfolgt keine dauerhafte Speicherung dieser Daten auf unseren Servern.</p>
            </section>

            <section>
              <h2 className="text-emerald-500 font-bold uppercase text-xs tracking-widest mb-2">3. Ihre Rechte</h2>
              <p>Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Da wir keine Profile speichern, endet unsere Datenverarbeitung mit dem Schließen Ihres Browser-Tabs.</p>
            </section>

            <section className="pt-6 border-t border-white/5 text-sm text-slate-500 italic">
              <p>Stand: Januar 2026. Betreiber: Max Pütz.</p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default LegalView;