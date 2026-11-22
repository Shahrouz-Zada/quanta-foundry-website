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
    'completion.progress':        '{n} of {total} core stages completed',
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

    // ── Prediction Problem Brief ─────────────────────────────────────────────
    'brief.status.idle':    '',
    'brief.status.saving':  'Saving…',
    'brief.status.saved':   'Saved',
    'brief.status.error':   'Could not save — retrying',
    'brief.footerNote':
      'Your responses are saved to your project workspace as you type. Completed briefs may be nominated for Projects & Notes review after consent and attribution confirmation.',

    // ── Files (F10) ──────────────────────────────────────────────────────────
    'files.nav':              'Files',
    'files.title':            'Files',
    'files.subtitle':         'Drop your work here to share it with your instructor, your team or the whole class.',
    'files.tab.mine':         'My files',
    'files.tab.team':         'Team files',
    'files.tab.class':        'Class files',
    'files.tab.all':          'All files',
    'files.tab.teams':        'Teams',
    'files.drop':             'Drop files here, or',
    'files.choose':           'choose files',
    'files.dropHint':         'Up to 20 MB each. Several files at once is fine.',
    'files.whoSees':          'Who can see them',
    'files.level.STAFF':      'Only me and the instructor',
    'files.level.TEAM':       'My team',
    'files.level.TEAM.team':  'Our team',
    'files.level.CLASS':      'Whole class',
    'files.badge.STAFF':      'Private',
    'files.badge.TEAM':       'Team',
    'files.badge.CLASS':      'Class',
    'files.uploading':        'Uploading…',
    'files.saving':           'Saving…',
    'files.added':            'Added',
    'files.tooBig':           'Larger than 20 MB',
    'files.open':             'Open',
    'files.download':         'Download',
    'files.newVersion':       'New version',
    'files.rename':           'Rename',
    'files.save':             'Save',
    'files.delete':           'Delete',
    'files.deleteConfirm':    'Delete this file and all its versions?',
    'files.versions':         '{n} earlier versions',
    'files.version1':         '1 earlier version',
    'files.hideVersions':     'Hide earlier versions',
    'files.by':               'by {name}',
    'files.storage':          '{used} of {quota} used',
    'files.storageTeam':      'Team space: {used} of {quota} used',
    'files.emptyMine':        'You haven’t added any files yet.',
    'files.emptyTeam':        'Your team hasn’t added any files yet.',
    'files.emptyClass':       'Nobody has shared a file with the whole class yet.',
    'files.emptyAll':         'No student has added a file yet.',
    'files.noTeam':           'You are not in a team yet. Your instructor will add you to one.',
    'files.sharedByTeammates':'Shared by teammates',
    'files.teamSpace':        'Our team’s files',
    'files.yourTeam':         'Your team: {team}',
    'files.notConnected':     'File storage isn’t connected yet, so uploads won’t work. Ask the site administrator.',
    'files.filter':           'Filter by name, student or team',
    'files.noTeamLabel':      'No team',
    'files.teams.create':     'Add team',
    'files.teams.name':       'Team name',
    'files.teams.students':   'Students',
    'files.teams.assign':     'Team',
    'files.teams.none':       'No team yet',
    'files.teams.empty':      'No teams yet. Add the first one above.',
    'files.teams.noStudents': 'No students are enrolled in this class yet.',
    'files.teams.members':    '{n} members',
    'files.teams.member1':    '1 member',
    'files.cancel':           'Cancel',
    'files.unnamed':          'Unnamed',
    'files.staffNote':        'You see every file in this class. Students only see their own files, their team’s, and files shared with the class.',
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
    'completion.progress':        '{n} des {total} étapes principales terminées',
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

    // ── Note de problème de prédiction ───────────────────────────────────────
    'brief.status.idle':    '',
    'brief.status.saving':  'Enregistrement…',
    'brief.status.saved':   'Enregistré',
    'brief.status.error':   'Échec de l\'enregistrement — nouvelle tentative',
    'brief.footerNote':
      'Vos réponses sont enregistrées dans votre espace de projet au fur et à mesure. Les notes terminées peuvent être proposées pour la revue Projets et Notes après consentement et confirmation d\'attribution.',

    // ── Fichiers (F10) ───────────────────────────────────────────────────────
    'files.nav':              'Fichiers',
    'files.title':            'Fichiers',
    'files.subtitle':         'Déposez votre travail ici pour le partager avec votre enseignant, votre équipe ou toute la classe.',
    'files.tab.mine':         'Mes fichiers',
    'files.tab.team':         'Fichiers d’équipe',
    'files.tab.class':        'Fichiers de la classe',
    'files.tab.all':          'Tous les fichiers',
    'files.tab.teams':        'Équipes',
    'files.drop':             'Déposez des fichiers ici, ou',
    'files.choose':           'choisissez des fichiers',
    'files.dropHint':         'Jusqu’à 20 Mo chacun. Plusieurs fichiers à la fois, c’est possible.',
    'files.whoSees':          'Qui peut les voir',
    'files.level.STAFF':      'Seulement moi et l’enseignant',
    'files.level.TEAM':       'Mon équipe',
    'files.level.TEAM.team':  'Notre équipe',
    'files.level.CLASS':      'Toute la classe',
    'files.badge.STAFF':      'Privé',
    'files.badge.TEAM':       'Équipe',
    'files.badge.CLASS':      'Classe',
    'files.uploading':        'Envoi…',
    'files.saving':           'Enregistrement…',
    'files.added':            'Ajouté',
    'files.tooBig':           'Plus de 20 Mo',
    'files.open':             'Ouvrir',
    'files.download':         'Télécharger',
    'files.newVersion':       'Nouvelle version',
    'files.rename':           'Renommer',
    'files.save':             'Enregistrer',
    'files.delete':           'Supprimer',
    'files.deleteConfirm':    'Supprimer ce fichier et toutes ses versions ?',
    'files.versions':         '{n} versions précédentes',
    'files.version1':         '1 version précédente',
    'files.hideVersions':     'Masquer les versions précédentes',
    'files.by':               'par {name}',
    'files.storage':          '{used} utilisés sur {quota}',
    'files.storageTeam':      'Espace d’équipe : {used} utilisés sur {quota}',
    'files.emptyMine':        'Vous n’avez encore ajouté aucun fichier.',
    'files.emptyTeam':        'Votre équipe n’a encore ajouté aucun fichier.',
    'files.emptyClass':       'Personne n’a encore partagé de fichier avec toute la classe.',
    'files.emptyAll':         'Aucun étudiant n’a encore ajouté de fichier.',
    'files.noTeam':           'Vous n’êtes pas encore dans une équipe. Votre enseignant vous en attribuera une.',
    'files.sharedByTeammates':'Partagés par vos coéquipiers',
    'files.teamSpace':        'Les fichiers de notre équipe',
    'files.yourTeam':         'Votre équipe : {team}',
    'files.notConnected':     'Le stockage des fichiers n’est pas encore connecté : l’envoi ne fonctionnera pas. Contactez l’administrateur du site.',
    'files.filter':           'Filtrer par nom, étudiant ou équipe',
    'files.noTeamLabel':      'Sans équipe',
    'files.teams.create':     'Ajouter une équipe',
    'files.teams.name':       'Nom de l’équipe',
    'files.teams.students':   'Étudiants',
    'files.teams.assign':     'Équipe',
    'files.teams.none':       'Pas encore d’équipe',
    'files.teams.empty':      'Aucune équipe pour l’instant. Ajoutez la première ci-dessus.',
    'files.teams.noStudents': 'Aucun étudiant n’est encore inscrit dans cette classe.',
    'files.teams.members':    '{n} membres',
    'files.teams.member1':    '1 membre',
    'files.cancel':           'Annuler',
    'files.unnamed':          'Sans nom',
    'files.staffNote':        'Vous voyez tous les fichiers de la classe. Les étudiants ne voient que leurs fichiers, ceux de leur équipe et ceux partagés avec la classe.',
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
