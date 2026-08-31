'use client';
// =============================================================================
// i18n — lightweight EN/FR translation context (no external library)
// Prototype-scoped to Workspace Q Learning Sessions.
// Language preference persisted in localStorage.
//
// SCOPE RULE — only interface strings live here.
// Course content (titles, questions, reading names, deck text) stays in
// its original language and is NOT passed through t().
// "Workspace Q" is the product name — not translated in any language.
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
    // ── Navigation chrome ──────────────────────────────────────────────────
    'nav.workspaceQ':    'Workspace Q',   // Product name — never translated
    'nav.learningPath':  'Learning Path',
    'nav.overview':      'Overview',
    'nav.stages':        'Stages',
    'nav.progress':      'Progress',

    // ── Stage names ────────────────────────────────────────────────────────
    'stage.overview':    'Overview',
    'stage.prepare':     'Prepare',
    'stage.explore':     'Explore',
    'stage.experiment':  'Experiment',
    'stage.interpret':   'Interpret',
    'stage.build':       'Build',
    'stage.reflect':     'Reflect',
    'stage.publish':     'Publish',

    // ── Actions ────────────────────────────────────────────────────────────
    'action.previous':   'Previous',
    'action.next':       'Next',
    'action.begin':      'Begin',
    'action.start':      'Start',
    'action.current':    'Current',
    'action.done':       'Done',
    'action.undo':       'Undo',
    'action.confirm':    'Confirm',
    'action.close':      'Close',
    'action.cancel':     'Cancel',
    'action.submit':     'Submit',

    // ── Completion ─────────────────────────────────────────────────────────
    'completion.requirements':    'Stage requirements',
    'completion.markComplete':    'Mark {stage} as Complete',
    'completion.completed':       '{stage} completed',
    'completion.progress':        '{n} of 6 core stages completed',
    'completion.optional':        'optional',
    'completion.optionalPublish': 'Publish is optional and tracked separately from the six core stages.',

    // ── Publish state labels ───────────────────────────────────────────────
    'publish.startDraft':        'Start Publication Draft',
    'publish.notStarted':        'Not started',
    'publish.drafting':          'Drafting',
    'publish.requestReview':     'Request Review',
    'publish.reviewRequested':   'Review requested',
    'publish.published':         'Published',

    // ── Per-stage requirement labels ───────────────────────────────────────
    'req.prepare.answer':
      'At least one pre-session question answered with at least 20 characters',

    'req.explore.manual':
      'Teaching deck reviewed',
    'req.explore.deckUnavailable':
      'Teaching deck coming soon',
    'req.explore.reviewBtn':
      'I have reviewed the teaching deck',

    'req.experiment.confirm':
      'Experiment completed and confirmed',
    'req.experiment.unavailable':
      'Experiment resources not yet available — completion disabled',
    'req.experiment.urlHint':
      'Paste your notebook or repository URL (optional)',

    'req.interpret.prompts':
      'All interpretation prompts answered with at least 20 characters each',

    'req.build.confirm':
      'Prediction Problem Brief structure reviewed',
    'req.build.reviewBtn':
      'I have reviewed the Prediction Problem Brief structure',

    'req.reflect.prompts':
      'All reflection prompts answered with at least 20 characters each',

    // ── Overview extras ────────────────────────────────────────────────────
    'overview.contentLanguage':  'Course content: English',

    // ── Header controls ────────────────────────────────────────────────────
    'header.language':       'Language',
    'header.focusLight':     'Focus Light',
    'header.quantaDark':     'Quanta Dark',
    'header.switchTheme':    'Switch theme',
    'header.profile':        'Account',
    'header.myProfile':      'My Profile',
    'header.myProgress':     'My Progress',
    'header.preferences':    'Preferences',
    'header.reportProblem':  'Report a Problem',
    'header.privacy':        'Privacy',
    'header.comingLater':    'Coming later',
    'header.phaseLabel':     'Phase 2',
    'header.collapseNav':    'Collapse sidebar',
    'header.expandNav':      'Expand sidebar',
    'header.openMenu':       'Open stage menu',
    'header.closeMenu':      'Close stage menu',
    'header.openProfile':    'Open account menu',
    'header.closeProfile':   'Close account menu',

    // ── Report a Problem modal ─────────────────────────────────────────────
    'report.title':             'Report a Problem',
    'report.categoryLabel':     'Issue category',
    'report.descriptionLabel':  'Description',
    'report.descriptionHint':   'Describe the issue. Be as specific as possible.',
    'report.submit':            'Submit Report',
    'report.cancelBtn':         'Cancel',
    'report.metaLabel':         'Session context (auto-included)',
    'report.deviceLabel':       'Browser / device',
    'report.screenshotNote':    'Screenshot upload — Phase 2 feature',
    'report.protoNote':         'Prototype mode — this form does not send a live report.',
    'report.successMsg':        'Thank you. Your report has been noted for this prototype session.',
    'report.cat.technical':     'Technical issue',
    'report.cat.content':       'Incorrect content',
    'report.cat.link':          'Broken resource link',
    'report.cat.display':       'Display / layout problem',
    'report.cat.accessibility': 'Accessibility issue',
    'report.cat.other':         'Other',

    // ── Prototype notices ──────────────────────────────────────────────────
    'proto.unsavedNote':
      'This screen is still a UI prototype, but your responses are saved to your account as you type.',
    'proto.label': 'Prototype',

    // ── Prediction Lock ────────────────────────────────────────────────────
    'prediction.lockButton':       'Lock prediction',
    'prediction.locking':          'Locking…',
    'prediction.lockedBadge':      'Locked',
    'prediction.lockedAt':         'Locked {date}',
    'prediction.reopenedNotice':   'An instructor reopened this prediction — you can edit it again.',
    'prediction.voidedNotice':     'This prediction was voided by an instructor and can no longer be edited.',
    'prediction.emptyWarning':     'Write your prediction before locking it.',
    'prediction.lockErrorFallback':'Could not lock this prediction. Please try again.',
    'prediction.lockHelp':         'Locking timestamps your prediction and makes it read-only. An instructor can reopen it if needed.',
    'prediction.revealTitle':      'Prediction vs. outcome',
    'prediction.yourPrediction':   'Your prediction',
    'prediction.actualOutcome':    'What actually happened',
    'prediction.noPredictionYet':  'You have not locked a prediction for this experiment yet.',
  },

  fr: {
    // ── Navigation chrome ──────────────────────────────────────────────────
    'nav.workspaceQ':    'Workspace Q',  // Nom du produit — non traduit
    'nav.learningPath':  'Parcours',
    'nav.overview':      'Vue d\'ensemble',
    'nav.stages':        'Étapes',
    'nav.progress':      'Progression',

    // ── Stage names ────────────────────────────────────────────────────────
    'stage.overview':    'Vue d\'ensemble',
    'stage.prepare':     'Préparer',
    'stage.explore':     'Explorer',
    'stage.experiment':  'Expérimenter',
    'stage.interpret':   'Interpréter',
    'stage.build':       'Construire',
    'stage.reflect':     'Réfléchir',
    'stage.publish':     'Publier',

    // ── Actions ────────────────────────────────────────────────────────────
    'action.previous':   'Précédent',
    'action.next':       'Suivant',
    'action.begin':      'Commencer',
    'action.start':      'Commencer',
    'action.current':    'En cours',
    'action.done':       'Terminé',
    'action.undo':       'Annuler',
    'action.confirm':    'Confirmer',
    'action.close':      'Fermer',
    'action.cancel':     'Annuler',
    'action.submit':     'Envoyer',

    // ── Completion ─────────────────────────────────────────────────────────
    'completion.requirements':    'Exigences de l\'étape',
    'completion.markComplete':    'Marquer {stage} comme terminé',
    'completion.completed':       '{stage} terminé',
    'completion.progress':        '{n} des 6 étapes principales terminées',
    'completion.optional':        'optionnel',
    'completion.optionalPublish': 'Publier est optionnel et suivi séparément des six étapes principales.',

    // ── Publish state labels ───────────────────────────────────────────────
    'publish.startDraft':        'Commencer le brouillon',
    'publish.notStarted':        'Pas encore commencé',
    'publish.drafting':          'Brouillon en cours',
    'publish.requestReview':     'Demander une révision',
    'publish.reviewRequested':   'Révision demandée',
    'publish.published':         'Publié',

    // ── Per-stage requirement labels ───────────────────────────────────────
    'req.prepare.answer':
      'Au moins une question préparatoire complétée avec au moins 20 caractères',

    'req.explore.manual':
      'Deck pédagogique consulté',
    'req.explore.deckUnavailable':
      'Deck pédagogique à venir',
    'req.explore.reviewBtn':
      'J\'ai consulté le deck pédagogique',

    'req.experiment.confirm':
      'Expérience complétée et confirmée',
    'req.experiment.unavailable':
      'Ressources d\'expérience pas encore disponibles — complétion désactivée',
    'req.experiment.urlHint':
      'Collez l\'URL de votre notebook (optionnel)',

    'req.interpret.prompts':
      'Toutes les questions d\'interprétation répondues avec au moins 20 caractères chacune',

    'req.build.confirm':
      'Structure du Prediction Problem Brief consultée',
    'req.build.reviewBtn':
      'J\'ai consulté la structure du Prediction Problem Brief',

    'req.reflect.prompts':
      'Toutes les questions de réflexion répondues avec au moins 20 caractères chacune',

    // ── Overview extras ────────────────────────────────────────────────────
    'overview.contentLanguage':  'Contenu du cours : anglais',

    // ── Header controls ────────────────────────────────────────────────────
    'header.language':       'Langue',
    'header.focusLight':     'Lumière focus',
    'header.quantaDark':     'Mode sombre',
    'header.switchTheme':    'Changer de thème',
    'header.profile':        'Compte',
    'header.myProfile':      'Mon profil',
    'header.myProgress':     'Ma progression',
    'header.preferences':    'Préférences',
    'header.reportProblem':  'Signaler un problème',
    'header.privacy':        'Confidentialité',
    'header.comingLater':    'À venir',
    'header.phaseLabel':     'Phase 2',
    'header.collapseNav':    'Réduire le menu',
    'header.expandNav':      'Développer le menu',
    'header.openMenu':       'Ouvrir les étapes',
    'header.closeMenu':      'Fermer les étapes',
    'header.openProfile':    'Ouvrir le menu du compte',
    'header.closeProfile':   'Fermer le menu du compte',

    // ── Report a Problem modal ─────────────────────────────────────────────
    'report.title':             'Signaler un problème',
    'report.categoryLabel':     'Catégorie',
    'report.descriptionLabel':  'Description',
    'report.descriptionHint':   'Décrivez le problème. Soyez aussi précis que possible.',
    'report.submit':            'Envoyer le rapport',
    'report.cancelBtn':         'Annuler',
    'report.metaLabel':         'Contexte de session (inclus automatiquement)',
    'report.deviceLabel':       'Navigateur / appareil',
    'report.screenshotNote':    'Capture d\'écran — fonctionnalité Phase 2',
    'report.protoNote':         'Mode prototype — ce formulaire n\'envoie pas de rapport.',
    'report.successMsg':        'Merci. Votre rapport a été noté pour cette session prototype.',
    'report.cat.technical':     'Problème technique',
    'report.cat.content':       'Contenu incorrect',
    'report.cat.link':          'Lien de ressource cassé',
    'report.cat.display':       'Problème d\'affichage',
    'report.cat.accessibility': 'Problème d\'accessibilité',
    'report.cat.other':         'Autre',

    // ── Prototype notices ──────────────────────────────────────────────────
    'proto.unsavedNote':
      'Cet écran est encore un prototype d\'interface, mais vos réponses sont enregistrées dans votre compte au fur et à mesure.',
    'proto.label': 'Prototype',

    // ── Verrouillage de prédiction ─────────────────────────────────────────
    'prediction.lockButton':       'Verrouiller la prédiction',
    'prediction.locking':          'Verrouillage…',
    'prediction.lockedBadge':      'Verrouillée',
    'prediction.lockedAt':         'Verrouillée le {date}',
    'prediction.reopenedNotice':   'Un instructeur a rouvert cette prédiction — vous pouvez la modifier à nouveau.',
    'prediction.voidedNotice':     'Cette prédiction a été annulée par un instructeur et ne peut plus être modifiée.',
    'prediction.emptyWarning':     'Écrivez votre prédiction avant de la verrouiller.',
    'prediction.lockErrorFallback':'Impossible de verrouiller cette prédiction. Veuillez réessayer.',
    'prediction.lockHelp':         'Verrouiller horodate votre prédiction et la rend en lecture seule. Un instructeur peut la rouvrir si nécessaire.',
    'prediction.revealTitle':      'Prédiction vs. résultat',
    'prediction.yourPrediction':   'Votre prédiction',
    'prediction.actualOutcome':    'Ce qui s\'est réellement passé',
    'prediction.noPredictionYet':  'Vous n\'avez pas encore verrouillé de prédiction pour cette expérience.',
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
      const raw: string =
        (messages[lang] as Record<string, string>)[key] ??
        (messages.en  as Record<string, string>)[key] ??
        key;
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
