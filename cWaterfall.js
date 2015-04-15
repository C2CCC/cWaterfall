/*
 *
 * 临时版本，无响应式，带ajax加载,请设置ajax中的async为false,3列
 * chrome貌似有兼容性问题
 * C2CCC
 *
 * */
(function($) {
	$.fn.cWaterfall = function(options) {
		var opts = $.extend({}, $.fn.cWaterfall.defaults, options);
		var cW = $(this);
		//为容器和方格添加样式
		cW.css({
			'width': opts.containerWidth,
			'position': 'relative',
		});
		cW.children().css({
			'width': opts.columnWidth,
			'margin': opts.gap + ' 0 0 ' + opts.gap,
			'position': 'absolute'
		});
		//定义列、列高、方格数组
		var columnNum = Math.floor(opts.containerWidth / (opts.columnWidth + opts.gap));
		if (columnNum <= 0) {
			alert('Cannot hold column!');
			return false;
		}
		columnHeights = [];
		for (var i = 0; i < columnNum; i++) {
			columnHeights[i] = 0;
		}
		var elems = [];
		elemNum = 0;
		cW.children().each(function() {
			elems.push($(this));
			elemNum++;
			$(this).css('opacity', '0');
		});
		//添加底部提示元素
		var bottomTip = $("<span></span>").addClass('cBottomTip').html("下滑加载更多").css({
			'position': 'absolute',
			'bottom': '0',
			'width': opts.containerWidth,
			'height': '50px',
			'font-size': '14px',
			'text-align': 'center'
		});
		cW.prepend(bottomTip);
		//执行排序，延时以修复chrome无法测量实际高度的问题
		setTimeout(function() {
			calLayout(elems);
		}, 500);
		//排序
		function calLayout(e) {
			for (i in e) {
				var c = findMin(columnHeights[0], columnHeights[1], columnHeights[2]);
				var domE = e[i].get(0); //jQuery对象转换为DOM对象
				var ro = domE.getBoundingClientRect();
				var eHeight = ro.bottom - ro.top;
				var currBlkHt = eHeight + opts.gap; //当前布局方格高，包括margin
				var currLeft = c * (opts.columnWidth + opts.gap);
				var currTop = columnHeights[c];
				e[i].css({
					'left': currLeft,
					'top': currTop,
					'margin-top': '0'
				});
				columnHeights[c] += currBlkHt;
			}
			//执行动画
			var i = 0;
			var anime = {
				opacity: '1',
				marginTop: '+=' + opts.gap
			}
			orderAnimate(e, anime, 300, i);
			//最后定义容器高度
			var c = findMax(columnHeights[0], columnHeights[1], columnHeights[2]);
			cW.css({
				'height': c + opts.gap + 50
			});
		}

		function orderAnimate(obj, anime, t, i) {
			obj[i].animate(anime, t);
			if (obj[i + 1]) {
				obj[++i].delay(t / 3).animate(anime, t);
				if (obj[i + 1]) {
					obj[++i].delay(t / 3).animate(anime, t, function() {
						if (obj[++i]) {
							orderAnimate(obj, anime, t, i++);
						}
					});
				}
			}
		}

		function findMin(a, b, c) {
			if (a <= b && a <= c) {
				return 0;
			} else if (b <= c) {
				return 1;
			} else return 2;
		}

		function findMax(a, b, c) {
			if (a >= b && a >= c) {
				return a;
			} else if (b >= c) {
				return b;
			} else return c;
		}

		//异步加载更多
		function loadMoreLayout() {
			var addedElem = [];
			cW.children().eq(elemNum).nextAll().each(function() {
				addedElem.push($(this));
				$(this).css('opacity', '0');
				elemNum++;
			});
			calLayout(addedElem);
			$('.cBottomTip').html("下滑加载更多");
		}
		$(window).scroll(function() {
			var documentTop = $(document).scrollTop();
			var windowHeight = $(window).height();
			var documentHeight = $(document).height();
			if (documentTop >= (documentHeight - windowHeight)) {
				$('.cBottomTip').html("加载中...");
				opts.loadMore();
				loadMoreLayout();
			}
		});
	};
	$.fn.cWaterfall.defaults = {
		containerWidth: 960,
		columnWidth: 280,
		gap: 30,
		loadMore: function() {}
	};
})(jQuery);