	document.addEventListener("DOMContentLoaded", () => { // N'exécute le code qu'une fois que le HTML est chargé, et donc que tous les éléments existent dans le DOM

// ! ================================
// ! RÉFÉRENCES DOCUMENT OBJECT MODEL
// ! ================================

	const scene = document.querySelector("#sceneJeu");
	const scores = document.querySelector("#scores");
	const nouvellePartie = document.querySelector("#nouvellePartie");
	const btnStart = nouvellePartie.querySelector("button");
	const elNbApp = document.querySelector("#NbApparitions");
	const elNbExp = document.querySelector("#NbExplosions");
	const overlay = document.querySelector("#overlay");
	const panelText = document.querySelector("#panelText");
	const btnContinue = document.querySelector("#btnContinue");
	const spanLevel = document.querySelector("#level");
	const btnRestart = document.querySelector("#btnRestart");

// ! ================
// ! VARIABLES DU JEU
// ! ================

	let NbApparition = 0;	// Nombre d'apparitions dans un niveau
	let NbExplosions = 0;	// Nombre de cafards explosés dans un niveau
	let Niveau = 1;			// Niveau actuel => on commence à 1

// ! ============
// ! ÉTAT INITIAL
// ! ============

	// * FONCTION QUI PERMET D'AFFICHER UN ELEMENT CACHE
	// * ===============================================
	function show(el) { el.hidden = false; } 

	// * FONCTION QUI PERMET DE CACHER UN ELEMENT
	// * ========================================
	function hide(el) { el.hidden = true; }

	show(nouvellePartie);				// Au démarrage : on affiche l'élément "nouvellePartie"
	hide(scene);						// On cache la "scene"
	hide(scores);						// On cache les "scores"
	overlay.classList.add("hidden");	// On cache l'"overlay"

	// Valeurs par défaut
	elNbApp.textContent = "0";		// On initialise le nombre d'apparitions à 0 (écran des "scores")
	elNbExp.textContent = "0";		// On initialise le nombre d'explosions à 0 (écran des "scores")
	spanLevel.textContent = "1";	// On initialise le niveau à 1

// ! =============================================
// ! GESTION DES PROMISES (POUR LES TEMPS D'ARRET)
// ! =============================================

	// * FONCTION "PAUSE" de la durée "ms" (en ms) d'une fonction asynchrone sans bloquer le reste du programme
	// * ===================================================================================================================================
	function sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms)); // On retourne une promesse qui sera résolue après ms millisecondes
	}

// ! ====================
// ! GESTION DE L'OVERLAY
// ! ====================

	// * FONCTION QUI PERMET D'AFFICHER UN MESSAGE DANS L'OVERLAY
	// * ========================================================
	function showPanel(message, showButton = true) { 	// showButton est optionnel, s'il n'est pas envoyé, il vaudra "true"
		panelText.textContent = message; 				// Met le texte dans le pannel (HTML)
		if (showButton) {								// Si le bouton doit être afiché :
 			btnContinue.style.display = "inline-block";	// Alors on l'affiche
		} else {										// Sinon :
			btnContinue.style.display = "none";			// On le masque
		}
		overlay.classList.remove("hidden");				// On enlève la classe "hidden" à l'overlay pour le rendre visible
	}

	// * FONCTION QUI PERMET DE CACHER L'OVERLAY
	// * =======================================
	function hidePanel() {
		overlay.classList.add("hidden"); // On ajoute la classe "hidden" à l'overlay pour le rendre invisible
	}

	// * FONCTION QUI PERMET D'ATTENDRE LE CLIC APRES L'AFFICHAGE DE L'OVERLAY
	// * =====================================================================
	function waitContinueClick() {
		return new Promise(resolve => {					// On crée une promesse
		btnContinue.addEventListener("click", () => {	// Quand on clique sur le bouton :
			hidePanel();								// On cache l'overlay
			resolve();									// On résout la promesse
		}, { once: true });								// Après le premier clic, on arrête d'"écouter" les clics sur le bouton
		});
	}

// ! ============================
// ! GESTION DE LA CIBLE = CAFARD
// ! ============================

	// * FONCTION QUI PERMET DE FABRIQUER UNE CIBLE
	// * ==========================================
	function addTarget({ posX, posY }) {	// On crée une cible à partir d'un objet : { posX, posY }
		const target = {					// l'objet Javascript "target", qui a comme propriétés :

			x: posX,						// Position x
			y: posY,						// Position y
			HTMLelement: null,				// Elément HTML, "null" au départ parce que la cible n'existe pas
			isExploding: false,				// Un "flag" qui nous dit que la cible n'est pas en train d'exploser (évite les doubles scores si on clique plusieurs fois)
			clickResolver: null,			// Champ pour stocker la fonction de résolution de Promise

			// * METHODE POUR FAIRE DISPARAITRE LA CIBLE
			// * =======================================
			disappear() {					
				if (this.HTMLelement) this.HTMLelement.style.display = "none";	// Si l'élément HTML existe, on le cache
			},

			// * METHODE POUR CREER LA CIBLE ET L'AJOUTER AU HTML
			// * ================================================
			render() {
				if (this.HTMLelement === null) {						// Si l'élément HTML n'existe pas :
					this.HTMLelement = document.createElement("div");	// On crée la "div"
					this.HTMLelement.className = "target";				// On lui donne la classe "target"
					scene.append(this.HTMLelement);						// On l'ajoute dans la scène de jeu
					this.HTMLelement.addEventListener("click", () => this.explode());	// On écoute les clics qui déclenchent "explode" : explosion
				}
				this.HTMLelement.style.display = "block";		// Rend l'élément visible
				this.HTMLelement.style.position = "absolute";	// En position absolue
				this.HTMLelement.style.top = this.y + "px";		// Avec comme coordonnées y ce qu'on a reçu
				this.HTMLelement.style.left = this.x + "px";	// Avec comme coordonnées x ce qu'on a reçu
				this.HTMLelement.classList.remove("appear");	// Pour gérer l'apparition, on enlève la classe "appear"
				void this.HTMLelement.offsetWidth; 				// On force le navigateur à "recalculer" : lance un reflow (relance l'animation CSS)
				this.HTMLelement.classList.add("appear");		// On remet la classe "appear"
			},

			// * METHODE POUR CALCULER UNE POSITION ALEATOIRE
			// * ============================================
			randomPosition() {
				const sceneW = scene.clientWidth;	// On cherche la largeur de la scène
				const sceneH = scene.clientHeight;	// Idem pour la hauteur
				const cafardW = 60;					// On a la largeur de la cible (cafard)
				const cafardH = 60;					// Idem pour sa hauteur
				const margin = 10; 					// On ajoute une marge pour que la cible ne soit pas collée sur le bord
				const maxX = Math.max(0, sceneW - cafardW - margin * 2);	// On calcule l'amplitude possible dans la largeur (largeur de la scène - largeur de la cible - marge * 2)
				const maxY = Math.max(0, sceneH - cafardH - margin * 2);	// On calcule l'amplitude possible dans la hauteur (hauteur de la scène - hauteur de la cible - marge * 2)
				this.x = margin + Math.random() * maxX; // On choisit une position x aléatoire dans la zone autorisée
				this.y = margin + Math.random() * maxY; // On choisit une position y aléatoire dans la zone autorisée
			},

			// * METHODE QUI ATTEND SOIT UN CLIC, SOIT QUE LE TEMPS D'APPARITION SOIT DEPASSE
			// * ============================================================================
			waitVisible(ms) {
				return new Promise(resolve => {			// On crée une promesse
					const timer = setTimeout(() => {	// Au bout du temps convenu (ms), si personne n'a cliqué
						this.clickResolver = null;		// On vide le "clickResolver"
						resolve("timeout");				// On résoud la promesse avec "timeout"
					}, ms);
					this.clickResolver = () => {		// Si on clique
						clearTimeout(timer);			// On annule le timer
						this.clickResolver = null;		// On vide le "clickresolver"
						resolve("click");				// On résout la promesse avec "click"
					};
				});
			},

			// * METHODE QUI DECLENCHE L'EXPLOSION
			// * =================================
			explode() {
				if (!this.HTMLelement) return;						// Si pas d'élément HTML, on stoppe
				if (this.isExploding) return;						// Si déjà en train d'exploser, on stoppe (évite les clics rapides)
				this.isExploding = true;							// On dit que c'est en train d'exploser (on "verrouille")
				if (this.clickResolver) this.clickResolver();		// Si on est en attente de clic, alors on exécute (si une promesse attend un clic alors on la résout)
				this.HTMLelement.classList.add("explode");			// On ajoute la classe "explode" à la cible
				NbExplosions++;										// On incrémente le nombre d'explosions
				elNbExp.textContent = String(NbExplosions);			// On l'affiche
				setTimeout(() => {									// Après 400 ms	
					this.disappear();								// On cache la cible
					this.HTMLelement.classList.remove("explode");	// On retire la classe "explode"
					this.isExploding = false;						// On dit que la cible n'est plus en cours d'explosion
				}, 400);
			}
			};
		return target;	// On renvoie l'objet "cible" prêt à être utilisé
	}

// ! ===================
// ! GESTION DES NIVEAUX
// ! ===================

	// * FONCTION QUI LANCE UN NIVEAU
	// * ============================
	async function targetLoop(target, nbTests, level) {	// Fonction asynchrone : permet d'utiliser await avec une promise
		NbApparition = 0;			// On réinitialise le nombre d'apparitions
		NbExplosions = 0;			// On réinitialise le nombre d'explosions
		elNbApp.textContent = "0";	// On affiche "0" sur le tableau des scores pour les apparitions
		elNbExp.textContent = "0";	// On affiche "0" sur le tableau des scores pour les explosions
		for (let i = 0; i < nbTests; i++) {				// Test pour voir si on a fini le niveau => ICI : 10 tests pour un niveau
			const timeAppear = 5000 / level;			// Le temps d'affichage diminue en fonction du niveau
			target.render();		// On affiche la cible (au cas où elle n'est pas créée)
			target.randomPosition();					// On calcule une position aléatoire
			target.render();		// On remplace la cible avec cette nouvelle position
			NbApparition++;			// On incrémente le nombre d'apparitions
			elNbApp.textContent = String(NbApparition);	// On affiche le nombre d'apparitions dans les scores
			const result = await target.waitVisible(timeAppear);	// On attend soit un clic, soit le timeout
			if (result === "timeout") {					// Si c'est le timeout...
				target.disappear();	// On cache la cible
			}
			await sleep(800);		// On fait une pause entre 2 apparitions
		}
		return NbApparition ? (NbExplosions / NbApparition) * 100 : 0; // On renvoie le % de réussite
	}

	// * FONCTION QUI GERE LES NIVEAUX
	// * =============================
	async function gameLoop(target) { 		// Fonction asynchrone : permet d'utiliser avwait avec une promise
		while (true) {							// Boucle infinie
			spanLevel.textContent = String(Niveau);				 	// On affiche le niveau
			const percent = await targetLoop(target, 10, Niveau);	// On lance les 10 apparitions pour ce niveau
			target.disappear();					// On cache la cible en fin de niveau
			//? LE JOUEUR A PERDU
			if (percent < 80) {					// Si le résultat est inférieur à 80% :
				const restart = confirm(		// On affiche un message en demandant si l'utilisateur veur rejouer
				"Perdu\n" + 					// Affichage du message
				"Niveau atteint : " + Niveau + "\n" +				// Affichage du niveau
				"Réussite : " + percent.toFixed(0) + "%\n\n" +		// Affichage du % de réussite (arrondi à l'unité)
				"Recommencer ?"
				);
				if (restart) location.reload();		// Si l'utilisateur choisit de recommencer, on recharge la page pour tout redémarrer
				break;								// Sinon, on sort de la boucle (fin du jeu)
			}
			// ? LE JOUEUR PASSE AU NIVEAU SUIVANT
			showPanel(								// On affiche le message ci-dessous avec le % de réussite
				"Niveau " + Niveau + " réussi !\n" +
				"Réussite : " + percent.toFixed(0) + " %.\n\n" +
				"Clique sur Continuer.",
				true
			);
			await waitContinueClick();	// On attend que l'utilisateur clique sur "Continuer"
			Niveau++;					// On incrémente le niveau
			}
		}

		// * FONCTION QUI GERE LE DEMARRAGE
		// * ==============================
		btnStart.addEventListener("click", async () => {	// Au clic sur le bouton démarrer :
		hide(nouvellePartie);	// On cache l'écran d'accueil
		show(scene);			// On affiche la scène de jeu
		show(scores);			// On affiche les scores
		await sleep(2000);		// On attend 2 secondes
		const target = addTarget({ posX: 100, posY: 100 });	// On démarre le jeu en créant une première cible
		gameLoop(target);		// On lance la boucle des niveaux
		});
	});


