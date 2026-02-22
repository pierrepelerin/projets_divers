
function randomDirection() { 
    return (Math.random() > 0.5) ? 1 : -1;
}

const updateFrequency = 60; 

const scene = document.querySelector("#scene");

// ! Nouvelle créature
function addCreature(paramObject) {
    console.log(paramObject);
    const newCreature = {
        x: 800,
        y: 200,
        r: paramObject.r,
        g: paramObject.g,
        b: paramObject.b,
        color: paramObject && paramObject.color || "black",
        size: (paramObject && paramObject.size) ?? 50,
        speedX: (paramObject && paramObject.speedX) ?? 0,
        speedY: (paramObject && paramObject.speedY) ?? 0,
        directionX: randomDirection(),
        directionY: randomDirection(),
        HTMLelement:null, // Rien en place avant le premier render()

        // ! Faire évoluer les propriétés qui nous intéressent
         applyVariations() {
            // Faire évoluer la taille
            this.size += 1 * (Math.random() - 0.5);
            // Empêcher les balles de sortir de l'écran
            if (this.x < 30) {
                this.directionX = - this.directionX;
            } else if (this.x > (scene.offsetWidth - this.size - 30)) {
                this.directionX = - this.directionX;
            } 
            if (this.y < 30) {
                this.directionY = - this.directionY;
            } else if (this.y > (scene.offsetHeight - this.size - 30)) {
                this.directionY = - this.directionY;
            } 
            // Faire évoluer la vouleur
            if (Math.random() > 0.8) { this.r += 5; }
            if (Math.random() > 0.8) { this.r -= 5; }
            if (Math.random() > 0.8) { this.g += 5; }
            if (Math.random() > 0.8) { this.g -= 5; }
            if (Math.random() > 0.8) { this.b += 5; }
            if (Math.random() > 0.8) { this.b -= 5; }
            if (Math.random() > 0.999) { 
                this.g = 0;
                this.r = 0;
                this.b = 0; }
            this.r = Math.max(0, Math.min(255, this.r));
            this.g = Math.max(0, Math.min(255, this.g));
            this.b = Math.max(0, Math.min(255, this.b));
            this.color = `rgb(${this.r}, ${this.g}, ${this.b})`;
        },

        // ! Faire bouger les balles
        move: function() {
            this.x += this.speedX * this.directionX;
            this.y += this.speedY * this.directionY;          
        },

        // ! Afficher les balles
        render: function () {
            if (this.HTMLelement == null) { // Vérifier si la créature n'a pas encore d'élément HTML
                this.HTMLelement = document.createElement("div");
                scene.append(this.HTMLelement);
                this.HTMLelement.className = "creature";
            }
            this.HTMLelement.style.top = this.y + "px";
            this.HTMLelement.style.left = this.x + "px";
            this.HTMLelement.style.width = this.size + "px";
            this.HTMLelement.style.height = this.size + "px";
            this.HTMLelement.style.backgroundColor = this.color;
        }
    }
    return newCreature;
}

// ! Gérer la fréquence d'affichage
const updateInterval = 1000 / updateFrequency;
setInterval(updateScene, updateInterval);

const creature = [];
const Nb = 80;
for (let i = 0 ; i < Nb ; i++) {
    creature[i] = addCreature({
        speedX:8 * Math.random(),
        speedY:8 * Math.random(),
        r: Math.floor(Math.random() * 256),
        g: Math.floor(Math.random() * 256),
        b: Math.floor(Math.random() * 256),
    })
}

function updateScene() { 
    for (let i = 0 ; i < Nb ; i++) {
        creature[i].move();
        creature[i].render();
        creature[i].applyVariations();
    }
}