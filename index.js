function animaster() {
	function AnimatorInstance() {
		this._steps = [];
	}

	const animations = {
		move: function (element, duration, translation) {
			element.style.transitionDuration = `${duration}ms`;
			element.style.transform = getTransform(translation, null);
		},
		fadeIn: function (element, duration) {
			element.style.transitionDuration = `${duration}ms`;
			element.classList.remove("hide");
			element.classList.add("show");
		},
        fadeOut: function fadeOut(element, duration) {
            element.style.transitionDuration = `${duration}ms`;
            element.classList.add("hide");
            element.classList.remove("show");
        },
		scale: function (element, duration, ratio) {
			element.style.transitionDuration = `${duration}ms`;
			element.style.transform = getTransform(null, ratio);
		},
	};

	function makeInstantAnimation(animation) {
		return function (element, duration, ...args) {
			this.play(element);
			animations[animation](element, duration, ...args);
			return this;
		};
	}

	function makeStepAnimation(animation) {
		return function (duration, ...args) {
			return cloneWithAnimation(this, animation, duration, ...args);
		};
	}

	const prototype = {
		move: makeInstantAnimation("move"),
		fadeIn: makeInstantAnimation("fadeIn"),
		scale: makeInstantAnimation("scale"),
		addMove: makeStepAnimation("move"),
		addScale: makeStepAnimation("scale"),
		play: async function (element) {
			for (const step of this._steps) {
				await new Promise((resolve) => {
					setTimeout(() => {
						animations[step.animation](element, step.duration, ...step.args);
						resolve();
					}, step.duration);
				});
			}
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

	function cloneWithAnimation(animator, animation, duration, ...args) {
		const copy = structuredClone(animator);
		copy._steps.push(new Step(animation, duration, ...args));
		Object.setPrototypeOf(copy, prototype);
		return copy;
	}

	class Step {
		constructor(animation, duration, ...args) {
			this.animation = animation;
			this.duration = duration;
			this.args = args;
		}
	}

	Object.setPrototypeOf(AnimatorInstance.prototype, prototype);
	return new AnimatorInstance();
}

addListeners();

function addListeners() {
	document.getElementById("fadeInPlay").addEventListener("click", function () {
		const block = document.getElementById("fadeInBlock");
		animaster().fadeIn(block, 500);
	});

	document.getElementById("fadeOutPlay").addEventListener("click", function () {
		const block = document.getElementById("fadeOutBlock");
		animaster().fadeOut(block, 500);
	})

	document.getElementById("movePlay").addEventListener("click", function () {
		const block = document.getElementById("moveBlock");
		const customAnimation = animaster()
			.addMove(200, { x: 40, y: 40 })
			.addScale(800, 1.3)
			.addMove(200, { x: 80, y: 0 })
			.addScale(800, 1)
			.addMove(200, { x: 40, y: -40 })
			.addScale(800, 0.7)
			.addMove(200, { x: 0, y: 0 })
			.addScale(800, 1);
		customAnimation.play(block);
		// animaster().move(block, 500, { x: 100, y: 10 });
	});

	document.getElementById("scalePlay").addEventListener("click", function () {
		const block = document.getElementById("scaleBlock");
		animaster().scale(block, 500, 1.25);
	});
}
