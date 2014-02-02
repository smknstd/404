// Lorsque le DOM est chargé
window.onload = function () {

    // Nombres de pieces posées
    var nbpieces = 120;
    var tbloc = 30;
    var ttondeuse = 54;

    var hauteur = 16;
    var largeur = 29;

    // Initialisation de Crafty
    Crafty.init((largeur+1)*tbloc, (hauteur+1)*tbloc, 5);
    Crafty.canvas.init();

    // On map notre spritesheet des herbes
    Crafty.sprite(tbloc, "assets/herbes.png", {
        coupee: [0, 0],
        haute: [1, 0]
    });

    // On map notre spritesheet de la tondeuse
    Crafty.sprite(ttondeuse, "assets/tondeusev1.png", {
        tondeusedes: [0, 0]
    });

    Crafty.sprite(ttondeuse, "assets/tondeusev2.png", {
        tondeusemont: [0, 0]
    });

    Crafty.sprite(ttondeuse, "assets/tondeuseh2.png", {
        tondeusegau: [0, 0]
    });
    Crafty.sprite(ttondeuse, "assets/tondeuseh1.png", {
        tondeusedro: [0, 0]
    });


    // Composant herbe coupée
    Crafty.c("HerbeCoupee", {
        init: function() {
            this.addComponent("2D, Canvas, coupee");
        }
    });

    // Composant herbe haute
    Crafty.c("HerbeHaute", {
        init: function() {
            this.addComponent("2D, Canvas, haute, Collision");
        }
    });

    Crafty.c("Herbes", {
        init: function() {

            this.herbes = [];
            this.positions = [];
            this.positions.push("1100110011111100110011".split(''));
            this.positions.push("1100110011111100110011".split(''));
            this.positions.push("1100110011001100110011".split(''));
            this.positions.push("1100110011001100110011".split(''));
            this.positions.push("1111110011001100111111".split(''));
            this.positions.push("1111110011001100111111".split(''));
            this.positions.push("0000110011001100000011".split(''));
            this.positions.push("0000110011001100000011".split(''));
            this.positions.push("0000110011111100000011".split(''));
            this.positions.push("0000110011111100000011".split(''));

            // Création des herbes
            var h = 0;
            for(var i = 0;i < this.positions.length;i++){
                for(var j = 0;j < this.positions[i].length;j++){

                    if(this.positions[i][j]==1){
                        this.herbes[h] = Crafty.e("HerbeHaute")
                                            .attr({x: 4*tbloc+j*tbloc, y: 4*tbloc+i*tbloc, w: tbloc, h: tbloc}) // Positionnement du carré d'herbe haute
                                            .collision(new Crafty.polygon([0,0], [tbloc,0], [tbloc, tbloc], [0, tbloc])); // Hitbox du carré d'herbe haute
                        h++;
                    }
                }
            }
        }
    });

    // Création du composant Tondeuse
    Crafty.c("Tondeuse", {
        init: function() {

            this.addComponent("2D, Canvas, tondeusedes, Collision");
            this.attr({x: 18, y: 18, w: ttondeuse, h: ttondeuse});

            this.collision(new Crafty.polygon([[26, 26], [26, 28], [28, 28], [28, 26]]));

            this.origin(27, 27);

            this.score = Crafty.e("Score");

            this.blocs = [];
            this.address_blocs = [ ]

            var move = {left: false, right: false, up: false, down: false};

            var direction = "n";
            var speed = 2;

            var enmouvement = false;
            var ancienne = "";

            this.bind('EnterFrame', function() {

                if(((this._x+12) % tbloc)+((this._y+12) % tbloc) != 0){ 

                    if(enmouvement){

                        this.move(direction, speed);

                        if(this._x < 18 || this._x > largeur*tbloc-12 || this._y < 18 || this._y > hauteur*tbloc-12)
                            this.move(direction, -speed);

                    }

                }else{

                    if(move.up || move.down || move.left || move.right){

                        ancienne = direction;

                        if (move.right) direction = "e"; 
                        else if (move.left) direction = "w";
                        else if (move.up) direction = "n";
                        else if (move.down) direction = "s";

                        console.log("a: " + ancienne + " | n: " + direction);


                        switch (ancienne){ 
                            case "n":
                                this.removeComponent("tondeusemont");
                                break;
                            case "s":
                                this.removeComponent("tondeusedes");
                                break;
                            case "e":
                                this.removeComponent("tondeusedro");
                                break;
                            case "w":
                                this.removeComponent("tondeusegau");
                                break;
                        }

                        switch (direction){ 
                            case "n":
                                this.addComponent("tondeusemont");
                                break;
                            case "s":
                                this.addComponent("tondeusedes");
                                break;
                            case "e":
                                this.addComponent("tondeusedro");
                                break;
                            case "w":
                                this.addComponent("tondeusegau");
                                break;
                        }

                        this.move(direction, speed);

                        if(this._x < 18 || this._x > largeur*tbloc-12 || this._y < 18 || this._y > hauteur*tbloc-12){
                            this.move(direction, -speed);
                        }else
                            enmouvement = true;

                    }

                }

            });

            this.onHit("HerbeHaute", function(collision) {

                    // Destruction du fruit
                    collision[0].obj.destroy();

                    // Décrémenter le compteur
                    this.score.decrementer();
            });

            this.bind('KeyDown', function(e) {
                // Default movement booleans to false
                move.right = move.left = move.down = move.up = false;

                // If keys are down, set the direction
                if (e.keyCode === Crafty.keys.RIGHT_ARROW) move.right = true;
                if (e.keyCode === Crafty.keys.LEFT_ARROW) move.left = true;
                if (e.keyCode === Crafty.keys.UP_ARROW) move.up = true;
                if (e.keyCode === Crafty.keys.DOWN_ARROW) move.down = true;

                //this.preventTypeaheadFind(e);
            });

            this.bind('KeyUp', function(e) {
                // If key is released, stop moving
                if (e.keyCode === Crafty.keys.RIGHT_ARROW) move.right = false;
                if (e.keyCode === Crafty.keys.LEFT_ARROW) move.left = false;
                if (e.keyCode === Crafty.keys.UP_ARROW) move.up = false;
                if (e.keyCode === Crafty.keys.DOWN_ARROW) move.down = false;

                //this.preventTypeaheadFind(e);
            });

        },

    });


    // Création du composant Score
    Crafty.c("Score", {
        init: function() {
            this.addComponent("2D, DOM, Text");
            this.attr({ x: 40, y: 40, w: 200 });
            
            // Paramètres CSS à la jQuery
            this.css({ font: '16px Verdana', color: "white" });
            
        },
        // Incrémentation et display du score
        decrementer: function(by) {
            nbpieces --;
            //this.display();
            return this;
        },
        display: function() {
            // Affichage du score à l'écran
            this.text("Pieces restantes: "+nbpieces);
            return this;
        }
    });
    
    
    // Game
    Crafty.scene("main", function() {

        // Ajout de la map en image de fond
        Crafty.e("2D, Canvas, Image").image("assets/map.png");

        // Ajout des herbes
        Crafty.e("Herbes");

        // Ajout de la tondeuse
        Crafty.e("Tondeuse");

    });

    Crafty.load(["assets/map.png", "assets/herbes.png"], function () {
        
        // Déclenchement de la scène principale
        Crafty.scene("main");
        
    });

};
