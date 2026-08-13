"use client";

import { createContext, useContext, useLayoutEffect, useMemo, useSyncExternalStore } from "react";

export type Language = "fr" | "en";

const STORAGE_KEY = "preferred-language";
const LANGUAGE_CHANGE_EVENT = "preferred-language-change";

const french: Record<string, string> = {
  "Dashboard": "Tableau de bord",
  "User Management": "Gestion des utilisateurs",
  "Books": "Livres",
  "Orders": "Commandes",
  "Driver": "Livreur",
  "Review": "Avis",
  "Sales Overview": "Aperçu des ventes",
  "Store Profile": "Profil de la librairie",
  "Payment Option": "Option de paiement",
  "Settings": "Paramètres",
  "Setting": "Paramètres",
  "Logout": "Se déconnecter",
  "Language": "Langue",
  "Interface language": "Langue de l’interface",
  "Choose the language used throughout the seller dashboard.": "Choisissez la langue utilisée dans tout le tableau de bord vendeur.",
  "A book on behavioral psychology and decision-making.": "Un livre sur la psychologie comportementale et la prise de décision.",
  "Books Store Information": "Informations sur la librairie",
  "Drivers assigned to handle and deliver current orders.": "Livreurs chargés de traiter et livrer les commandes en cours.",
  "Email Address": "Adresse e-mail",
  "Let's Get Started!": "Commençons !",
  "Phone Number:": "Numéro de téléphone :",
  "Price *": "Prix *",
  "Review analytics are not available yet": "Les statistiques des avis ne sont pas encore disponibles",
  "Tap to get help now": "Appuyez pour obtenir de l’aide",
  "Total Books": "Total des livres",
  "Total Completed Orders": "Total des commandes terminées",
  "Total Items *": "Nombre total d’articles *",
  "Total Order": "Total des commandes",
  "French": "Français",
  "English": "Anglais",
  "Save": "Enregistrer",
  "Save Changes": "Enregistrer les modifications",
  "Saving...": "Enregistrement...",
  "Cancel": "Annuler",
  "Continue": "Continuer",
  "Edit": "Modifier",
  "Delete": "Supprimer",
  "View": "Voir",
  "Next": "Suivant",
  "Previous": "Précédent",
  "Action": "Action",
  "Status": "Statut",
  "Date": "Date",
  "Price": "Prix",
  "Quantity": "Quantité",
  "Description": "Description",
  "Category": "Catégorie",
  "Author": "Auteur",
  "Title": "Titre",
  "Email": "E-mail",
  "Password": "Mot de passe",
  "Phone Number": "Numéro de téléphone",
  "Phone Number*": "Numéro de téléphone *",
  "Name:": "Nom :",
  "ID:": "Identifiant :",
  "Vehicle:": "Véhicule :",
  "Pending": "En attente",
  "pending": "en attente",
  "Processing": "En cours",
  "processing": "en cours",
  "In progress": "En cours",
  "Accepted": "Acceptée",
  "accepted": "acceptée",
  "Completed": "Terminée",
  "completed": "terminée",
  "Delivered": "Livrée",
  "delivered": "livrée",
  "Cancelled": "Annulée",
  "cancelled": "annulée",
  "Rejected": "Refusée",
  "rejected": "refusée",
  "Available": "Disponible",
  "available": "disponible",
  "Busy": "Occupé",
  "busy": "occupé",
  "Offline": "Hors ligne",
  "offline": "hors ligne",
  "Online": "En ligne",
  "online": "en ligne",
  "Verified": "Vérifiée",
  "Not verified": "Non vérifiée",
  "Remember me": "Se souvenir de moi",
  "Forgot password?": "Mot de passe oublié ?",
  "Sign in": "Se connecter",
  "Signing in...": "Connexion...",
  "Sign up": "S’inscrire",
  "Signing up...": "Inscription...",
  "Sign In Here": "Se connecter ici",
  "Sign Up Here": "S’inscrire ici",
  "User Email": "E-mail utilisateur",
  "Your Email": "Votre e-mail",
  "Enter your Email": "Saisissez votre e-mail",
  "Enter your Password": "Saisissez votre mot de passe",
  "Enter Confirm Password": "Confirmez votre mot de passe",
  "Enter your First Name": "Saisissez votre prénom",
  "Enter your phone number": "Saisissez votre numéro de téléphone",
  "User Name": "Nom d’utilisateur",
  "Current Password": "Mot de passe actuel",
  "Change password": "Modifier le mot de passe",
  "New Password": "Nouveau mot de passe",
  "Confirm Password": "Confirmer le mot de passe",
  "Confirm New Password": "Confirmer le nouveau mot de passe",
  "Reset password": "Réinitialiser le mot de passe",
  "Reset New password": "Définir un nouveau mot de passe",
  "Enter your email to receive the OTP": "Saisissez votre e-mail pour recevoir le code OTP",
  "Enter your new password and confirm password": "Saisissez et confirmez votre nouveau mot de passe",
  "Enter OTP": "Saisir le code OTP",
  "RESEND OTP": "RENVOYER LE CODE",
  "Send OTP": "Envoyer le code",
  "Sending...": "Envoi...",
  "Verify Now": "Vérifier maintenant",
  "Verifying...": "Vérification...",
  "Are you sure to log out?": "Voulez-vous vraiment vous déconnecter ?",
  "Logout of your account": "Déconnexion de votre compte",
  "You will need to log back in to access your dashboard.": "Vous devrez vous reconnecter pour accéder à votre tableau de bord.",
  "Edit your personal information": "Modifiez vos informations personnelles",
  "Profile updated.": "Profil mis à jour.",
  "Password changed.": "Mot de passe modifié.",
  "Books Management": "Gestion des livres",
  "Add, edit, and organize your book collection": "Ajoutez, modifiez et organisez votre collection de livres",
  "Add Single Book": "Ajouter un livre",
  "Bulk Upload CSV": "Import CSV en lot",
  "Published": "Publié",
  "Add New Book": "Ajouter un nouveau livre",
  "Add a new book by filling in the required information": "Ajoutez un livre en renseignant les informations requises",
  "Edit Book": "Modifier le livre",
  "Edit Book Information": "Modifier les informations du livre",
  "Book Title": "Titre du livre",
  "Book Title *": "Titre du livre *",
  "Author *": "Auteur *",
  "Price (€) *": "Prix (€) *",
  "Category *": "Catégorie *",
  "Quantity *": "Quantité *",
  "Cover Image": "Image de couverture",
  "Upload Picture": "Téléverser une image",
  "Recommended size: 800x1200px": "Taille recommandée : 800 × 1200 px",
  "Select category": "Sélectionner une catégorie",
  "Book restricted to ages 18+": "Livre réservé aux 18 ans et plus",
  "No books yet": "Aucun livre pour le moment",
  "Create books from seller dashboard and they will show here.": "Ajoutez des livres depuis le tableau de bord vendeur pour les afficher ici.",
  "Untitled book": "Livre sans titre",
  "Unknown author": "Auteur inconnu",
  "Uncategorized": "Sans catégorie",
  "Stock out": "Rupture de stock",
  "Bulk Upload Books": "Importer des livres en lot",
  "Upload a CSV file to add multiple books at once": "Importez un fichier CSV pour ajouter plusieurs livres à la fois",
  "CSV format": "Format CSV",
  "Keep the first row exactly as column headers. Required columns are marked with *.": "Conservez exactement les en-têtes de colonnes sur la première ligne. Les colonnes obligatoires sont marquées d’un *.",
  "Download Sample": "Télécharger l’exemple",
  "Column": "Colonne",
  "Required": "Obligatoire",
  "Example": "Exemple",
  "Yes": "Oui",
  "No": "Non",
  "Choose CSV file": "Choisir un fichier CSV",
  "Only .csv files are supported": "Seuls les fichiers .csv sont acceptés",
  "Row": "Ligne",
  "Upload Books": "Importer les livres",
  "Uploading...": "Importation...",
  "Select books to publish": "Sélectionner les livres à publier",
  "Publishing...": "Publication...",
  "Orders Management": "Gestion des commandes",
  "Track and manage customer orders": "Suivez et gérez les commandes clients",
  "Order *": "Commande *",
  "Order ID": "N° de commande",
  "Order Date: *": "Date de commande : *",
  "Order Status": "Statut de la commande",
  "Order Items Summary": "Récapitulatif des articles",
  "Customer Information": "Informations client",
  "Customer Details": "Détails du client",
  "Customer Name *": "Nom du client *",
  "Customer name": "Nom du client",
  "Delivery Address:": "Adresse de livraison :",
  "Subtotal": "Sous-total",
  "Delivery Fee": "Frais de livraison",
  "Total": "Total",
  "Payment Method:": "Mode de paiement :",
  "Payment Status:": "Statut du paiement :",
  "No orders found": "Aucune commande trouvée",
  "No recent orders yet": "Aucune commande récente",
  "Total Orders": "Total des commandes",
  "Completed Orders": "Commandes terminées",
  "Orders Today": "Commandes du jour",
  "Total Revenue": "Chiffre d’affaires total",
  "Net Revenue": "Revenu net",
  "Admin Commission": "Commission administrateur",
  "Avg. Order Value": "Panier moyen",
  "Revenue Overview": "Aperçu des revenus",
  "Revenue over the last 7 days": "Revenus des 7 derniers jours",
  "Sales Analysis": "Analyse des ventes",
  "Monitor sales performance and revenue insights": "Suivez les performances commerciales et les revenus",
  "Top Selling Books": "Livres les plus vendus",
  "Sold Books": "Livres vendus",
  "Your most popular and frequently purchased titles": "Vos titres les plus populaires et les plus achetés",
  "No sales data yet": "Aucune donnée de vente",
  "No sold books yet": "Aucun livre vendu",
  "Export Summary": "Exporter le récapitulatif",
  "Review Management": "Gestion des avis",
  "View, manage customer reviews.": "Consultez et gérez les avis clients.",
  "Review Analysis": "Analyse des avis",
  "Review Analysis over the last 7 days": "Analyse des avis des 7 derniers jours",
  "Total Review": "Total des avis",
  "Total Positive Review": "Avis positifs",
  "Total Negative Review": "Avis négatifs",
  "Top Review": "Meilleurs avis",
  "See all Review": "Voir tous les avis",
  "No reviews yet": "Aucun avis pour le moment",
  "Highest-rated reviews from customers across recent orders": "Avis clients les mieux notés sur les commandes récentes",
  "Manage users and access with ease": "Gérez facilement les utilisateurs et les accès",
  "Total User": "Total des utilisateurs",
  "Total recent users": "Utilisateurs récents",
  "Recent Users": "Utilisateurs récents",
  "No customers have ordered from you yet.": "Aucun client n’a encore passé de commande.",
  "Store Profile Management": "Gestion du profil de la librairie",
  "Manage your public store information": "Gérez les informations publiques de votre librairie",
  "Store Name": "Nom de la librairie",
  "Store Name *": "Nom de la librairie *",
  "Books Store Name *": "Nom de la librairie *",
  "Owner Name": "Nom du propriétaire",
  "Store Description": "Description de la librairie",
  "Physical Address": "Adresse physique",
  "Location *": "Localisation *",
  "Delivery Coverage Area": "Zone de livraison",
  "Manage your Payment Option": "Gérez votre option de paiement",
  "Connect your account": "Connecter votre compte",
  "Connect": "Connecter",
  "Driver Management": "Gestion des livreurs",
  "Manage drivers and track driver status in real time.": "Gérez les livreurs et suivez leur statut en temps réel.",
  "Assigned Drivers": "Livreurs affectés",
  "Add new request": "Ajouter une demande",
  "New Request For Driver": "Nouvelle demande de livraison",
  "Submit a delivery request for one of your orders.": "Envoyez une demande de livraison pour l’une de vos commandes.",
  "No driver requests yet": "Aucune demande de livraison",
  "No unassigned seller orders available.": "Aucune commande vendeur non affectée n’est disponible.",
  "Notification Management": "Gestion des notifications",
  "No notifications": "Aucune notification",
  "Mark as all Read": "Tout marquer comme lu",
  "See all notification": "Voir toutes les notifications",
  "Open notifications": "Ouvrir les notifications",
  "Quick Actions": "Actions rapides",
  "Check Sales": "Consulter les ventes",
  "View Orders": "Voir les commandes",
  "Welcome back to your Seller Dashboard": "Bienvenue sur votre tableau de bord vendeur",
  "Open menu": "Ouvrir le menu",
  "Loading...": "Chargement...",
  "N/A": "Indisponible",
  "Account created successfully.": "Compte créé avec succès.",
  "Book created.": "Livre créé.",
  "Book deleted.": "Livre supprimé.",
  "Book updated.": "Livre mis à jour.",
  "Books published.": "Livres publiés.",
  "Bulk upload failed.": "Échec de l’import en lot.",
  "Cash on Delivery": "Paiement à la livraison",
  "Create an account": "Créer un compte",
  "CSV must include a header row and at least one book row.": "Le CSV doit contenir une ligne d’en-tête et au moins une ligne de livre.",
  "Delivery partner picked up order": "Le partenaire de livraison a récupéré la commande",
  "Driver request submitted.": "Demande de livraison envoyée.",
  "Enter the complete OTP.": "Saisissez le code OTP complet.",
  "No comment provided.": "Aucun commentaire fourni.",
  "Order delivered successfully": "Commande livrée avec succès",
  "Order received by store": "Commande reçue par la librairie",
  "Order status updated.": "Statut de la commande mis à jour.",
  "OTP sent again.": "Code OTP renvoyé.",
  "OTP sent to your email.": "Code OTP envoyé à votre adresse e-mail.",
  "OTP verified.": "Code OTP vérifié.",
  "Password reset successfully.": "Mot de passe réinitialisé avec succès.",
  "Passwords do not match.": "Les mots de passe ne correspondent pas.",
  "Please upload a .csv file.": "Veuillez importer un fichier .csv.",
  "Sending OTP...": "Envoi du code OTP...",
  "Showing 0 results": "Aucun résultat affiché",
  "Signed in successfully.": "Connexion réussie.",
  "Something went wrong": "Une erreur est survenue",
  "Stock quantity must be a whole number.": "La quantité en stock doit être un nombre entier.",
  "Store is preparing your order": "La librairie prépare votre commande",
  "Store updated.": "Librairie mise à jour.",
  "Stripe Connect onboarding will start.": "La configuration de Stripe Connect va commencer.",
  "Title, author, category, and price are required.": "Le titre, l’auteur, la catégorie et le prix sont obligatoires.",
  "Unable to create seller account.": "Impossible de créer le compte vendeur.",
  "Unable to reset password.": "Impossible de réinitialiser le mot de passe.",
  "Unable to send OTP.": "Impossible d’envoyer le code OTP.",
  "Unable to sign in as seller.": "Impossible de se connecter en tant que vendeur.",
  "Unable to verify OTP.": "Impossible de vérifier le code OTP.",
  "All": "Tous",
  "Anonymous": "Anonyme",
  "Book": "Livre",
  "Customer": "Client",
  "Driver request": "Demande de livraison",
  "Hide password": "Masquer le mot de passe",
  "Show password": "Afficher le mot de passe",
  "Loading orders...": "Chargement des commandes...",
  "Month": "Mois",
  "New Order": "Nouvelle commande",
  "New Review": "Nouvel avis",
  "New driver": "Nouveau livreur",
  "No results": "Aucun résultat",
  "Notification": "Notification",
  "Picked": "Récupérée",
  "picked": "récupérée",
  "Profile": "Profil",
  "Resend OTP": "Renvoyer le code OTP",
  "Resetting...": "Réinitialisation...",
  "Select order": "Sélectionner une commande",
  "Seller": "Vendeur",
  "Submit Request": "Envoyer la demande",
  "Submitting...": "Envoi...",
  "Unknown user": "Utilisateur inconnu",
  "User": "Utilisateur",
  "Week": "Semaine",
  "Year": "Année",
  "in progress": "en cours",
};

function translateDynamic(value: string) {
  const exact = french[value];
  if (exact) return exact;

  const rules: Array<[RegExp, (...matches: string[]) => string]> = [
    [/^Resend code in (\d+)s$/, (_, seconds) => `Renvoyer le code dans ${seconds} s`],
    [/^(\d+) in stock$/, (_, count) => `${count} en stock`],
    [/^Preview: (\d+) valid (?:book|books)$/, (_, count) => `Aperçu : ${count} livre${count === "1" ? "" : "s"} valide${count === "1" ? "" : "s"}`],
    [/^Showing (\d+) to (\d+) of (\d+) (.+)$/, (_, from, to, total, item) => `Affichage de ${from} à ${to} sur ${total} ${item}`],
    [/^Showing 0 (.+)$/, (_, item) => `Aucun ${item} affiché`],
    [/^(\d+) (Books|books)$/, (_, count) => `${count} livre${count === "1" ? "" : "s"}`],
    [/^(\d+) (Orders|orders)$/, (_, count) => `${count} commande${count === "1" ? "" : "s"}`],
    [/^(\d+) (item|items)$/, (_, count) => `${count} article${count === "1" ? "" : "s"}`],
    [/^Row (\d+): (.+)$/, (_, row, message) => `Ligne ${row} : ${message}`],
    [/^(\d+) skipped row\(s\)$/, (_, count) => `${count} ligne(s) ignorée(s)`],
  ];

  for (const [pattern, formatter] of rules) {
    const match = value.match(pattern);
    if (match) return formatter(...match);
  }
  return value;
}

type LanguageContextValue = { language: Language; setLanguage: (language: Language) => void };
const LanguageContext = createContext<LanguageContextValue>({ language: "fr", setLanguage: () => undefined });
const originalText = new WeakMap<Text, string>();
const originalAttributes = new WeakMap<Element, Map<string, string>>();
const translatedAttributes = ["placeholder", "aria-label", "title"];

function walk(root: Node, language: Language, refreshOriginal = false) {
  if (root.nodeType === Node.TEXT_NODE) {
    const textNode = root as Text;
    if (refreshOriginal || !originalText.has(textNode)) originalText.set(textNode, textNode.data);
    const original = originalText.get(textNode) || textNode.data;
    if (language === "en") return void (textNode.data = original);
    const trimmed = original.trim();
    if (!trimmed) return;
    textNode.data = original.replace(trimmed, translateDynamic(trimmed));
    return;
  }
  if (root.nodeType !== Node.ELEMENT_NODE) return;
  const element = root as Element;
  let attributes = originalAttributes.get(element);
  if (!attributes) {
    attributes = new Map();
    originalAttributes.set(element, attributes);
  }
  translatedAttributes.forEach((name) => {
    const current = element.getAttribute(name);
    if (current === null) return;
    if (refreshOriginal || !attributes?.has(name)) attributes?.set(name, current);
    const original = attributes?.get(name) || current;
    element.setAttribute(name, language === "fr" ? translateDynamic(original) : original);
  });
  element.childNodes.forEach((child) => walk(child, language));
}

function TranslationBoundary({ children, language }: { children: React.ReactNode; language: Language }) {
  useLayoutEffect(() => {
    document.documentElement.lang = language;
    const root = document.body;
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "characterData") translate(mutation.target, true);
        if (mutation.type === "attributes") translate(mutation.target, true);
        mutation.addedNodes.forEach((node) => translate(node));
      });
    });
    const translate = (node: Node, refreshOriginal = false) => {
      observer.disconnect();
      walk(node, language, refreshOriginal);
      observer.observe(root, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: translatedAttributes });
    };
    translate(root);
    return () => observer.disconnect();
  }, [language]);
  return children;
}

function LanguageMount({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = useSyncExternalStore<Language>(
    (onChange) => {
      const handleStorage = (event: StorageEvent) => {
        if (event.key === STORAGE_KEY) onChange();
      };
      window.addEventListener("storage", handleStorage);
      window.addEventListener(LANGUAGE_CHANGE_EVENT, onChange);
      return () => {
        window.removeEventListener("storage", handleStorage);
        window.removeEventListener(LANGUAGE_CHANGE_EVENT, onChange);
      };
    },
    (): Language => window.localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "fr",
    (): Language => "fr",
  );
  useLayoutEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  const value = useMemo<LanguageContextValue>(() => ({
    language,
    setLanguage: (nextLanguage) => {
      window.localStorage.setItem(STORAGE_KEY, nextLanguage);
      document.documentElement.lang = nextLanguage;
      window.dispatchEvent(new Event(LANGUAGE_CHANGE_EVENT));
    },
  }), [language]);
  return (
    <LanguageContext.Provider value={value}>
      <TranslationBoundary language={language}>
        <LanguageMount key={language}>{children}</LanguageMount>
      </TranslationBoundary>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  return (
    <label className="block">
      <span className="mb-2 block text-[14px] font-medium text-[#202124]">Interface language</span>
      <select
        aria-label="Interface language"
        className="h-12 w-full rounded-[10px] border border-[#cfd4dc] bg-white px-4 text-[14px] text-[#202124] outline-none focus:border-[#3d8ef5]"
        value={language}
        onChange={(event) => setLanguage(event.target.value as Language)}
      >
        <option value="fr">Français</option>
        <option value="en">English</option>
      </select>
    </label>
  );
}
