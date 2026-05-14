# Optimisation des itinéraires logistiques par IA
## Rapport de Projet de Fin d'Année (PFA)

---

# Introduction Générale

### 1. Contexte du projet
Lorsque nous avons entamé la réflexion sur le sujet de notre Projet de Fin d'Année, une évidence s'est rapidement imposée à nous : le monde qui nous entoure accélère. Aujourd'hui, que ce soit pour recevoir un repas chaud, un colis commandé à l'autre bout du monde ou des fournitures médicales urgentes, l'attente n'est plus tolérée. Cette exigence d'immédiateté a propulsé le secteur de la logistique urbaine sur le devant de la scène mondiale. Porté par l'essor fulgurant du commerce électronique post-pandémie, le volume de marchandises transitant chaque jour dans nos villes a littéralement explosé. 

Cependant, cette croissance exponentielle n'est pas sans conséquences. Nos infrastructures routières, souvent anciennes et inadaptées à une telle densité, saturent. Les entreprises de livraison se retrouvent prises en étau : d'un côté, elles doivent satisfaire des clients de plus en plus exigeants sur les délais ; de l'autre, elles subissent de plein fouet l'augmentation des coûts du carburant, l'usure de leurs flottes et la pression des nouvelles réglementations environnementales visant à réduire les émissions de carbone. C'est précisément à la croisée de ces immenses défis économiques, écologiques et technologiques que s'inscrit notre projet. Nous avons voulu comprendre comment la technologie moderne, et plus particulièrement l'Intelligence Artificielle, pouvait offrir une respiration à ce secteur sous tension.

### 2. Problématique
Derrière chaque colis livré à l'heure se cache en réalité un véritable casse-tête mathématique. Dans le jargon scientifique, on appelle cela le "Problème de Tournées de Véhicules" (ou Vehicle Routing Problem - VRP). Imaginez un gestionnaire de flotte qui arrive au bureau le matin : il a 50 camions de tailles différentes et 1000 colis à livrer à travers une grande métropole, avec certains clients exigeant d'être livrés avant 10h, et d'autres refusant les livraisons l'après-midi. S'il tente de calculer le meilleur itinéraire de tête ou même avec un simple fichier Excel, les combinaisons possibles dépassent rapidement le nombre d'atomes dans l'univers. 

La problématique qui a guidé tout notre travail peut donc se formuler ainsi : *Comment concevoir un système intelligent capable de déterminer de manière autonome et dynamique les itinéraires les plus rentables pour une flotte de véhicules, tout en respectant un cahier des charges opérationnel strict (capacités, fenêtres de temps) et en s'adaptant aux imprévus de la route (trafic, météo) ?*
Les méthodes traditionnelles de planification statique montrent aujourd'hui leurs limites. Si un accident bloque un axe majeur à 8h du matin, tout le planning de la journée s'effondre. Il fallait donc penser à une solution dynamique.

### 3. Objectifs du projet
Pour répondre à cette problématique, notre objectif ne s'est pas limité à écrire un script d'algorithme isolé dans un laboratoire. Nous avons eu l'ambition de créer **LogiOptima IA**, une plateforme logicielle complète (Full-Stack) qui pourrait théoriquement être déployée demain dans une entreprise de transport. Nos objectifs spécifiques ont été définis comme suit :
- **Automatiser la prise de décision** : Remplacer le travail fastidieux du planificateur humain par des algorithmes d'optimisation capables de générer des tournées en quelques secondes.
- **Réduire drastiquement les coûts** : En minimisant la distance kilométrique totale, nous visions à réduire la consommation de carburant et les frais de maintenance, augmentant ainsi la marge opérationnelle de l'entreprise.
- **Intégrer le chaos du monde réel** : Implémenter un simulateur d'aléas (trafic, météo) pour forcer notre Intelligence Artificielle à s'adapter et à recalculer les temps estimés d'arrivée (ETA).
- **Comparer différentes "intelligences"** : Ne pas se contenter d'une seule méthode, mais développer et mettre en compétition plusieurs paradigmes d'IA (Recherche exacte, Algorithme Génétique, Apprentissage par Renforcement) via un tableau de bord de *benchmarking*.
- **Offrir une expérience utilisateur (UX) professionnelle** : Développer des interfaces distinctes et intuitives pour l'administrateur au bureau, le chauffeur dans son camion, et le client chez lui.

### 4. Gestion de projet
#### 4.1. Méthodologie de développement
Se lancer dans un projet Full-Stack impliquant de l'Intelligence Artificielle demande une organisation rigoureuse. Nous avons opté pour une approche inspirée de la méthodologie Agile (Scrum). Au lieu d'essayer de tout construire d'un coup, nous avons procédé par itérations. La première "sprint" s'est concentrée sur la fondation : la base de données et l'API. La deuxième a permis de créer l'interface visuelle et la cartographie. Ce n'est qu'une fois ce squelette solide que nous avons intégré les "cerveaux", à savoir les modèles mathématiques d'optimisation. Cette méthode nous a permis de toujours garder un produit fonctionnel, même en cas de bug complexe sur la partie mathématique.

#### 4.2. Planification du projet (Diagramme de Gantt)
Notre calendrier s'est articulé autour de grandes phases :
1. **La Phase d'Exploration (Mois 1)** : Recherche bibliographique, état de l'art sur le VRP et familiarisation avec les bibliothèques d'optimisation.
2. **La Phase de Conception (Mois 2)** : Rédaction des spécifications, élaboration des diagrammes UML, et choix définitifs de la *stack* technologique (React, FastAPI).
3. **La Phase de Réalisation (Mois 3 & 4)** : Codage du backend, du frontend, et surtout, programmation des modules `solvers.py` intégrant le Machine Learning et les algorithmes génétiques.
4. **La Phase de Validation (Mois 5)** : Création de notre jeu de données synthétique, tests de charge, exécution des benchmarks et rédaction du présent rapport.

### 5. Organisation du rapport
Pour vous guider à travers notre démarche, ce rapport est structuré en quatre grands chapitres. 
Le **Chapitre 1** pose les fondations théoriques en explorant l'état de l'art du problème de routage et ses enjeux réels. 
Le **Chapitre 2** plonge au cœur de notre réflexion conceptuelle : nous y détaillons l'architecture logicielle via l'UML et la modélisation mathématique de nos algorithmes. 
Le **Chapitre 3** est consacré à la réalisation technique, expliquant comment nous avons traduit ces mathématiques en lignes de code concrètes au sein d'une architecture moderne. 
Enfin, le **Chapitre 4** présente nos résultats expérimentaux, où nous analyserons les performances de nos IA face à des scénarios de crise simulés.

---

# Chapitre 1 : Contexte, État de l'Art et Enjeux

### 1. Introduction
Avant de plonger les mains dans le code et les équations, il est crucial de comprendre l'environnement dans lequel notre projet évolue. Ce premier chapitre a pour vocation de brosser un tableau détaillé du secteur de la logistique contemporaine. Nous y démystifierons le concept du Problème de Tournées de Véhicules, ses différentes variantes industrielles, et nous examinerons comment la recherche opérationnelle a tenté de le résoudre au fil des décennies.

### 2. Logistique et optimisation des transports
Dans le jargon professionnel, on entend souvent parler du "dernier kilomètre". Cette expression désigne la toute dernière étape de la chaîne d'approvisionnement, celle où le colis quitte le centre de tri urbain pour arriver entre les mains du client final. Il est frappant de constater que cette courte distance est paradoxalement la plus chère de toute la chaîne logistique, représentant parfois jusqu'à 50 % du coût total d'une livraison. 
Pourquoi ? Parce qu'à l'inverse d'un gros camion roulant en ligne droite sur une autoroute entre deux usines, le livreur du dernier kilomètre doit s'arrêter tous les 200 mètres, affronter les embouteillages, chercher une place de stationnement, et parfois trouver porte close. L'optimisation des transports dans ce contexte ne consiste plus seulement à trouver le chemin le plus court, mais à orchestrer un ballet complexe de ressources humaines et matérielles dans un environnement urbain chaotique.

### 3. Le Problème de Tournées de Véhicules (VRP)
#### 3.1. Définition et Importance Industrielle
Introduit pour la première fois en 1959 par les mathématiciens Dantzig et Ramser (qui cherchaient à optimiser l'approvisionnement en carburant de stations-service), le VRP est devenu l'un des problèmes les plus étudiés en recherche opérationnelle. Il s'agit d'une généralisation du célèbre "Problème du Voyageur de Commerce" (TSP).
En termes simples : on dispose d'un dépôt central, d'une flotte de camions et d'un ensemble de clients répartis sur une carte géographie. L'objectif est de concevoir un ensemble d'itinéraires fermés (qui reviennent au dépôt) permettant de servir tous les clients de manière à minimiser la distance totale parcourue.
Ce qui rend le VRP fascinant (et frustrant), c'est sa classification en tant que problème "NP-difficile". Concrètement, cela veut dire qu'au-delà de quelques dizaines de clients, même le superordinateur le plus puissant du monde ne pourrait pas calculer de force brute toutes les combinaisons possibles dans un temps raisonnable. Il faut donc ruser et utiliser l'intelligence artificielle pour trouver une "très bonne solution" sans avoir à chercher "la solution parfaite" pendant des millénaires.

#### 3.2. Variantes du VRP étudiées
Très vite lors de nos recherches, nous avons réalisé que le VRP classique "pur" n'existe pratiquement pas dans la réalité de l'entreprise. Un algorithme qui trace simplement le chemin le plus court sans réfléchir aux contraintes est inutile sur le terrain. C'est pourquoi nous avons étudié et intégré ses variantes :
- **3.2.1. VRP Classique** : C'est notre base théorique, où la seule contrainte est de visiter chaque client exactement une fois.
- **3.2.2. VRP avec Contraintes de Capacité (CVRP - Capacitated VRP)** : Dans la vraie vie, un camion a un coffre limité. On ne peut pas lui assigner 100 frigos à livrer. Le CVRP force l'algorithme à surveiller le poids cumulé des colis dans le camion et l'oblige à renvoyer un nouveau véhicule si le premier est plein.
- **3.2.3. VRP avec Fenêtres Temporelles (VRPTW - VRP with Time Windows)** : C'est la contrainte qui donne le plus de cauchemars aux logisticiens. Un restaurant exige d'être livré en produits frais entre 6h et 8h du matin, pas après. Si le camion arrive à 5h, il doit attendre (perte de temps). S'il arrive à 9h, la marchandise est refusée (pénalité). Notre modèle devait impérativement intégrer la notion de temps de service.
- **3.2.4. VRP Dynamique (avec gestion des retards)** : C'est ici que notre projet prend toute sa dimension d'IA moderne. Le trafic évolue. S'il pleut soudainement, la vitesse moyenne de la flotte chute. Le VRP dynamique demande à l'algorithme de ne pas être figé, mais d'accepter une mise à jour de l'environnement pour recalculer les ETA (Estimated Time of Arrival) à la volée.

### 4. Travaux Existants et Solutions Actuelles
Historiquement, on résolvait ces problèmes avec des "méthodes exactes" (comme l'algorithme de séparation et d'évaluation, ou *Branch and Bound*). Mais leur lenteur face à de gros volumes de données les a vite rendues obsolètes pour un usage quotidien. 
La communauté scientifique s'est alors tournée vers les "heuristiques" (des règles de bon sens rapides mais imparfaites) et les "métaheuristiques" (des algorithmes s'inspirant de la nature, comme le comportement des fourmis ou la sélection génétique) pour explorer de larges espaces de solutions.
Aujourd'hui, sur le marché professionnel, des logiciels commerciaux très puissants existent (comme Routific ou Onfleet). Le problème pour une PME marocaine ou européenne, c'est que ces logiciels fonctionnent comme des boîtes noires ("black boxes") très opaques : on paye un abonnement mensuel exorbitant par véhicule sans jamais comprendre comment l'algorithme travaille, ni pouvoir l'adapter à des règles métiers très spécifiques. L'existence de ces solutions fermées a renforcé notre motivation à construire LogiOptima : une plateforme transparente dont nous maîtrisons la moindre ligne de code algorithmique.

### 5. Enjeux Entrepreneuriaux
Il ne faut pas s'y tromper : l'optimisation des tournées n'est pas qu'un jeu d'étudiants en informatique. Les enjeux derrière LogiOptima IA sont de véritables leviers de compétitivité pour les entreprises :
- **Un enjeu économique vital** : Gagner ne serait-ce que 5 % de distance parcourue chaque jour sur une flotte de 100 camions représente des dizaines de milliers de dirhams d'économies annuelles en gasoil, pneus, et heures supplémentaires.
- **Un enjeu écologique pressant** : Moins de kilomètres roulés, c'est mathématiquement moins de CO2 rejeté dans l'atmosphère. À l'heure où les normes environnementales taxent la pollution urbaine, l'optimisation est une réponse écologique concrète.
- **Un enjeu de Service Client (UX)** : Amazon a habitué le consommateur à pouvoir suivre son livreur sur une carte en direct. Les PME doivent proposer le même niveau de transparence (ETA précis, SMS d'approche) pour survivre.

### 6. Conclusion
L'étude approfondie de cet état de l'art nous a confortés dans notre démarche. Le problème des tournées de véhicules est loin d'être un problème résolu : c'est un domaine vivant, complexe, qui réclame des outils de plus en plus intelligents pour gérer l'imprévisibilité de nos villes. Forts de cette compréhension théorique et des enjeux industriels, nous étions prêts à passer à la phase de conception logicielle et mathématique, que nous allons détailler dans le chapitre suivant.
