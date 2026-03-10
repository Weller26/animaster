function animaster() {
	function AnimatorInstance() {
		this._steps = [];
		this._transform = { ratio: null, translation: null };
		this._firstShown = null;
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
		delay: function (element, duration) {},
		// moveAndHide: function (element, duration, translation) {
		// 	animations.move(element, (duration * 2) / 5, translation);
		// 	animations.fadeOut(element, (duration * 3) / 5);
		// },
		// showAndHide: function (element, duration) {
		// 	animations.fadeIn(element, duration / 3);
		// 	element.style.transitionDuration = `${duration / 3}ms`;
		// 	animations.fadeOut(element, duration / 3);
		// },
		// skewX: function (element, duration, angle) {
		// 	element.style.transitionDuration = `${duration}ms`;
		// 	element.style.transform = `skewX(${angle}deg)`;
		// },
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
		fadeOut: makeInstantAnimation("fadeOut"),
		scale: makeInstantAnimation("scale"),
		skewX: makeInstantAnimation("skewX"),
		moveAndHide: function (element, duration, translation) {
			this.addMove((duration * 2) / 5, translation)
				.addFadeOut((duration * 3) / 5)
				.play(element);
			return this;
		},
		showAndHide: function (element, duration) {
			this.addFadeIn(duration / 3)
				.addDelay(duration / 3)
				.addFadeOut(duration / 3)
				.play(element);
			return this;
		},
		addDelay: makeStepAnimation("delay"),
		addFadeIn: makeStepAnimation("fadeIn"),
		addFadeOut: makeStepAnimation("fadeOut"),
		addMove: makeStepAnimation("move"),
		addScale: makeStepAnimation("scale"),
		heartBeating: function (element) {
			const steps = [new Step("scale", 500, 1.4), new Step("scale", 500, 1)];
			let stop = false;
			(async () => {
				while (!stop) {
					for (const step of steps) {
						await new Promise((resolve) => {
							animations[step.animation].call(
								this,
								element,
								step.duration,
								...step.args,
							);
							setTimeout(() => {
								resolve();
							}, step.duration);
						});
					}
				}
			})();
			return {
				stop: () => (stop = true),
			};
		},
		play: function (element) {
			let stop = false;
			(async () => {
				for (const step of this._steps) {
					if (stop) break;
					await new Promise((resolve) => {
						animations[step.animation].call(this, element, step.duration, ...step.args);
						setTimeout(() => {
							resolve();
						}, step.duration);
					});
				}
			})();

			return {
				stop: () => (stop = true),
				reset: () => {
					stop();
				},
			};
		},
		buildHandler: function () {
			let self = this;
			return function () {
				self.play(this);
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

	document.getElementById("moveAndHidePlay").addEventListener("click", function () {
		const block = document.getElementById("moveAndHideBlock");
		animaster().moveAndHide(block, 500, { x: 100, y: 20 });
	});

	document.getElementById("moveAndHideReset").addEventListener("click", function () {
		const block = document.getElementById("moveAndHideBlock");
		animaster().moveAndHide(block, 500, { x: 100, y: 20 });
	});

	document.getElementById("showAndHidePlay").addEventListener("click", function () {
		const block = document.getElementById("showAndHideBlock");
		animaster().showAndHide(block, 500);
	});

	let heartBeatingStopper = null;

	document.getElementById("heartBeatingPlay").addEventListener("click", function () {
		const block = document.getElementById("heartBeatingBlock");
		heartBeatingStopper = animaster().heartBeating(block);
	});

	document.getElementById("heartBeatingStop").addEventListener("click", function () {
		if (heartBeatingStopper) {
			heartBeatingStopper.stop();
		}
		heartBeatingStopper = null;
	});

	const worryAnimationHandler = animaster()
		.addMove(200, { x: 80, y: 0 })
		.addMove(200, { x: 0, y: 0 })
		.addMove(200, { x: 80, y: 0 })
		.addMove(200, { x: 0, y: 0 })
		.buildHandler();

	document.getElementById("worryAnimationBlock").addEventListener("click", worryAnimationHandler);
}

/**
 * what we've done
 * 1
 * 2
 * 3
 * 4
 * 5
 * 8
 * 9
 *
 * 11
 * 16
 *
 *
 */
