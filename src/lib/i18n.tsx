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
    'files.tab.audit':        'Teams we audit',
    'files.audit.note':       'Read-only. Your instructor opened these teams’ team files to your team for an audit.',
    'files.audit.empty':      '{team} has no team files yet.',
    'files.audit.seenBy':     'For an audit set by your instructor, {teams} can also open your team files (read-only).',
    'files.audits.title':     'Audit pairings',
    'files.audits.help':      'Members of the first team can open the second team’s team files, read-only (current versions only). Personal files, earlier versions and activity answers stay private.',
    'files.audits.auditor':   'Team that audits',
    'files.audits.audited':   'Team being audited',
    'files.audits.add':       'Add pairing',
    'files.audits.ring':      'Each team audits the next one',
    'files.audits.none':      'No pairings yet.',
    'files.audits.verb':      'audits',
    'files.audits.remove':    'Remove pairing',
    'files.audits.needTeams': 'Create at least two teams to set up audits.',
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
    'notebook.preview':       'Preview',
    'notebook.earlier':       'earlier version',
    'notebook.back':          'Back to files',
    'notebook.download':      'Download notebook',
    'notebook.readOnly':      'Read-only preview. Nothing in this notebook is run.',
    'notebook.loading':       'Loading notebook…',
    'notebook.err.load':      'This notebook could not be loaded. Please try again.',
    'notebook.err.missing':   'This notebook is no longer available.',
    'notebook.err.empty':     'This file is empty.',
    'notebook.err.notJson':   'This file is not a valid notebook (it is not readable JSON). You can still download it.',
    'notebook.err.notNotebook': 'This file does not look like a Jupyter notebook. You can still download it.',
    'notebook.err.tooNew':    'This notebook uses a newer format than the preview can read. You can still download it.',
    'notebook.summary':       '{cells} cells · {code} code · {text} text · {outputs} outputs',
    'notebook.kernel':        'Kernel: {name}',
    'notebook.showOutputs':   'Show outputs',
    'notebook.wrap':          'Wrap long lines',
    'notebook.noCells':       'This notebook has no cells.',
    'notebook.cut':           'This notebook is very large, so long cells and outputs were shortened here. Download the file to see everything.',
    'notebook.unsupported':   'This output needs a live notebook (interactive chart or widget) and cannot be shown here.',
    'notebook.image':         'Image',
    'notebook.outputTitle':   'Notebook output',
    'notebook.stderr':        'Messages',
    'notebook.cellIn':        'In [{n}]',
    'notebook.cellOut':       'Out',
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
    'class.home': 'Class',
    'class.sessions': 'Sessions',
    'class.session': 'Session {n}',
    'class.next': 'Next session',
    'class.room': 'Room {room}',
    'class.noSessions': 'No sessions yet.',
    'class.noMaterials': 'No materials yet.',
    'class.releaseOn': 'Materials available {date}',
    'class.general': 'Course materials',
    'class.tools': 'Tools',
    'class.noTools': 'No tools yet.',
    'class.files': 'Files',
    'class.open': 'Open',
    'class.download': 'Download',
    'class.colab': 'Open in Colab',
    'class.colabHelp': 'Download the notebook, then in Colab choose File → Upload notebook.',
    'class.dataLink': 'Copy link for notebooks',
    'class.copied': 'Copied',
    'class.updated': 'Updated {date}',
    'class.viewOnly': 'View only',
    'class.interactive': 'Interactive session',
    'class.back': 'Back to class',
    'class.openLink': 'Open link',
    'class.notYours': 'This class isn’t yours',
    'class.kind.DECK': 'Slides',
    'class.kind.PREREAD': 'Pre-read',
    'class.kind.NOTEBOOK': 'Notebook',
    'class.kind.DATASET': 'Dataset',
    'class.kind.DOCUMENT': 'Document',
    'class.kind.LINK': 'Link',
    'class.lang.EN': 'English',
    'class.lang.FR': 'French',
    'class.lang.BOTH': 'EN/FR',
    'activity.activities': 'Activities',
    'activity.due': 'Due {date}',
    'activity.opens': 'Opens {date}',
    'activity.team': 'Team answer · {team}',
    'activity.individual': 'Individual answer',
    'activity.status.not-started': 'Not started',
    'activity.status.in-progress': 'In progress',
    'activity.status.submitted': 'Submitted',
    'activity.status.late': 'Submitted late',
    'activity.window.closed': 'Closed',
    'activity.window.not-open': 'Not open yet',
    'activity.window.late': 'Past the deadline: late answers are accepted',
    'activity.saving': 'Saving…',
    'activity.saved': 'Saved {time} by {name}',
    'activity.savedShort': 'Saved',
    'activity.saveFailed': 'Not saved yet. Check your connection; we will retry.',
    'activity.submit': 'Submit',
    'activity.resubmit': 'Submit again',
    'activity.submittedAt': 'Submitted {date}',
    'activity.editable': 'You can still change it until the deadline.',
    'activity.optional': 'optional',
    'activity.problem.required': 'This answer is required.',
    'activity.problem.number': 'Enter a number.',
    'activity.problem.range': 'Outside the allowed range ({range}).',
    'activity.problem.choice': 'Choose one of the options.',
    'activity.problem.url': 'Enter a web address starting with https://',
    'activity.problem.file': 'Attach at least one file.',
    'activity.problem.empty': 'Answer before submitting.',
    'activity.choose': 'Choose…',
    'activity.link': 'Link',
    'activity.files': 'Files',
    'activity.attach': 'Attach from my files',
    'activity.attachTeam': 'Attach from team files',
    'activity.upload': 'Upload a new file',
    'activity.uploading': 'Uploading…',
    'activity.uploadNoteTeam': 'New files are also saved in your team’s Files.',
    'activity.uploadNote': 'New files are also saved in your Files.',
    'activity.remove': 'Remove',
    'activity.noFiles': 'No files attached yet.',
    'activity.noAttachable': 'No files to attach yet.',
    'activity.noTeam': 'This is a team activity and you are not in a team yet. Ask your instructor.',
    'activity.history': 'History',
    'activity.readOnly': 'Answers can no longer change.',
    'activity.err.notAllowed': 'You can’t answer this activity.',
    'activity.err.notOpen': 'This activity is not open yet.',
    'activity.err.closed': 'The deadline has passed; answers can no longer change.',
    'activity.err.noTeam': 'You are not in a team yet. Ask your instructor.',
    'activity.err.failed': 'Something went wrong. Please try again.',
    'activity.err.tooManyFiles': 'This activity takes no more files.',
    'activity.err.fileNotYours': 'You can only attach your own (or your team’s) files.',
    'activity.err.problems': 'Some answers are missing or not valid yet.',
    'activity.err.gone': 'This activity no longer exists.',
    'activity.kind.SHORT_ANSWER': 'Short answers',
    'activity.kind.FORM': 'Form',
    'activity.kind.FILE': 'File upload',
    'activity.kind.LINK': 'Link',
    'activity.kind.QUIZ': 'Quiz',
    'activity.kind.CARD_SORT': 'Card sort',
    'activity.quiz.pickOne': 'Choose one answer.',
    'activity.quiz.pickMany': 'Choose all that apply.',
    'activity.sort.help': 'Drag each card into a category, or use the menu on the card.',
    'activity.sort.unsorted': 'Not sorted yet',
    'activity.sort.moveTo': 'Move to…',
    'activity.problem.sort': 'Put this card in a category.',
    'activity.result.score': 'Your score: {score} / {max}',
    'activity.result.right': 'Right',
    'activity.result.wrong': 'Not right',
    'activity.result.answer': 'Right answer: {answer}',
    'activity.result.expected': 'Expected: {category}',
    'activity.result.afterSubmit': 'You will see your results as soon as you submit. Your answers can’t change after that.',
    'activity.result.afterDeadline': 'Results and the right answers are shown after the deadline.',
    'activity.result.manual': 'Your instructor will share the results later.',
    'activity.submitFinal': 'Submit (final)',
    'activity.err.locked': 'Results are shown, so answers can no longer change.',
    'activity.model': 'Model answer',
    'activity.modelOpen': 'Open the model answer',
    'files.cancel':           'Cancel',
    'files.unnamed':          'Unnamed',
    'files.staffNote':        'You see every file in this class. Students only see their own files, their team’s, files shared with the class, and the team files of teams they audit.',
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
    'files.tab.audit':        'Équipes auditées',
    'files.audit.note':       'Lecture seule. Votre enseignant a ouvert les fichiers d’équipe de ces équipes à la vôtre pour un audit.',
    'files.audit.empty':      '{team} n’a pas encore de fichiers d’équipe.',
    'files.audit.seenBy':     'Pour un audit organisé par votre enseignant, vos fichiers d’équipe sont aussi visibles (lecture seule) par : {teams}.',
    'files.audits.title':     'Binômes d’audit',
    'files.audits.help':      'Les membres de la première équipe peuvent ouvrir les fichiers d’équipe de la seconde, en lecture seule (versions actuelles). Les fichiers personnels, les versions précédentes et les réponses aux activités restent privés.',
    'files.audits.auditor':   'Équipe qui audite',
    'files.audits.audited':   'Équipe auditée',
    'files.audits.add':       'Ajouter',
    'files.audits.ring':      'Chaque équipe audite la suivante',
    'files.audits.none':      'Aucun binôme pour l’instant.',
    'files.audits.verb':      'audite',
    'files.audits.remove':    'Retirer le binôme',
    'files.audits.needTeams': 'Créez au moins deux équipes pour organiser des audits.',
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
    'notebook.preview':       'Aperçu',
    'notebook.earlier':       'version précédente',
    'notebook.back':          'Retour aux fichiers',
    'notebook.download':      'Télécharger le notebook',
    'notebook.readOnly':      'Aperçu en lecture seule. Rien n’est exécuté dans ce notebook.',
    'notebook.loading':       'Chargement du notebook…',
    'notebook.err.load':      'Ce notebook n’a pas pu être chargé. Veuillez réessayer.',
    'notebook.err.missing':   'Ce notebook n’est plus disponible.',
    'notebook.err.empty':     'Ce fichier est vide.',
    'notebook.err.notJson':   'Ce fichier n’est pas un notebook valide (JSON illisible). Vous pouvez quand même le télécharger.',
    'notebook.err.notNotebook': 'Ce fichier ne ressemble pas à un notebook Jupyter. Vous pouvez quand même le télécharger.',
    'notebook.err.tooNew':    'Ce notebook utilise un format plus récent que celui que l’aperçu sait lire. Vous pouvez quand même le télécharger.',
    'notebook.summary':       '{cells} cellules · {code} code · {text} texte · {outputs} sorties',
    'notebook.kernel':        'Noyau : {name}',
    'notebook.showOutputs':   'Afficher les sorties',
    'notebook.wrap':          'Retour à la ligne',
    'notebook.noCells':       'Ce notebook ne contient aucune cellule.',
    'notebook.cut':           'Ce notebook est très volumineux : les cellules et sorties trop longues ont été raccourcies ici. Téléchargez le fichier pour tout voir.',
    'notebook.unsupported':   'Cette sortie nécessite un notebook actif (graphique interactif ou widget) et ne peut pas être affichée ici.',
    'notebook.image':         'Image',
    'notebook.outputTitle':   'Sortie du notebook',
    'notebook.stderr':        'Messages',
    'notebook.cellIn':        'In [{n}]',
    'notebook.cellOut':       'Out',
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
    'class.home': 'Classe',
    'class.sessions': 'Séances',
    'class.session': 'Séance {n}',
    'class.next': 'Prochaine séance',
    'class.room': 'Salle {room}',
    'class.noSessions': 'Aucune séance pour l’instant.',
    'class.noMaterials': 'Aucun support pour l’instant.',
    'class.releaseOn': 'Supports disponibles le {date}',
    'class.general': 'Supports du cours',
    'class.tools': 'Outils',
    'class.noTools': 'Aucun outil pour l’instant.',
    'class.files': 'Fichiers',
    'class.open': 'Ouvrir',
    'class.download': 'Télécharger',
    'class.colab': 'Ouvrir dans Colab',
    'class.colabHelp': 'Téléchargez le notebook, puis dans Colab choisissez Fichier → Importer un notebook.',
    'class.dataLink': 'Copier le lien pour les notebooks',
    'class.copied': 'Copié',
    'class.updated': 'Mis à jour le {date}',
    'class.viewOnly': 'Consultation seule',
    'class.interactive': 'Séance interactive',
    'class.back': 'Retour à la classe',
    'class.openLink': 'Ouvrir le lien',
    'class.notYours': 'Cette classe n’est pas la vôtre',
    'class.kind.DECK': 'Diapositives',
    'class.kind.PREREAD': 'Lecture préalable',
    'class.kind.NOTEBOOK': 'Notebook',
    'class.kind.DATASET': 'Jeu de données',
    'class.kind.DOCUMENT': 'Document',
    'class.kind.LINK': 'Lien',
    'class.lang.EN': 'Anglais',
    'class.lang.FR': 'Français',
    'class.lang.BOTH': 'EN/FR',
    'activity.activities': 'Activités',
    'activity.due': 'À rendre le {date}',
    'activity.opens': 'Ouvre le {date}',
    'activity.team': 'Réponse d’équipe · {team}',
    'activity.individual': 'Réponse individuelle',
    'activity.status.not-started': 'Pas commencé',
    'activity.status.in-progress': 'En cours',
    'activity.status.submitted': 'Rendu',
    'activity.status.late': 'Rendu en retard',
    'activity.window.closed': 'Fermé',
    'activity.window.not-open': 'Pas encore ouvert',
    'activity.window.late': 'Date limite dépassée : les rendus en retard sont acceptés',
    'activity.saving': 'Enregistrement…',
    'activity.saved': 'Enregistré à {time} par {name}',
    'activity.savedShort': 'Enregistré',
    'activity.saveFailed': 'Pas encore enregistré. Vérifiez votre connexion ; nouvel essai automatique.',
    'activity.submit': 'Rendre',
    'activity.resubmit': 'Rendre à nouveau',
    'activity.submittedAt': 'Rendu le {date}',
    'activity.editable': 'Vous pouvez encore le modifier jusqu’à la date limite.',
    'activity.optional': 'facultatif',
    'activity.problem.required': 'Cette réponse est obligatoire.',
    'activity.problem.number': 'Saisissez un nombre.',
    'activity.problem.range': 'Hors de la plage autorisée ({range}).',
    'activity.problem.choice': 'Choisissez une des options.',
    'activity.problem.url': 'Saisissez une adresse web commençant par https://',
    'activity.problem.file': 'Joignez au moins un fichier.',
    'activity.problem.empty': 'Répondez avant de rendre.',
    'activity.choose': 'Choisir…',
    'activity.link': 'Lien',
    'activity.files': 'Fichiers',
    'activity.attach': 'Joindre depuis mes fichiers',
    'activity.attachTeam': 'Joindre depuis les fichiers de l’équipe',
    'activity.upload': 'Téléverser un nouveau fichier',
    'activity.uploading': 'Téléversement…',
    'activity.uploadNoteTeam': 'Les nouveaux fichiers sont aussi enregistrés dans les Fichiers de l’équipe.',
    'activity.uploadNote': 'Les nouveaux fichiers sont aussi enregistrés dans vos Fichiers.',
    'activity.remove': 'Retirer',
    'activity.noFiles': 'Aucun fichier joint.',
    'activity.noAttachable': 'Aucun fichier à joindre pour l’instant.',
    'activity.noTeam': 'C’est une activité d’équipe et vous n’êtes pas encore dans une équipe. Demandez à votre enseignant.',
    'activity.history': 'Historique',
    'activity.readOnly': 'Les réponses ne peuvent plus être modifiées.',
    'activity.err.notAllowed': 'Vous ne pouvez pas répondre à cette activité.',
    'activity.err.notOpen': 'Cette activité n’est pas encore ouverte.',
    'activity.err.closed': 'La date limite est passée ; les réponses ne peuvent plus être modifiées.',
    'activity.err.noTeam': 'Vous n’êtes pas encore dans une équipe. Demandez à votre enseignant.',
    'activity.err.failed': 'Une erreur est survenue. Réessayez.',
    'activity.err.tooManyFiles': 'Cette activité n’accepte plus de fichiers.',
    'activity.err.fileNotYours': 'Vous ne pouvez joindre que vos fichiers (ou ceux de votre équipe).',
    'activity.err.problems': 'Certaines réponses manquent ou ne sont pas encore valides.',
    'activity.err.gone': 'Cette activité n’existe plus.',
    'activity.kind.SHORT_ANSWER': 'Réponses courtes',
    'activity.kind.FORM': 'Formulaire',
    'activity.kind.FILE': 'Dépôt de fichier',
    'activity.kind.LINK': 'Lien',
    'activity.kind.QUIZ': 'Quiz',
    'activity.kind.CARD_SORT': 'Tri de cartes',
    'activity.quiz.pickOne': 'Choisissez une réponse.',
    'activity.quiz.pickMany': 'Choisissez toutes les bonnes réponses.',
    'activity.sort.help': 'Glissez chaque carte dans une catégorie, ou utilisez le menu de la carte.',
    'activity.sort.unsorted': 'Pas encore triées',
    'activity.sort.moveTo': 'Déplacer vers…',
    'activity.problem.sort': 'Placez cette carte dans une catégorie.',
    'activity.result.score': 'Votre score : {score} / {max}',
    'activity.result.right': 'Juste',
    'activity.result.wrong': 'Pas juste',
    'activity.result.answer': 'Bonne réponse : {answer}',
    'activity.result.expected': 'Attendu : {category}',
    'activity.result.afterSubmit': 'Vous verrez vos résultats dès que vous aurez rendu. Vos réponses ne pourront plus changer ensuite.',
    'activity.result.afterDeadline': 'Les résultats et les bonnes réponses sont affichés après la date limite.',
    'activity.result.manual': 'Votre enseignant partagera les résultats plus tard.',
    'activity.submitFinal': 'Rendre (définitif)',
    'activity.err.locked': 'Les résultats sont affichés : les réponses ne peuvent plus changer.',
    'activity.model': 'Corrigé',
    'activity.modelOpen': 'Ouvrir le corrigé',
    'files.cancel':           'Annuler',
    'files.unnamed':          'Sans nom',
    'files.staffNote':        'Vous voyez tous les fichiers de la classe. Les étudiants ne voient que leurs fichiers, ceux de leur équipe, ceux partagés avec la classe et les fichiers d’équipe des équipes qu’ils auditent.',
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
