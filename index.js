function animaster() {
	function AnimatorInstance() {
		this._steps = [];
		this._transform = { ratio: null, translation: null };
	}

	const animations = {
		move: function (element, duration, translation) {
			element.style.transitionDuration = `${duration}ms`;
			this._transform.translation = translation;
			element.style.transform = getTransformString(this._transform);
		},
		fadeIn: function (element, duration) {
			element.style.transitionDuration = `${duration}ms`;
			element.classList.remove("hide");
			element.classList.add("show");
		},
		fadeOut: function (element, duration) {
			element.style.transitionDuration = `${duration}ms`;
			element.classList.add("hide");
			element.classList.remove("show");
		},
		scale: function (element, duration, ratio) {
			element.style.transitionDuration = `${duration}ms`;
			this._transform.ratio = ratio;
			element.style.transform = getTransformString(this._transform);
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
			let stop = false;
			for (const step of this._steps) {
				if (stop) break;
				await new Promise((resolve) => {
					animations[step.animation].call(this, element, step.duration, ...step.args);
					setTimeout(() => {
						resolve();
					}, step.duration);
				});
			}

			return {
				stop: () => (stop = true),
				reset: () => {
					stop();
				},
			};
		},
		buildHandler: function () {
			const self = this;
			return function (element) {
				self.play(element);
			};
		},
	};

	function getTransformString(transform) {
		const result = [];
		const { translation, ratio } = transform;
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
	});

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
		const a = animaster().addMove(111, { x: 10, y: -10 });
		const b = a.addMove(400, { x: 40, y: -40 });
		a.play(block);
		// animaster().scale(block, 500, 1.25);
	});
}

/**
 * what we've done
 * 1
 * 2
 * 8
 * 9
 *
 * 11
 * 16
 *
 *
 */
