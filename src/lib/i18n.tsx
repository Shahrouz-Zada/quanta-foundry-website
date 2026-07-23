'use client';
// =============================================================================
// i18n — lightweight EN/FR translation context (no external library)
// Prototype-scoped to Workspace Q Learning Sessions.
// Language preference persisted in localStorage.
// =============================================================================

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

// ── Message dictionary ────────────────────────────────────────────────────────

const messages = {
  en: {
    // Navigation chrome
    'nav.workspaceQ':   'Workspace Q',
    'nav.learningPath': 'Learning Path',
    'nav.overview':     'Overview',
    'nav.stages':       'Stages',
    'nav.progress':     'Progress',
    'nav.stagesVisited': 'Stages visited',

    // Stages
    'stage.overview':    'Overview',
    'stage.prepare':     'Prepare',
    'stage.explore':     'Explore',
    'stage.experiment':  'Experiment',
    'stage.interpret':   'Interpret',
    'stage.build':       'Build',
    'stage.reflect':     'Reflect',
    'stage.publish':     'Publish',

    // Actions
    'action.previous': 'Previous',
    'action.next':     'Next',
    'action.start':    'Start',
    'action.current':  'Current',
    'action.done':     'Done',
    'action.undo':     'Undo',
    'action.confirm':  'Confirm',
    'action.close':    'Close',
    'action.cancel':   'Cancel',
    'action.submit':   'Submit',

    // Completion
    'completion.requirements':   'Stage requirements',
    'completion.markComplete':   'Mark {stage} as Complete',
    'completion.completed':      '{stage} completed',
    'completion.progress':       '{n} of 6 core stages completed',
    'completion.optional':       'optional',
    'completion.optionalPublish': 'Publish is optional and tracked separately.',
    'completion.confirmPublish': 'Submit for Review',
    'completion.startDraft':     'Start Publication Draft',
    'completion.draftStatus':    'Drafting in progress',
    'completion.submittedStatus': 'Submitted for review',

    // Per-stage requirements text
    'req.prepare.reading':  'Required readings acknowledged',
    'req.prepare.answer':   'At least one pre-session question answered (20+ characters)',
    'req.explore.manual':   'Teaching deck reviewed',
    'req.experiment.confirm': 'Experiment completed and confirmed',
    'req.experiment.urlHint': 'Paste your notebook or repository URL (optional)',
    'req.interpret.prompts': 'All interpretation prompts answered (20+ characters)',
    'req.build.confirm':    'Prediction Problem Brief completed or acknowledged',
    'req.reflect.prompts':  'All reflection prompts answered (20+ characters)',

    // Header controls
    'header.language':     'Language',
    'header.focusLight':   'Focus Light',
    'header.quantaDark':   'Quanta Dark',
    'header.switchTheme':  'Switch theme',
    'header.profile':      'Account',
    'header.myProfile':    'My Profile',
    'header.myProgress':   'My Progress',
    'header.preferences':  'Preferences',
    'header.reportProblem':'Report a Problem',
    'header.privacy':      'Privacy',
    'header.signOut':      'Sign Out',
    'header.phaseLabel':   'Phase 2',
    'header.collapseNav':  'Collapse sidebar',
    'header.expandNav':    'Expand sidebar',
    'header.openMenu':     'Open stage menu',
    'header.closeMenu':    'Close stage menu',
    'header.openProfile':  'Open account menu',
    'header.closeProfile': 'Close account menu',

    // Report a problem modal
    'report.title':            'Report a Problem',
    'report.categoryLabel':    'Issue category',
    'report.descriptionLabel': 'Description',
    'report.descriptionHint':  'Describe the issue. Be as specific as possible.',
    'report.submit':           'Submit Report',
    'report.cancelBtn':        'Cancel',
    'report.metaLabel':        'Session context (auto-included)',
    'report.deviceLabel':      'Browser / device',
    'report.screenshotNote':   'Screenshot upload — Phase 2 feature',
    'report.protoNote':        'Prototype mode — this form does not send a live report.',
    'report.successMsg':       'Thank you. Your report has been logged locally for this prototype.',
    'report.cat.technical':    'Technical issue',
    'report.cat.content':      'Incorrect content',
    'report.cat.link':         'Broken resource link',
    'report.cat.display':      'Display / layout problem',
    'report.cat.accessibility':'Accessibility issue',
    'report.cat.other':        'Other',

    // Prototype notices
    'proto.unsavedNote':
      'Prototype mode: your notes are not saved and will be lost if you refresh or leave this page.',
    'proto.label': 'Prototype',
  },

  fr: {
    'nav.workspaceQ':   'Espace Q',
    'nav.learningPath': 'Parcours',
    'nav.overview':     'Vue d\'ensemble',
    'nav.stages':       'Étapes',
    'nav.progress':     'Progression',
    'nav.stagesVisited': 'Étapes visitées',

    'stage.overview':    'Vue d\'ensemble',
    'stage.prepare':     'Préparer',
    'stage.explore':     'Explorer',
    'stage.experiment':  'Expérimenter',
    'stage.interpret':   'Interpréter',
    'stage.build':       'Construire',
    'stage.reflect':     'Réfléchir',
    'stage.publish':     'Publier',

    'action.previous': 'Précédent',
    'action.next':     'Suivant',
    'action.start':    'Commencer',
    'action.current':  'En cours',
    'action.done':     'Terminé',
    'action.undo':     'Annuler',
    'action.confirm':  'Confirmer',
    'action.close':    'Fermer',
    'action.cancel':   'Annuler',
    'action.submit':   'Envoyer',

    'completion.requirements':   'Exigences de l\'étape',
    'completion.markComplete':   'Marquer {stage} comme terminé',
    'completion.completed':      '{stage} terminé',
    'completion.progress':       '{n} des 6 étapes principales terminées',
    'completion.optional':       'optionnel',
    'completion.optionalPublish': 'Publier est optionnel et suivi séparément.',
    'completion.confirmPublish': 'Soumettre pour révision',
    'completion.startDraft':     'Commencer le brouillon',
    'completion.draftStatus':    'Brouillon en cours',
    'completion.submittedStatus':'Soumis pour révision',

    'req.prepare.reading':   'Lectures requises reconnues',
    'req.prepare.answer':    'Au moins une réponse pré-session (20+ caractères)',
    'req.explore.manual':    'Deck pédagogique consulté',
    'req.experiment.confirm':'Expérience complétée et confirmée',
    'req.experiment.urlHint':'Collez l\'URL de votre notebook (optionnel)',
    'req.interpret.prompts': 'Toutes les questions d\'interprétation répondues (20+ caractères)',
    'req.build.confirm':     'Brief du problème de prédiction complété',
    'req.reflect.prompts':   'Toutes les questions de réflexion répondues (20+ caractères)',

    'header.language':     'Langue',
    'header.focusLight':   'Lumière focus',
    'header.quantaDark':   'Mode sombre',
    'header.switchTheme':  'Changer de thème',
    'header.profile':      'Compte',
    'header.myProfile':    'Mon profil',
    'header.myProgress':   'Ma progression',
    'header.preferences':  'Préférences',
    'header.reportProblem':'Signaler un problème',
    'header.privacy':      'Confidentialité',
    'header.signOut':      'Se déconnecter',
    'header.phaseLabel':   'Phase 2',
    'header.collapseNav':  'Réduire le menu',
    'header.expandNav':    'Développer le menu',
    'header.openMenu':     'Ouvrir les étapes',
    'header.closeMenu':    'Fermer les étapes',
    'header.openProfile':  'Ouvrir le menu du compte',
    'header.closeProfile': 'Fermer le menu du compte',

    'report.title':            'Signaler un problème',
    'report.categoryLabel':    'Catégorie',
    'report.descriptionLabel': 'Description',
    'report.descriptionHint':  'Décrivez le problème. Soyez aussi précis que possible.',
    'report.submit':           'Envoyer le rapport',
    'report.cancelBtn':        'Annuler',
    'report.metaLabel':        'Contexte de session (inclus automatiquement)',
    'report.deviceLabel':      'Navigateur / appareil',
    'report.screenshotNote':   'Capture d\'écran — fonctionnalité Phase 2',
    'report.protoNote':        'Mode prototype — ce formulaire n\'envoie pas de rapport.',
    'report.successMsg':       'Merci. Votre rapport a été enregistré localement.',
    'report.cat.technical':    'Problème technique',
    'report.cat.content':      'Contenu incorrect',
    'report.cat.link':         'Lien de ressource cassé',
    'report.cat.display':      'Problème d\'affichage',
    'report.cat.accessibility':'Problème d\'accessibilité',
    'report.cat.other':        'Autre',

    'proto.unsavedNote':
      'Mode prototype : vos notes ne sont pas sauvegardées et seront perdues si vous actualisez ou quittez cette page.',
    'proto.label': 'Prototype',
  },
} as const;

export type Lang = keyof typeof messages;
export type MessageKey = keyof typeof messages.en;

// ── Context ───────────────────────────────────────────────────────────────────

interface I18nContextValue {
  lang:    Lang;
  setLang: (l: Lang) => void;
  t:       (key: MessageKey, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue>({
  lang:    'en',
  setLang: () => {},
  t:       (key) => key,
});

const LS_KEY = 'wq-lang';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  // Read from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_KEY) as Lang | null;
      if (stored && stored in messages) setLangState(stored);
    } catch {}
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(LS_KEY, l); } catch {}
  }, []);

  const t = useCallback(
    (key: MessageKey, vars?: Record<string, string | number>): string => {
      const raw: string = (messages[lang] as Record<string, string>)[key]
        ?? (messages.en as Record<string, string>)[key]
        ?? key;
      if (!vars) return raw;
      return Object.entries(vars).reduce(
        (s, [k, v]) => s.replace(`{${k}}`, String(v)),
        raw
      );
    },
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}
