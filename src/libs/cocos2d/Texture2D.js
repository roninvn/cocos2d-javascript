var sys = require('sys'),
    Obj = require('object').Object;

/** @member cocos
 * @class */
var Texture2D = Obj.extend(/** @scope cocos.Texture2D# */{
	imgElement: null,
	size: null,

	init: function(opts) {
		var file = opts['file'],
			data = opts['data'],
			texture = opts['texture'];

		if (file) {
			data = resource(file);
		} else if (texture) {
			data = texture.get('data');
		}

		this.size = {width: 0, height: 0};

		this.imgElement = data;
		this.set('size', {width:this.imgElement.width, height: this.imgElement.height});
	},

	drawAtPoint: function(ctx, point) {
		ctx.drawImage(this.imgElement, point.x, point.y);
	},
	drawInRect: function(ctx, rect) {
		ctx.drawImage(this.imgElement,
			rect.origin.x, rect.origin.y,
			rect.size.width, rect.size.height
		);
	},

	data: function() {
		return this.imgElement.src;
	}.property(),

	contentSize: function() {
		return this.size;
	}.property()
});

exports.Texture2D = Texture2D;