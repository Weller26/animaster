function animaster() {
    this._steps = [];

	const prototype = {
		move: function move(element, duration, translation) {
			element.style.transitionDuration = `${duration}ms`;
			element.style.transform = getTransform(translation, null);
			return this;
		},
		fadeIn: function fadeIn(element, duration) {
			element.style.transitionDuration = `${duration}ms`;
			element.classList.remove("hide");
			element.classList.add("show");
			return this;
		},
		scale: function (element, duration, ratio) {
			element.style.transitionDuration = `${duration}ms`;
			element.style.transform = getTransform(null, ratio);
		},
	};

	function getTransform(translation, ratio) {
		const result = [];
		if (translation) {
			result.push(`translate(${translation.x}px,${translation.y}px)`);
		}
		if (ratio) {
			result.push(`scale(${ratio})`);
		}
		return result.join(" ");
	}

	Object.setPrototypeOf(animaster.prototype, prototype);
}

addListeners();

function addListeners() {
	document.getElementById("fadeInPlay").addEventListener("click", function () {
		const block = document.getElementById("fadeInBlock");
		animaster().fadeIn(block, 500);
	});

	document.getElementById("movePlay").addEventListener("click", function () {
		const block = document.getElementById("moveBlock");
		animaster().move(block, 500, { x: 100, y: 10 });
	});

	document.getElementById("scalePlay").addEventListener("click", function () {
		const block = document.getElementById("scaleBlock");
		animaster().scale(block, 500, 1.25);
	});
}
