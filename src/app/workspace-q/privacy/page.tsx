import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Your data · Workspace Q',
};

// The short privacy notice of Workspace Q, in English and French. The join
// page shows a summary and links here.

const sections = {
  en: {
    title: 'Your data in Workspace Q',
    items: [
      ['What is kept', 'Your name, your email address (from Google, to sign you in), your class and team, and what you add: files, activity answers and messages.'],
      ['Who sees it', 'Your instructor. Your team sees team work and the team board. Files you share with the whole class are seen by the class. Classmates see your name, never your email.'],
      ['What it is used for', 'Only for running your course. It is not sold, not used for advertising and not used for anything else.'],
      ['Where it is stored', 'With the hosting services Workspace Q runs on (Vercel for the site and files, Neon for the database), accessed only through the site, which checks who is asking.'],
      ['How long', 'Until the deletion date your instructor sets for the class (shown under My data). Then the class’s student data is deleted. You can also delete your account at any time.'],
      ['Your choices', 'Under My data you can download your work (a ZIP of your files, answers and messages) or delete your account. Questions: ask your instructor.'],
    ],
    more: 'Quanta Foundry privacy policy',
    back: 'My data',
  },
  fr: {
    title: 'Vos données dans Workspace Q',
    items: [
      ['Ce qui est conservé', 'Votre nom, votre adresse e-mail (fournie par Google pour vous connecter), votre classe et votre équipe, et ce que vous ajoutez : fichiers, réponses aux activités et messages.'],
      ['Qui les voit', 'Votre enseignant. Votre équipe voit le travail d’équipe et le fil de l’équipe. Les fichiers partagés avec toute la classe sont vus par la classe. Vos camarades voient votre nom, jamais votre e-mail.'],
      ['À quoi elles servent', 'Uniquement au déroulement de votre cours. Elles ne sont ni vendues, ni utilisées pour de la publicité, ni pour autre chose.'],
      ['Où elles sont stockées', 'Chez les hébergeurs de Workspace Q (Vercel pour le site et les fichiers, Neon pour la base de données), accessibles uniquement via le site, qui vérifie qui fait la demande.'],
      ['Combien de temps', 'Jusqu’à la date de suppression fixée par votre enseignant pour la classe (affichée dans Mes données). Les données des étudiants de la classe sont alors supprimées. Vous pouvez aussi supprimer votre compte à tout moment.'],
      ['Vos choix', 'Dans Mes données, vous pouvez télécharger votre travail (un ZIP de vos fichiers, réponses et messages) ou supprimer votre compte. Pour toute question : votre enseignant.'],
    ],
    more: 'Politique de confidentialité de Quanta Foundry',
    back: 'Mes données',
  },
} as const;

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen justify-center bg-slate-950 px-4 py-24 text-slate-50">
      <div className="w-full max-w-2xl space-y-12">
        {(['en', 'fr'] as const).map((lang) => (
          <section key={lang} lang={lang} aria-labelledby={`privacy-${lang}`} className="space-y-4">
            <h1 id={`privacy-${lang}`} className="text-2xl font-semibold">
              {sections[lang].title}
            </h1>
            <dl className="space-y-3 text-sm">
              {sections[lang].items.map(([term, text]) => (
                <div key={term}>
                  <dt className="font-semibold text-slate-100">{term}</dt>
                  <dd className="text-slate-300">{text}</dd>
                </div>
              ))}
            </dl>
            <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <Link href="/workspace-q/account" className="text-blue-300 underline hover:text-blue-200">
                {sections[lang].back}
              </Link>
              <a href="https://www.quantafoundry.com/privacy" className="text-blue-300 underline hover:text-blue-200">
                {sections[lang].more}
              </a>
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
