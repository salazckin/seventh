if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function(elt /*, from*/) {
		var len = this.length >>> 0;
		var from = Number(arguments[1]) || 0;
		from = (from < 0)
				 ? Math.ceil(from)
				 : Math.floor(from);
		if (from < 0)
			from += len;

		for (; from < len; from++) {
			if (from in this &&
					this[from] === elt)
				return from;
		}
		return -1;
	};
}

(function($) {
	function range(start, stop, step) {
		if (arguments.length <= 1) {
			stop = start || 0;
			start = 0;
		};
		step = arguments[2] || 1;

		var len = Math.max(Math.ceil((stop - start) / step), 0);
		var idx = 0;
		var range = new Array(len);

		while(idx < len) {
			range[idx++] = start;
			start += step;
		};

		return range;
	};

	$.fn.animateSeq = function(kwargs) {
		/* анимирует картинки с помощью background-position
			принимает объект с полями:
			spriteSrc - адрес спрайта,
			slidesCount - количество кадров (дефолтное значение - 1),
			spriteAlign - раположение кадров (по вертикали: vertical или по горизонтали) (дефолтное значение - по горизонтали),
			slideSize - размер стороны кадра (в зависимости от их расположения),
			slideDuration - функция, которая рассчитывает время демонстрации одного кадра (в нее передается номер текущего кадра и их общее количество), или само значение (дефолтное значение - 40ms),
			cycleTimes - количество повторов (дефолтное значение - Infinity),
			reverse - true, если нужно прокрутить анимацию в обратную сторону
			startSlide - кадр, с которого нужно начать анимацию, если не передается, то анимация идет сначала.
			// slideGap - расстояние между кадрами в спрайте (дефолтное значение - 0)
		*/

		if (kwargs == 'stop') {
			clearTimeout(+this.data('_jqueryAnimateSeq').timer);
			this.removeData('_jqueryAnimateSeq');
			return this;
		}

		var elem = this,
			cycleTimes, duration, durationConst,
			src, tempImg, size,
			slidesCount = kwargs.slidesCount || 1,
			startSlide = kwargs.startSlide || 0,
			slides = (!!kwargs.reverse ? range(slidesCount - 1, -1, -1) : range(slidesCount)),
			// slideIndex = 0, currSlide, currPos, oldPos, currCycle = 0,
			// slideIndex = -1, currSlide, currPos, oldPos, currCycle = 0,
			currSlide, currPos, oldPos, currCycle = 0,
			slideIndex = slides.indexOf(startSlide),
			bgPattern,
			timer;


		if (!!elem.data('_jqueryAnimateSeq')) {
			/* если пытаются повторно вызвать анимацию, не реагируем */
			elem.trigger({
				'type': 'error.animateseq'
			});
			return elem;
		};

		src = kwargs.spriteSrc;
		duration = kwargs.slideDuration;
		cycleTimes = (kwargs.cycleTimes == 0) ? 0 : kwargs.cycleTimes || Infinity;
		
		// gap = kwargs.slideGap || 0;
		
		// oldPos = this.css('backgroundPosition').split(' ');
		oldPos = [this.css('backgroundPositionX'), this.css('backgroundPositionY')];
		bgPattern = (kwargs.spriteAlign == 'vertical') ? oldPos[0] + ' {{ pos }}px' : '{{ pos }}px ' + oldPos[1];
		size = kwargs.slideSize;
		/*
		// вариант с автоопределением размера кадра, но тогда нужно весь остальной код переносить в onload картинки
		tempImg = new Image();
		tempImg.onload = function(ev) {
			size = (tempImg[(kwargs.spriteAlign == 'vertical') ? 'height' : 'width'] - gap * (slidesCount - 1)) / slidesCount;
		};
		tempImg.src = src;
		*/
		
		currPos = function(slideIndex) {
			return -(slideIndex * size);
			// return -(slideIndex * (size + gap));
		};

		if (!(kwargs.slideDuration instanceof Function)) {
			durationConst = kwargs.slideDuration || 40;
			duration = function() {
				return durationConst;
			};
		};

		if (src) {
			elem.css('backgroundImage', 'url("' + src + '")');
		};

		elem.data('_jqueryAnimateSeq', {'timer': null});

		function playMovie() {
			if (!elem.parent().length) {
				/* если элемент извлечен из DOM, останавливаем все */
				elem.removeData('_jqueryAnimateSeq');
				return;
			};
			
			if (slideIndex == slidesCount - 1) {
				// Начало нового поворота
				currCycle++;
			};
			if (currCycle >= cycleTimes) {
				elem.removeData('_jqueryAnimateSeq');
				elem.trigger({
					'type': 'end.animateseq',
					'reverse': !!kwargs.reverse
				});
				return;
			};
			
			slideIndex = (slideIndex + 1) % slidesCount;
			currSlide = slides[slideIndex];
			elem.trigger({
				'type': 'step.animateseq',
				'stepNum': slideIndex,
				'currSlide': currSlide,
				'reverse': !!kwargs.reverse
			});
			
			// console.log(currSlide);
			// console.log(duration(currSlide, slidesCount));
			elem.css('backgroundPosition', bgPattern.replace('{{ pos }}', currPos(currSlide)));
			
			timer = setTimeout(playMovie, duration(currSlide, slidesCount));
			elem.data('_jqueryAnimateSeq').timer = timer;
		};
		elem.trigger({
			'type': 'start.animateseq'
		});
		playMovie();

		return elem;
	};
})(jQuery);
