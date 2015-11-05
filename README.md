# Snake.js  by Jules Girard 


## Installation

At the beginning of HTML file :

```
<link href="snake/snake.css" media="all" rel="stylesheet" type="text/css"/>
<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
<script type="text/javascript" src="snake/snake.js"></script>
```

At the end of HTML file :

```
<script>
	$(document).ready(function(){

		$('#myDiv').snake({
			width : 900,
			height : 450,
			...
		});

	});
</script>
```


===== PARAMETERS =====

	All parameters are optional.

	width       =>  (integer) width of game's area in pixels
	height      =>  (integer) height of game's area in pixels
	cols        =>  (integer) columns number in game's grid
	rows        =>  (integer) rows number in game's grid
	snake_size  =>  (integer) initial size of snake
	diff        =>  (integer) 0(Easy), 1(Normal) or 2(Hard)
	warp        =>  (boolean) if false, the player lose when the snake hit an edge of game's area
	state       =>  (string)  if "pause", the game start in pause, and if "play", the game start at document load
	rand_bg     =>  (boolean) if true, the game's background changes everytime the snake eat a fruit


===== CREDITS =====

	Developped by Jules Girard.

		Visit my website : http://julesgirard.net/
		