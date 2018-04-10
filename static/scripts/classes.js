function PlatformsBand(container) {
	/*
		Анимирующиеся платформы 
		platforms - элементы списка, запозиционированные абсолютно внутри родителя
		У родителя должны быть заданы ширина (во всю ширину документа) и высота
		и overflow:hidden для того, чтобы скрыть вываливающиеся элементы
	*/
	this.platforms = container.children();
	this.platformsAmount = this.platforms.length;
	this.firstPlatformLeft = Math.round($(document).width() / 2 - this.deltaFromCenter);
	// this.firstPlatformLeft = Math.round(600 - this.deltaFromCenter);
	this.firstPlatformTop = -this.platforms.height();
	// Количество элементов, проанимированных настолько, что их надо закинуть в начальную позицию
	this.animAmount = -1;
};
// смещение первого элемента от центра окна по горизонтали
PlatformsBand.prototype.deltaFromCenter = 2250;
// шаги смещения следующих элементов по горизонтали и вертикали
// с таким шагом элементы расставляются
PlatformsBand.prototype.step = {
	'x': 300,
	'y': 75
};

// Коэффициент, отражающий количество шагов расстановки.
// На такое количество шагов сдвигается лента за 1 шаг аниамации, только целое число шагов!
PlatformsBand.prototype.stepCoef = 2
// Время смещения элемента на 1 шаг анимации
// PlatformsBand.prototype.stepTime = 2200;
PlatformsBand.prototype.stepTime = 1500;
// Время задержки между шагами
PlatformsBand.prototype.stepDelay = 3000;
// Id интервала задержки между шагами
PlatformsBand.prototype.delayInterval = null;
PlatformsBand.prototype.passedFactor = null;
// Мышь наведена на какой-то из элементов
PlatformsBand.prototype.hovered = false;
// Лента находится в движении
PlatformsBand.prototype.moved = false;
PlatformsBand.prototype.dispose = function() {
	/*
		Функция, упорядочивающая элементы с заданным шагом step
	*/
	var platforms = this.platforms;
	var this_ = this;
	this.firstPlatformLeft = $(document).width() / 2 - this.deltaFromCenter;
	this.animAmount = -1;
	platforms.each(function(i,platform) {
			platform = platforms.slice(i, i+1);
			platform.css({
				'left': this_.firstPlatformLeft + i * this_.step.x,
				'top':  this_.firstPlatformTop + i * this_.step.y
			})
		});
}
PlatformsBand.prototype.setAnimatable = function() {
	this.animatable = this.platforms.filter(function(index, platform) {
			return ($(platform).offset().left < $(document).width());
		}
	);
};
PlatformsBand.prototype.move = function() {
	/*
		Функция, зацикленно двигающая ленту элементов
		На каждом шаге последний элемент ленты переставляется в начало
	*/
	var this_ = this,
		platforms = this.platforms;
	var passedFactor = this.passedFactor;
	var xStepVal = this.step.x * this.stepCoef;
	var yStepVal = this.step.y * this.stepCoef;
	var stepPeriod = this.stepTime;
	if (passedFactor) {
		// Проверка на то, была ли лента остановлена во время движения
		// Определяются новые значения шагов и времени, чтобы закончить шаг анимации, на котором она была прервана
		// Доезжает лента для того, чтобы сместиться на целое число шагов.
		// Это нужно для того, чтобы переставить последние элементы в начало ленты
		xStepVal = xStepVal * passedFactor;
		yStepVal = yStepVal * passedFactor;
		stepPeriod = this.stepTime * passedFactor;
		this.passedFactor = null;
	};
	// this.setAnimatable();
	// this.animatable.animate(
	this_.moved = true;
	platforms.animate(
		{
			'left': "+=" + xStepVal,
			'top': "+=" + yStepVal
		},
		stepPeriod,
		'easeInOutQuad',
		// 'easeInCubic',
		// 'easeInExpo',
		// 'linear',
		function() {
			if (this == platforms[this_.platformsAmount - 1]) {
				this_.moved = false;
				this_.animAmount = (this_.animAmount + 1) % this_.platformsAmount;

				for (var j = 0; j < this_.stepCoef; j++ ) {
					var rightmostPlatform = platforms.slice(0, 1);
					var rightmostPlatformLeft = rightmostPlatform.position().left
					platforms.each(function(i, e) {
						// ищем платформу с максимальным смещением вправо
						var platform = $(e);
						var platformLeft = platform.position().left
						if (platformLeft > rightmostPlatformLeft) {
							rightmostPlatform = platform;
							rightmostPlatformLeft = platformLeft;
						}
					});
					rightmostPlatform.css({
						'left': this_.firstPlatformLeft + j * this_.step.x,
						'top': this_.firstPlatformTop + j * this_.step.y
					});
				}
				this_.delayInterval = setInterval(function() {
					if (!this_.hovered) {
						this_.move();
						clearInterval(this_.delayInterval);
					}
				}, this_.stepDelay);
			}
		}
	);
};
PlatformsBand.prototype.initMoving = function() {
	/*
		Функция, которая располагает платформы, готовит их к началу движения и запускает
	*/
	clearInterval(this.delayInterval);
	this.dispose()
	this.move()
}


PlatformsBand.prototype.pause = function() {
	/*
		Функция, которая паузит движущуюся ленту и сохраняет число, отражающее незавершенную часть шага анимации
	*/
	this.platforms.stop(true, false);
	var stepsCount = Math.abs(this.firstPlatformLeft - this.platforms.position().left) / (this.step.x * this.stepCoef);
	this.passedFactor = 1 - (stepsCount - Math.floor(stepsCount));
};
