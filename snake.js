(function($)
{

	/* CODES TOUCHES */
	var space = 32;
	var up    = 38;
	var left  = 37;
	var right = 39;
	var down  = 40;
	var arrows = [up, left, down, right];
	var arrows_contrary = [down, right, up, left];
	var key_r = 82;


	/* PARAMETRES PAR DÉFAUT */
	var defaults =
	{
		     width : 900,
		    height : 450,
		      cols : 45,
		      rows : 23,
	    snake_size : 5,
	    	  diff : 1, // 0, 1 ou 2
	          warp : true,
	         state : "pause",
	       rand_bg : false
	};


	/* CLASSE POINT */
	function Point (x,y) {
	    this.x = x | 0;
	    this.y = y | 0;
	}

	Point.prototype.equals = function(p) {
		return (this.x==p.x && this.y==p.y ? true : false);
	};

	/* CORPS DU PLUGIN */
	$.fn.snake = function(options) {
		
		/* GESTION PARAMETRES */
	   	var params = $.extend(defaults, options);

	   	/* CORPS DU PLUGIN */
		return this.each(function(){

			/* DECLARATION DES VARIABLES DU JEU */
			var xmax = parseInt(params.cols);
			var ymax = parseInt(params.rows);
			var width = params.width/xmax;
			var height = params.height/ymax;
			var size;
			var positions = [];
			var directions = [];
			var score = 0;
			var speed = 50;
			var currentDirection;
			var currentPosition = new Point();
			var fruit = new Point();
			var state = "pause";
			var difficulty = 0;
			var warp = params.warp;
			var rand_bg = params.rand_bg;
			var loop;

			/* MISE EN PLACE DE L'AIRE DE JEU */
			var $game = $(this);
			
			$game.addClass("snake")
				.width(params.width)
				.height(params.height)
				.empty()
				.append("<div class='player'> </div>")
				.append("<div class='score'> Score = "+score+" </div>")
				.append("<div class='settings'> </div>")
				.append("<div class='fruit'> <div/>");

			$(".fruit",$game).css({
				position : "absolute",
				width :    width,
				height :   height
			});

			$(".score",$game).css({
				float : "left"
			});

			$(".settings",$game)
				.empty()
				.append("<button class='button buttonDiff'> </button> <br>")
				.css({float:"right"});

			setDifficulty(params.diff);

			init();


			/* INITIALISATION DU JEU */
			function init(){
				/* DEFINITION DES VARIABLES DU JEU */
				size = 0;
				updateScore(0);
				positions  = [];
				directions = [];
				currentDirection = right;
				currentPosition.x = parseInt(xmax/2);
				currentPosition.y = parseInt(ymax/2);

				if(state != params.state)
					togglePause(); 

				/* CREATION DU SERPENT */
				$(".player",$game).empty();
				addPieces(params.snake_size);

				for(var i=1; i<size; ++i)
					positions[i].x -= i;

				$(".piece-0",$game).addClass("head right").css("z-index","1");
					
				/* POSITIONNEMENT DU FRUIT */	
				dropFruit();

				/* ON DESSINE LA SCENE */
				draw();

				/* DEFINITION DE LA BOUCLE DE JEU */
				if(typeof loop != "undefined") 
					clearInterval(loop);
				loop = setInterval(function(){update()}, speed);
			}


			/* POSITIONNEMENT ALÉATOIRE DU FRUIT */
			function dropFruit()
			{
				do{
					fruit.x = Math.floor(Math.random()*xmax);
					fruit.y = Math.floor(Math.random()*ymax);
				}while(currentPosition.equals(fruit));
				
				$(".fruit",$game).css({
					marginLeft : fruit.x*width+"px",
					marginTop :  fruit.y*height+"px",
				});
			}


			/* DETECTION COLLISIONS */
			function checkCollisions()
			{	
				/* COLLISIONS AVEC LES BORDS */
				if(warp)
				{
					if(positions[0].y < 0)           // HAUT
						currentPosition.y = ymax-1;
					else if (positions[0].y >= ymax) // BAS
						currentPosition.y = 0;
					else if(positions[0].x < 0)      // GAUCHE
						currentPosition.x = xmax-1;
					else if(positions[0].x >= xmax)  // DROITE
						currentPosition.x = 0;
				}
				else
				{
					if(currentPosition.y < 0      || // HAUT
					   currentPosition.y >= ymax  || // BAS
					   currentPosition.x < 0      || // GAUCHE
					   currentPosition.x >= xmax)    // DROITE
					{ 
						init();
						return;
					}
				}

				/* COLLISION AVEC LE CORPS DU SNAKE */
				for(var i=4; i<size; ++i)
				{
					if(currentPosition.equals(positions[i]))
					{
						init();
						return;
					}
				}

				/* COLLISION AVEC UN FRUIT */
				if(currentPosition.equals(fruit))
					eatFruit();
			}


			/* MISE A JOUR DE LA DIRECTION DU SERPENT */
			function updateDirection()
			{
				var ok = false;

				while(!ok && directions.length > 0)
				{
					var forbidden = arrows_contrary[arrows.indexOf(currentDirection)];

					if(directions[0] == forbidden)
						directions.shift();
					else
						ok = true;
				}

				if(directions.length > 0)
				{
					currentDirection = directions.shift();
					$(".piece-0").removeClass("left right up down");
					switch(currentDirection)
					{
						case up    : $(".piece-0").addClass("up");    break;
						case down  : $(".piece-0").addClass("down");  break;
						case left  : $(".piece-0").addClass("left");  break;
						case right : $(".piece-0").addClass("right"); break;
					}
				}
			}


			/* MISE A JOUR DE LA POSITION DU SERPENT */
			function updatePosition()
			{
				if(state == "play")
				{
					switch(currentDirection)
					{
						case up    : positions.unshift(new Point(currentPosition.x,   currentPosition.y-1)); break;
						case down  : positions.unshift(new Point(currentPosition.x,   currentPosition.y+1)); break;
						case left  : positions.unshift(new Point(currentPosition.x-1, currentPosition.y)); break;
						case right : positions.unshift(new Point(currentPosition.x+1, currentPosition.y)); break;
					}

					positions.pop();

					currentPosition = positions[0];
				}
			}


			/* LE SERPENT MANGE LE FRUIT ! */
			function eatFruit()
			{
				addPieces(1);
				updateScore(score+1);
				dropFruit();

				if(rand_bg)
					randomBackground();
			}



			/* ON AJOUTE UNE/DES PIECE(S) AU SERPENT */
			function addPieces(nb)
			{
				for(var i=0; i<nb; ++i)
				{
					$(".player",$game).append("<div class='square piece-"+size+"'> </div>");
					$(".piece-"+size,$game).css({
						position : "absolute",
						width    : width,
						height   : height
					});
					positions.push(new Point(currentPosition.x,currentPosition.y));
					size++;
				}
			}


			/* MET A JOUR LE SCORE */
			function updateScore(new_score)
			{
				score = new_score;
				$(".score",$game).html("Score = "+score);
			}



			/* MISE A JOUR DU JEU (IDLE) */
			function update()
			{
				updateDirection();				
				updatePosition();
				checkCollisions();

				if(state=="play")
					draw();
			}



			/* "DESSIN" DE LA SCENE */
			function draw(){

				for(var i=0; i<size; ++i)
				{
					var marge = getMarge(i);
					$(".piece-"+i,$game).css({
						marginLeft : marge.x+"px",
						marginTop  : marge.y+"px"
					})
				}
			}


			/* RENVOIE LES MARGES À APPLIQUER AU SQUARE DE POSITION I */
			function getMarge(i){
				return new Point(positions[i].x*width,positions[i].y*height);
			}


			/* CHANGEMENT DU BACKGROUND DU JEU */
			function randomBackground()
			{
				var color = 'rgb(' + (Math.floor((256)*Math.random())) + ','
			                       + (Math.floor((256)*Math.random())) + ','
			                       + (Math.floor((256)*Math.random())) + ')';
		   		$game.css("background-color", color);
			}


			/* PAUSE ON/OFF */
			function togglePause()
			{
				$("button",$game).blur();

				if(state=="play") 
				{
					state="pause"; 
					$(".settings",$game).css("display","block");
				}
				else 
				{
					state="play";
					$(".settings",$game).css("display","none");
				} 
			}


			function setDifficulty(diff)
			{
				difficulty = diff;

				// Gestion d'erreur
				if(difficulty > 2 || difficulty < 0) 
					difficulty = 0;

				switch(difficulty)
				{
					case 0 : speed=100; $(".buttonDiff",$game).html("Changer difficulté : Facile");    break;
					case 1 : speed=50;  $(".buttonDiff",$game).html("Changer difficulté : Normal");    break;
					case 2 : speed=25;  $(".buttonDiff",$game).html("Changer difficulté : Difficile"); break;
				}

				if(typeof loop != "undefined") clearInterval(loop);
					loop = setInterval(update, speed);
			}



			/* ========== ÉVÉNEMENTS ========== */


			/* APPUI SUR UNE TOUCHE DU CLAVIER */
			$(document).keydown(function(key)
			{
				/* APPUI SUR R */
				if(key.keyCode == key_r)
				{
					init();
					return;
				}

				/* APPUI SUR ESPACE */
				if(key.keyCode==space) 
					togglePause();
				
				/* APPUI SUR UNE FLECHE */
				if(arrows.indexOf(key.keyCode) != -1)
				{
					if(state == "pause")
						togglePause();
					
					if(state=="play")
						directions.push(key.keyCode);
				}

				/* POUR EMPECHER LA FENETRE DE SCROLLER */
				if(key.keyCode==space || arrows.indexOf(key.keyCode)!=-1)
					return false;
			});


			$(".buttonDiff",$game).click(function(){
				setDifficulty(difficulty+1);
			});




		});
	}	
})(jQuery);	