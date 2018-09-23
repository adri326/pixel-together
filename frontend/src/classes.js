class Brush {
	constructor(name = "", options) {
		this.name = name; // wew
		this.options = Object.assign({}, Brush.defaultOptions, options);
	}

	stroke(centerX, centerY) {
		let replacedColors = [];
		for (let x = -Math.floor(this.options.size); x < this.options.size; x++) {
			for (let y = -Math.floor(this.options.size); y < this.options.size; y++) {
				// si la distance entre le point en cours et le centre est plus petite que size - 1:
				if (Math.sqrt(x**2 + y**2) <= this.options.size - 1) {
					if (!replacedColors.some((point) => point[0] === centerX + x && point[1] === centerY + y)) {
						replacedColors.push([centerX + x, centerY + y, ...imageData.getPixel(x, y)]); // [x, y, r, g, b, a]
					}
					this.dot(centerX + x, centerY + y);
				}
			}
		}
		return replacedColors;
	}

	dot(x, y, color = data.color) {
		if (x >= 0 && x < params.paper.relWidth && y >= 0 && y < params.paper.relHeight) {
			imageData.setPixel(x, y, data.color);
		}
	}
}
Brush.defaultOptions = {
	size: 2
};

var brushes = [
	new Brush("Simple", {size: 1}),
	new Brush("Big", {size: 3.5})
];

class PixelImage {
	constructor(width, height) {
		if (
			(width > 0) &&
			(height > 0)
		) {
			this.width = width;
			this.height = height;
			this.data = new Uint8Array(this.width * this.height * 4).map((_, i) => params.default.paperColor[i % 4]);
		} else {
			return false;
		}
	}

	setPixel(x, y, color) {
		for (let i = 0; i < 4; ++i) {
			this.data[y * this.width * 4 + x * 4 + i] = color[i];
		}
	}

	getPixel(x, y) {
		return this.data.slice(y * this.width * 4 + x * 4, y * this.width * 4 + x * 4 + 4);
	}
}

class ColorHolder {
	constructor(parent, color) {
		this.parent = parent;
		this.color = color.slice();
	}

	update() {
		this.parent.style.background = toRGBA(this.color);
	}
}

// color blending methods
var color = {
	add: ([r1, g1, b1, a1], [r2, g2, b2, a2]) => {
		return [r1+r2, g1+g2, b1+b2, a1+a2];
	},

	multiply: ([r1, g1, b1, a1], [r2, g2, b2, a2]) => {
		let beta = 1 - a2;
		let r = r1 * beta + r1 * r2 * a2;
		let g = g1 * beta + g1 * g2 * a2;
		let b = b1 * beta + b1 * b2 * a2;
		return [r, g, b, a1];
	},

	over: ([r1, g1, b1, a1], [r2, g2, b2, a2]) => { // 1 over 2
		let alpha = a1 + a2 * (1 - a1);
		let r = r2 + (r1 - r2) * alpha;
		let g = g2 + (g1 - g2) * alpha;
		let b = b2 + (b1 - b2) * alpha;
		return [r, g, b, alpha];
	}
};
