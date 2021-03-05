/*
 * Yes, this code isn't great, but it's small and works even in IE10.
 * I wasn't configuring babel/webpack for a one off fun project.
 */

(function() {
	var contestants = [];

	var locked = false;

	var main = document.querySelector("main");
	var fileInput = document.querySelector("#file-input");
	var playButton = document.querySelector("#play-button");

	function addContestant(image) {
		var contestant = {};

		contestant.image = !!image ? image : "./images/blank.jpg";
		contestant.score = 0;
		contestant.oldScore = 0;

		contestants.push(contestant);

		return contestants.length;
	}

	function removeContestant(idx) {
		contestants.splice(idx, 1);
	}

	function createContestantEl(con, id) {
		var el = document.createElement("div");
		el.classList.add("contestant");

		var frameScaler = document.createElement("div");
		frameScaler.classList.add("frame-scaler");

		var frameContainer = document.createElement("div");
		frameContainer.classList.add("frame-container");
		frameContainer.style.webkitAnimationDelay = -id * 1.25 + "s";
		frameContainer.style.animationDelay = -id * 1.25 + "s";

		var fill = document.createElement("div");
		fill.classList.add("fill");
		fill.style.backgroundImage = "url(" + con.image + ")";

		var shadow = document.createElement("div");
		shadow.classList.add("shadow");

		var frame = document.createElement("img");
		frame.src = "./images/frame.png";
		frame.classList.add("frame");
		frame.removeAttribute("width");
		frame.removeAttribute("height");

		frame.addEventListener("click", function() {
			var cb = function(evt) {
				if (fileInput.files && fileInput.files[0]) {
					con.image = URL.createObjectURL(fileInput.files[0]);
					fill.style.backgroundImage = "url(" + con.image + ")";
				}
				fileInput.removeEventListener("change", cb);
				fileInput.value = "";
			};

			fileInput.addEventListener("change", cb);
			fileInput.click();
		});

		var exit = document.createElement("button");
		exit.classList.add("exit-button");
		exit.innerText = "X";
		exit.addEventListener("click", function() {
			removeContestant(id - 1);
			refreshContestants();
			resize();
		});

		fill.appendChild(shadow);
		frameContainer.appendChild(fill);
		frameContainer.appendChild(frame);

		if (!locked) frameContainer.appendChild(exit);

		frameScaler.appendChild(frameContainer);

		var scoreContainer = document.createElement("div");
		scoreContainer.classList.add("score-container");

		var seal = document.createElement("img");
		seal.classList.add("seal");
		seal.src = "./images/seal.png";
		seal.removeAttribute("width");
		seal.removeAttribute("height");

		var score = document.createElement("h1");
		score.classList.add("score");
		score.innerText = con.oldScore;

		scoreContainer.appendChild(seal);
		scoreContainer.appendChild(score);

		var input = document.createElement("input");
		input.classList.add("score-edit");
		input.type = "number";

		scoreContainer.isOpen = false;
		scoreContainer.addEventListener("mouseup", function(evt) {
			scoreContainer.isOpen = !scoreContainer.isOpen;

			if(scoreContainer.isOpen) {
				scoreContainer.appendChild(input);
				input.value = con.score;
				input.focus();
				input.select();
			} else {
				scoreContainer.removeChild(input);
			}
		});

		var exit = function() {
			scoreContainer.isOpen = false;
			scoreContainer.removeChild(input);

			var score = !!input.value ? parseFloat(input.value) : 0;

			if (con.score != score) {
				con.score = score;
				showPlay();
			}
		};

		input.addEventListener("focusout", exit);
		input.addEventListener("onkeydown", function(evt) {
			if (evt.key === "Enter") {
				exit();
			}
		});

		input.addEventListener("mouseup", function(evt) {
			evt.stopPropagation();
			evt.stopImmediatePropagation();
		});
		
		el.appendChild(frameScaler);
		el.appendChild(scoreContainer);

		return el;
	}

	function transformContestants() {

		contestants.sort(function(first, second) {
			if (first.score < second.score) {
				return -1;
			} else if (first.score > second.score) {
				return 1;
			} else {
				return 0;
			}
		});

		
		var maxScore = contestants[contestants.length - 1].score;
		var maxCount = 1;

		for (var i = contestants.length - 1; i > 0; --i) {
			var con = contestants[i-1];
			if (con.score == maxScore) {
				++maxCount;
			}
		}

		for (var i = 0, l = contestants.length; i < l; ++i) {
			var con = contestants[i];

			con.el.style.msTransform = "translateX(" + (275 * i + 30) + "px)";
			con.el.style.transform = "translateX(" + (275 * i + 30) + "px)";

			if (con.score == maxScore) {
				if (maxCount > 2) {
					con.el.children[0].classList.remove("larger");
					con.el.children[0].classList.add("large");
				} else {
					con.el.children[0].classList.remove("large");
					con.el.children[0].classList.add("larger");
				}
			} else {
				con.el.children[0].classList.remove("large");
				con.el.children[0].classList.remove("larger");
			}
		}
	}
	
	function createAdd(len) {
		var res = document.createElement("button");

		res.innerText = "+";

		res.classList.add("add-button")

		res.style.msTransform = "translateX(" + (275 * len + 30) + "px)";
		res.style.transform = "translateX(" + (275 * len + 30) + "px)";

		res.addEventListener("click", function() {
			addContestant();
			refreshContestants();
			resize();
		});

		return res;
	}

	function refreshContestants() {
		main.innerHTML = "";

		for (var i = contestants.length; i > 0; --i) {
			var con = contestants[i-1];

			var cEl = createContestantEl(con, i);
			con.el = cEl;
		}

		if (contestants.length > 0) transformContestants();
		
		for (var i = contestants.length; i > 0; --i) {
			var con = contestants[i-1];
			main.appendChild(con.el);
		}

		if (!locked) {
			main.appendChild(createAdd(contestants.length));
		}
	}

	function ease(t, a, b) {
		var eased = t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
		return (b - a) * eased + a;
	}

	function showPlay() {
		playButton.style.display = "block";
	}

	function play() {
		playButton.style.display = "none";

		if (!locked) {
			locked = true;
			
			document.body.classList.add("locked");

			resize();
		}

		setTimeout(function() {
			var start = 0;
			var loop = function(dt) {
				if (start == 0) {
					start = dt;
				}
	
				for (var i = 0, l = contestants.length; i < l; ++i) {
					var con = contestants[i];
	
					var startRemainder = con.oldScore - Math.floor(con.oldScore);
					var endRemainder = con.score - Math.floor(con.score);
	
					var scoreEl = con.el.querySelector(".score");
	
					var score = Math.round(ease(Math.min((dt - start) / 2000, 1), Math.floor(con.oldScore), Math.floor(con.score)));
	
					if (dt - start < 1000) {
						score += startRemainder;
					} else {
						score += endRemainder;
					}
	
					scoreEl.innerText = score;
				}
	
				if (dt - start < 2000) {
					window.requestAnimationFrame(loop);
				} else {
					for (var i = 0, l = contestants.length; i < l; ++i) {
						var con = contestants[i];
						con.oldScore = con.score;
					}
				}
			};
	
			window.requestAnimationFrame(loop);
			transformContestants();
		}, 1000);
	}

	playButton.addEventListener("mouseup", play);

	for (var i = 0; i < 5; ++i)
		addContestant();

	refreshContestants();

	function resize(rep) {
		var w = window.innerWidth;
		var h = window.innerHeight;

		var wm = 1400 * ((contestants.length + (locked ? 0 : 0.25)) / 5);

		var m = Math.min(w / wm, h / 1080);

		main.style.msTransform = "scale(" + m + ")";
		main.style.transform = "scale(" + m + ")";

		main.style.left = (w - wm * m) / 2 + "px";
	}

	window.addEventListener("resize", resize);
	resize();
})();