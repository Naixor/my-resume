var util = {
    each: {
        xDirection: function (data, width, startX, startY, endX, endY, handler) {
            for(var y = startY; y < endY; y++) {
                for (var x = startX; x < endX; x++) {
                    handler((y*width + x) << 2, x, y);
                }
            }
        },
        yDirection: function(data, width, startX, startY, endX, endY, handler) {
			for (var x = startX; x < endX; x++) {
				for(var y = startY; y < endY; y++) {
					handler((y*width + x) << 2, x, y);
				}
			}
		}
    },
    copyImageData: function(data) {
		return new Uint8ClampedArray(data);
	},
    copyToArray: function (data) {
		return Array.prototype.slice.call(data);
	},
    convolution: function (data, matrix, divisor, offset) {
		var d = 0,
			i = 0;
		for (i = 0, l = matrix.length; i < l; i++) {
			d += matrix[i]*data[i];
		}
		return d/divisor + offset;
	},
    getImageConvolution: function (data, width, height, x, y, n, radius, boundaryFillColor) {
		var dx = 0,
			dy = 0,
			_y, _x,
			result = [];
        radius = radius || 1,
        boundaryFillColor = boundaryFillColor || data[(width * y + x) * 4 + n];

		for (dy = -radius; dy <= radius; dy++) {
			_y = y + dy;
			for (dx = -radius; dx <= radius; dx++) {
				_x = x + dx;
				if (_y > height-1 || _y < 0 || _x > width-1 || _x < 0) {
					result.push(boundaryFillColor);
					continue;
				}
				result.push(data[(_x + width*_y) * 4 + n]);
			}
		}
		return result;
	}
};

/**
 * 高斯滤镜, 这个处理使用两次一维高斯滤波处理, 来实现一次二维高斯卷积
 * @param {Array}  data   图像数据
 * @param {Number} width  图像宽
 * @param {Number} height 图像高
 * @param {Number} radius 卷积半径
 * @param {Number} sigma  卷积系数
 */
function Gauss (data, width, height, radius, sigma, boundaryFillColor) {
    radius = radius || 3;
    sigma = sigma || radius/3;
    boundaryFillColor = boundaryFillColor || 127;

    // 计算一次高斯渐变
    var gaussFilter = new Array(radius * 2 + 1),
        g = 1/(Math.sqrt(Math.PI * 2) * sigma),
        f = -1 / (2 * sigma * sigma),
        gaussSum = 0.0;
    for (var i = -radius; i <= radius; i++) {
        gaussFilter[i + radius] = g * Math.exp(f * i * i);
        gaussSum += gaussFilter[i + radius];
    }
    for (var i = 0; i <= radius; i++) {
        gaussFilter[i + radius] = gaussFilter[radius - i] = gaussFilter[radius - i]/gaussSum;
    }

    var idx = 0,
        r, g, b, k;
    // x方向渐变
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            r = b = g = 0;
            for (var i = -radius; i <= radius; i++) {
                k = x+i;
                idx = (width * y + k) << 2;
                if (k >= 0 && k < width) {
                    r += data[idx] * gaussFilter[i + radius];
                    g += data[idx + 1] * gaussFilter[i + radius];
                    b += data[idx + 2] * gaussFilter[i + radius];
                } else {
                    // 使用boundaryFillColor来减弱超出范围补0带来的黑边
                    if (boundaryFillColor !== false) {
                        r += boundaryFillColor * gaussFilter[i + radius];
                        g += boundaryFillColor * gaussFilter[i + radius];
                        b += boundaryFillColor * gaussFilter[i + radius];
                    }
                }
            }
            idx = (width * y + x) << 2;
            data[idx] = r;
            data[idx + 1] = g;
            data[idx + 2] = b;
        }
    }

    // y方向渐变
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
            r = b = g = 0;
            for (var i = -radius; i <= radius; i++) {
                k = y+i;
                idx = (width * k + x) << 2;
                if (k >= 0 && k < height) {
                    r += data[idx] * gaussFilter[i + radius];
                    g += data[idx + 1] * gaussFilter[i + radius];
                    b += data[idx + 2] * gaussFilter[i + radius];
                } else {
                    // 使用boundaryFillColor来减弱超出范围补0带来的黑边
                    if (boundaryFillColor !== false) {
                        r += boundaryFillColor * gaussFilter[i + radius];
                        g += boundaryFillColor * gaussFilter[i + radius];
                        b += boundaryFillColor * gaussFilter[i + radius];
                    }
                }
            }
            idx = (width * y + x) << 2;
            data[idx] = r;
            data[idx + 1] = g;
            data[idx + 2] = b;
        }
    }
}

/**
 * 灰度处理
 * @param {Array} data 图像数据
 */
function Gray(data) {
    var l = data.length - 1,
        rgb = 0;
    while(l >= 0) {
        rgb = data[l - 3]*0.299 + data[l - 2]*0.587 + data[l-1]*0.114;
        data[l - 3] = data[l - 2] = data[l-1] = rgb;
        l -= 4;
    }
}

function diff(data, width, height, radius1, radius2, sigma1, sigma2, boundaryFillColor) {
    var gaussData1 = util.copyToArray(data);
    var gaussData2 = util.copyToArray(data);
    var array = new Array(width * height);

    // 两次不同的高斯卷积
    Gauss(gaussData1, width, height, radius1, sigma1, boundaryFillColor);
    Gauss(gaussData2, width, height, radius2, sigma2, boundaryFillColor);

    util.each.xDirection(data, width, 0, 0, width, height, function (i) {
        // data[i] = data[i + 1] = data[i + 2] =
        array[i >> 2] = gaussData1[i] - gaussData2[i];
    });
    return array;
}

/**
 * DoG描边处理函数
 * @param {Array}  data    图像数据
 * @param {Number} width   图像宽度
 * @param {Number} height  图像高度
 * @param {Number} radius1 第一次高斯滤波的半径
 * @param {Number} radius2 第二次高斯滤波的半径
 * @param {Number} sigma1  第一次高斯滤波的系数
 * @param {Number} sigma2  第二次高斯滤波的系数
 * @param {Number} trash   阀值
 */
function DoG(data, width, height, radius1, radius2, sigma1, sigma2, trash, boundaryFillColor) {
    trash = trash || 3;
    // 灰度处理
    Gray(data);

    var bData = diff(data, width, height, radius1, radius2, sigma1, sigma2, boundaryFillColor);

    // 对两次高斯卷积求差, 小于阀值的丢弃, 大于阀值的绘制
    util.each.xDirection(data, width, 0, 0, width, height, function(i) {
        if (trash > 0) {
            if (bData[i >> 2] < trash) {
                data[i] = data[i + 1] = data[i + 2] = 0;
            } else {
                data[i] = data[i + 1] = data[i + 2] = 255;
            }
        } else {
            data[i] = data[i + 1] = data[i + 2] = bData[i >> 2] / (sigma1 - sigma2);
        }
    });
}

/**
 * 基于rgb通道的双边滤波处理
 * @param {Array}  data   图像数据
 * @param {Number} width  图像宽
 * @param {Number} height 图像高
 * @param {Number} radius 卷积半径
 * @param {Number} sigmad 基于距离的高斯滤波系数
 * @param {[type]} sigmar 基于色彩的高斯滤波系数
 */
function BilateralFilter (data, width, height, radius, sigmad, sigmar, boundaryFillColor) {
    radius = radius || 3;
    sigmad = sigmad || radius / 3;
    sigmar = sigmar || 1;
    boundaryFillColor = boundaryFillColor || 127;

    // 计算一次高斯渐变
    var gsDFilter = new Array(radius * 2 + 1),
        gsCFilter = new Array(255 * 2 + 1),
        g = 1 / (Math.sqrt(Math.PI * 2) * sigmad),
        f = -1 / (2 * sigmad * sigmad),
        g1 = 1 / (Math.sqrt(Math.PI * 2) * sigmar),
        f1 = -1 / (2 * sigmar * sigmar),
        gaussSum = 0.0,
        i, y, x;

    // 算出基于距离的一维高斯滤波系数, 后面做两次一维高斯滤波处理时会用到
    for (i = -radius; i <= 0; i++) {
        gsDFilter[i + radius] = gsDFilter[radius - i] = g * Math.exp(f * i * i);
        gaussSum += (gsDFilter[i + radius] + gsDFilter[radius - i]);
    }
    // 算出基于色彩距离的高斯滤波系数, 后面使用时直接来这里拿, 以节省每次重算的消耗
    for (i = 0; i < 256; i++) {
        gsCFilter[i] = gsCFilter[0-i] = g1 * Math.exp(f1 * i * i);
    }

    var idxn = 0, idxt = 0,
        r, g, b, k,
        weightr, weightg, weightb,
        gaussSumr, gaussSumg, gaussSumb;

    // 下面对图像做x y两个方向的高斯一维滤波处理, 来实现对图像的一次二维高斯卷积处理
    // x方向计算像素颜色差值和像素距离差值的加权平均
    for (y = 0; y < height; y++) {
        for (x = 0; x < width; x++) {
            r = b = g = 0;
            idxt = (width * y + x) << 2;
            gaussSumr = gaussSumg = gaussSumb = 0.0;

            for (i = -radius; i <= radius; i++) {
                k = x+i;
                if (k >= 0 && k < width) {
                    idxn = (width * y + k) << 2;
                    weightr = gsDFilter[i + radius] * gsCFilter[Math.round(data[idxn] - data[idxt])];
                    weightg = gsDFilter[i + radius] * gsCFilter[Math.round(data[idxn + 1] - data[idxt + 1])];
                    weightb = gsDFilter[i + radius] * gsCFilter[Math.round(data[idxn + 2] - data[idxt + 2])];
                    r += data[idxn] * weightr;
                    g += data[idxn + 1] * weightg;
                    b += data[idxn + 2] * weightb;
                } else {
                    weightr = gsDFilter[i + radius] * gsCFilter[Math.round(boundaryFillColor - data[idxt])];
                    weightg = gsDFilter[i + radius] * gsCFilter[Math.round(boundaryFillColor - data[idxt + 1])];
                    weightb = gsDFilter[i + radius] * gsCFilter[Math.round(boundaryFillColor - data[idxt + 2])];
                    r += boundaryFillColor * weightr;
                    g += boundaryFillColor * weightg;
                    b += boundaryFillColor * weightb;
                }
                gaussSumr += weightr;
                gaussSumg += weightg;
                gaussSumb += weightb;
            }
            data[idxt] = r / gaussSumr;
            data[idxt + 1] = g / gaussSumg;
            data[idxt + 2] = b / gaussSumb;
        }
    }

    // y方向计算像素颜色差值和像素距离差值的加权平均
    for (x = 0; x < width; x++) {
        for (y = 0; y < height; y++) {
            r = b = g = 0;
            idxt = (width * y + x) << 2;
            gaussSumr = gaussSumg = gaussSumb = 0.0;
            for (i = -radius; i <= radius; i++) {
                k = y+i;
                if (k >= 0 && k < height) {
                    idxn = (width * k + x) << 2;
                    weightr = gsDFilter[i + radius] * gsCFilter[Math.round(data[idxn] - data[idxt])];
                    weightg = gsDFilter[i + radius] * gsCFilter[Math.round(data[idxn + 1] - data[idxt + 1])];
                    weightb = gsDFilter[i + radius] * gsCFilter[Math.round(data[idxn + 2] - data[idxt + 2])];
                    r += data[idxn] * weightr;
                    g += data[idxn + 1] * weightg;
                    b += data[idxn + 2] * weightb;
                } else {
                    weightr = gsDFilter[i + radius] * gsCFilter[Math.round(boundaryFillColor - data[idxt])];
                    weightg = gsDFilter[i + radius] * gsCFilter[Math.round(boundaryFillColor - data[idxt + 1])];
                    weightb = gsDFilter[i + radius] * gsCFilter[Math.round(boundaryFillColor - data[idxt + 2])];
                    r += boundaryFillColor * weightr;
                    g += boundaryFillColor * weightg;
                    b += boundaryFillColor * weightb;
                }
                gaussSumr += weightr;
                gaussSumg += weightg;
                gaussSumb += weightb;
            }
            data[idxt] = r / gaussSumr;
            data[idxt + 1] = g / gaussSumg;
            data[idxt + 2] = b / gaussSumb;
        }
    }
}

/**
 * 单独基于r通道的双边滤波处理, 处理内容同上
 * @param {Array}  data   图像数据
 * @param {Number} width  图像宽
 * @param {Number} height 图像高
 * @param {Number} radius 卷积半径
 * @param {Number} sigmad 基于距离的高斯滤波权值
 * @param {[type]} sigmar 基于色彩的高斯滤波权值
 */
function BilateralFilterR (data, width, height, radius, sigmad, sigmar, boundaryFillColor) {
    radius = radius || 3;
    sigmad = sigmad || radius/3;
    sigmar = sigmar || 1;
    boundaryFillColor = boundaryFillColor || 127;

    // 计算一次高斯渐变
    var gsDFilter = new Array(radius * 2 + 1),
        gsCFilter = new Array(255 * 2 + 1),
        g = 1/(Math.sqrt(Math.PI * 2) * sigmad),
        f = -1 / (2 * sigmad * sigmad),
        g1 = 1/(Math.sqrt(Math.PI * 2) * sigmar),
        f1 = -1 / (2 * sigmar * sigmar),
        gaussSum = 0.0,
        i, x, y;
    for (i = -radius; i <= 0; i++) {
        gsDFilter[i + radius] = gsDFilter[radius - i] = g * Math.exp(f * i * i);
        gaussSum += (gsDFilter[i + radius] + gsDFilter[radius - i]);
    }
    for (i = 0; i < 256; i++) {
        gsCFilter[i] = gsCFilter[0-i] = g1 * Math.exp(f1 * i * i);
    }

    var idxn = 0, idxt = 0,
        r, k,
        weightr,
        gaussSumr;
    // x方向渐变
    for (y = 0; y < height; y++) {
        for (x = 0; x < width; x++) {
            r = 0;
            idxt = (width * y + x) << 2;
            gaussSumr = 0.0;

            for (i = -radius; i <= radius; i++) {
                k = x+i;
                if (k >= 0 && k < width) {
                    idxn = (width * y + k) << 2;
                    weightr = gsDFilter[i + radius] * gsCFilter[Math.round(data[idxn] - data[idxt])];
                    r += data[idxn] * weightr;
                } else {
                    weightr = gsDFilter[i + radius] * gsCFilter[Math.round(boundaryFillColor - data[idxt])];
                    r += boundaryFillColor * weightr;
                }
                gaussSumr += weightr;
            }
            data[idxt] = r / gaussSumr;
        }
    }
    // y方向渐变
    for (x = 0; x < width; x++) {
        for (y = 0; y < height; y++) {
            r = 0;
            idxt = (width * y + x) << 2;
            gaussSumr = 0.0;
            for (i = -radius; i <= radius; i++) {
                k = y+i;
                if (k >= 0 && k < height) {
                    idxn = (width * k + x) << 2;
                    weightr = gsDFilter[i + radius] * gsCFilter[Math.round(data[idxn] - data[idxt])];
                    r += data[idxn] * weightr;
                } else {
                    weightr = gsDFilter[i + radius] * gsCFilter[Math.round(boundaryFillColor - data[idxt])];
                    r += boundaryFillColor * weightr;
                }
                gaussSumr += weightr;
            }
            data[idxt] = r / gaussSumr;
        }
    }
}

/**
 * rgb->xyz
 * @param  {Array} rgb [r, g, b]
 * @return {Array}     [x, y, z]
 */
function rgb2xyz(rgb) {
    function gamma(x) {
		return x > 0.04045 ? Math.pow(((x + 0.055) / 1.055), 2.4) : (x / 12.92)
	}
    var r = rgb[0] / 255.0,
        g = rgb[1] / 255.0,
        b = rgb[2] / 255.0;

    // sRGB
    r = gamma(r);
    g = gamma(g);
    b = gamma(b);

    var x = (r * 0.4124) + (g * 0.3576) + (b * 0.1805);
    var y = (r * 0.2126) + (g * 0.7152) + (b * 0.0722);
    var z = (r * 0.0193) + (g * 0.1192) + (b * 0.9505);

    return [x * 100, y * 100, z * 100].map(function(num) {
        return Math.round(num);
    });
}

function rgb2lab(rgb) {
    var xyz = rgb2xyz(rgb),
        x = xyz[0],
        y = xyz[1],
        z = xyz[2],
        l, a, b;

    x /= 95.047;
    y /= 100;
    z /= 108.883;

    x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + (16 / 116);
    y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + (16 / 116);
    z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + (16 / 116);

    l = (116 * y) - 16;
    a = 500 * (x - y);
    b = 200 * (y - z);

    return [l, a, b].map(function(num) {
        return Math.round(num);
    });
}

/**
 * lab->xyz->rgb
 * @param  {Array} lab [l, a, b]
 * @return {Array}     [r, g, b]
 */
function lab2rgb(lab) {
    return xyz2rgb(lab2xyz(lab));
}

/**
 * xyz->rgb
 * @param  {Array} xyz [x, y, z]
 * @return {Array}     [r, g, b]
 */
function xyz2rgb(xyz) {
    var x = xyz[0] / 100,
        y = xyz[1] / 100,
        z = xyz[2] / 100,
        r, g, b;

    r = (x * 3.2406) + (y * -1.5372) + (z * -0.4986);
    g = (x * -0.9689) + (y * 1.8758) + (z * 0.0415);
    b = (x * 0.0557) + (y * -0.2040) + (z * 1.0570);

    // assume sRGB
    r = r > 0.0031308 ? ((1.055 * Math.pow(r, 1.0 / 2.4)) - 0.055) : r = (r * 12.92);

    g = g > 0.0031308 ? ((1.055 * Math.pow(g, 1.0 / 2.4)) - 0.055) : g = (g * 12.92);

    b = b > 0.0031308 ? ((1.055 * Math.pow(b, 1.0 / 2.4)) - 0.055) : b = (b * 12.92);

    r = Math.min(Math.max(0, r), 1);
    g = Math.min(Math.max(0, g), 1);
    b = Math.min(Math.max(0, b), 1);

    return [r * 255, g * 255, b * 255].map(function(num) {
        return Math.round(num);
    });
}

/**
 * lab->xyz
 * @param  {Array} lab [l, a, b]
 * @return {Array}     [x, y, z]
 */
function lab2xyz(lab) {
    var l = lab[0],
        a = lab[1],
        b = lab[2],
        x, y, z, y2;

    if (l <= 8) {
        y = (l * 100) / 903.3;
        y2 = (7.787 * (y / 100)) + (16 / 116);
    } else {
        y = 100 * Math.pow((l + 16) / 116, 3);
        y2 = Math.pow(y / 100, 1/3);
    }

    x = x / 95.047 <= 0.008856 ? x = (95.047 * ((a / 500) + y2 - (16 / 116))) / 7.787 : 95.047 * Math.pow((a / 500) + y2, 3);

    z = z / 108.883 <= 0.008859 ? z = (108.883 * (y2 - (b / 200) - (16 / 116))) / 7.787 : 108.883 * Math.pow(y2 - (b / 200), 3);

    return [x, y, z].map(function(num) {
        return Math.round(num);
    });
}

function Canny (data, width, height, highTrash, lowTrash, boundaryFillColor) {
    // 图像灰度化
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            var idx = (width * y + x) << 2;
            var rgb = data[idx]*0.299 + data[idx+1]*0.587 + data[idx+2]*0.114;
            data[idx] = rgb;
            data[idx+1] = rgb;
            data[idx+2] = rgb;
        }
    }

    // 不传参时的默认阀值
    if (!highTrash) {
        highTrash = 100;
    }
    if (!lowTrash) {
        lowTrash = highTrash / 2;
    }
    boundaryFillColor = boundaryFillColor || 127;

    // 高斯平滑
    Gauss(data, width, height, 2, 1.4);

    // x和y方向的一阶偏导核
    var prewittRatioX = [
        -1, 0, 1,
        -1, 0, 1,
        -1, 0, 1
    ],
        prewittRatioY = [
        1,  1,  1,
        0,  0,  0,
        -1, -1, -1
    ];

    var _data = util.copyImageData(data),
        cx = [], cy, p1, p2,
        gradientMatrix = [], tanMatrix = [], gradient,
        idx;

    // 计算边缘梯度
    util.each.xDirection(data, width, 0, 0, width, height, function(i, x, y){
        cx[i] = util.convolution(util.getImageConvolution(_data, width, height, x, y, 0, 1, boundaryFillColor), prewittRatioX, 1, 0);
    });

    util.each.yDirection(data, width, 0, 0, width, height, function(i, x, y){
        cy = util.convolution(util.getImageConvolution(_data, width, height, x, y, 0, 1, boundaryFillColor), prewittRatioY, 1, 0);

        tanMatrix[i] = cx[i] === 0 ? 1000 : cy / cx[i];
        gradientMatrix[i] = Math.round(Math.sqrt(cx[i]*cx[i] + cy*cy));
    });

    _data = util.copyImageData(data);

    // 非极大值抑制
    // 计算四个梯度方向的两侧两个点的梯度值, 保留某梯度方向下的最大梯度点, 其余删除
    util.each.xDirection(data, width, 0, 0, width, height, function(i, x, y) {
        if (x === 0 || x === width-1 || y === 0 || y === height-1) {
            gradientMatrix[i] = 0;
            return data[i] = data[i + 1] = data[i + 2] = 0;
        };
        gradient = Math.floor(4 * Math.atan(tanMatrix[i]) / Math.PI);
        switch ( gradient ) {
            case 0: {
                /**
                 *      p1
                 * p3 c p2
                 * p4
                 */
                p1 = (gradientMatrix[((y-1) * width + x+1) << 2] - gradientMatrix[(y * width + x+1) << 2]) * tanMatrix[i] + gradientMatrix[(y * width + x+1) << 2];
                p2 = (gradientMatrix[((y+1) * width + x-1) << 2] - gradientMatrix[(y * width + x-1) << 2]) * tanMatrix[i] + gradientMatrix[(y * width + x-1) << 2];
                break;
            }
            case 1: {
                /**
                 *    p1 p2
                 *    c
                 * p3 p4
                 */
                p1 = (gradientMatrix[((y-1) * width + x+1) << 2] - gradientMatrix[((y-1) * width + x) << 2]) / tanMatrix[i] + gradientMatrix[((y-1) * width + x) << 2];
                p2 = (gradientMatrix[((y+1) * width + x-1) << 2] - gradientMatrix[((y+1) * width + x) << 2]) / tanMatrix[i] + gradientMatrix[((y+1) * width + x) << 2];
                break;
            }
            case -1: {
                /**
                 * p1 p2
                 *    c
                 *    p3 p4
                 */
                p1 = (gradientMatrix[((y-1) * width + x-1) << 2] - gradientMatrix[((y-1) * width + x) << 2]) * tanMatrix[i] * -1 + gradientMatrix[((y-1) * width + x) << 2];
                p2 = (gradientMatrix[((y+1) * width + x+1) << 2] - gradientMatrix[((y+1) * width + x) << 2]) * tanMatrix[i] * -1 + gradientMatrix[((y+1) * width + x) << 2];
                break;
            }
            case -2: {
                /**
                 * p1
                 * p2 c p3
                 *      p4
                 */
                p1 = (gradientMatrix[((y-1) * width + x-1) << 2] - gradientMatrix[(y * width + x-1) << 2]) / tanMatrix[i] * -1 + gradientMatrix[(y * width + x-1) << 2];
                p2 = (gradientMatrix[(y * width + x+1) << 2] - gradientMatrix[((y+1) * width + x+1) << 2]) / tanMatrix[i] * -1 + gradientMatrix[((y+1) * width + x+1) << 2];
                break;
            }
        }

        if (gradientMatrix[i] > p1 && gradientMatrix[i] > p2) {
            data[i] = data[i+1] = data[i+2] = 255;
        } else {
            data[i] = data[i+1] = data[i+2] = 0;
        }
    });

    // 双阀值检测和连接边缘
    // 遍历上述梯度方向上的最大值点, 保留大于高阀值(highTrash)的点, 去掉低于低阀值(lowTrash)的点,
    // 在两者之间的则寻找周围八个点中, 如果有高于高阀值的就保留
    util.each.xDirection(data, width, 0, 0, width, height, function(i, x, y) {
        gradient = gradientMatrix[i];
        if (data[i] === 0) return;
        if (gradient >= highTrash) {
            data[i] = data[i + 1] = data[i + 2] = 255;
        } else if (gradient < lowTrash){
            data[i] = data[i + 1] = data[i + 2] = 0;
        } else {
            data[i] = data[i + 1] = data[i + 2] = 0;
            var dx = [-1, 0, 1, -1, 1, -1, 0, 1],
                dy = [-1, -1, -1, 0, 0, 1, 1, 1],
                cx, cy, _idx;
            for (var i = 0; i < 8; i++) {
                cx = x + dx[i];
                cy = y + dy[i];
                _idx = (cy * width + cx) << 2;
                if (gradientMatrix[_idx] >= highTrash) {
                    data[i] = data[i + 1] = data[i + 2] = 255;
                }
            };
        }
    });
}

/**
 * 漫画滤镜效果, 整体分为下面几步
 * 多次双边滤波处理->色彩空间转换到lab->在lab上基于l做tanh的锯齿量化处理->色彩空间lab转回rga->DoG描边+Canny描边
 * 由于没能理解原文中的“微分描边”指的是哪种描边方式, 试了试并不能描出文章图中的边, 因此只做了DoG和Canny
 * @param {Array}  imageData   图像数据
 * @param {Number} Qbin   锯齿量化处理的切割宽度
 * @param {Number} q      锯齿量化处理的系数
 */
function Cartoon(imageData, Qbin, q) {
    Qbin = Qbin || 10;
    q = q || 10;
    var lab, rgb, r, g, b, qnearest,
        labArr = [], _data1, _data2;
    var data = imageData.data,
        width = imageData.width,
        height = imageData.height;

    _data2 = util.copyImageData(data);
    _data1 = util.copyImageData(data);
// for (var m = 0; m++ < 8;) {
    // 色彩空间转换 rgb->lab
    util.each.xDirection(data, width, 0, 0, width, height, function(i) {
        r = data[i];
        g = data[i + 1];
        b = data[i + 2];
        lab = rgb2lab([r, g, b]);
        for (var n = 0; n < 3; n++) {
            labArr.push(lab[n]);
        }
        labArr.push(255);
    });

    // 多次双边滤波
    BilateralFilterR(labArr, width, height, 3, 3, 5);

    // 基于lab的l通道做锯齿量化处理, 处理函数为tanh
    util.each.xDirection(labArr, width, 0, 0, width, height, function(i, x, y) {
        qnearest = Math.tanh(q * (Qbin - labArr[i] % Qbin));
        labArr[i] = (Math.floor(labArr[i] / Qbin) + 0.5) * Qbin + qnearest;
    });

    // 色彩空间转回rbg
    util.each.xDirection(data, width, 0, 0, width, height ,function(i, x, y) {
        r = labArr[i];
        g = labArr[i + 1];
        b = labArr[i + 2];
        rgb = lab2rgb([r, g, b]);
        data[i] = rgb[0];
        data[i + 1] = rgb[1];
        data[i + 2] = rgb[2];
    });
    postMessage(imageData);
// }
    

    // DoG + Canny描边
    DoG(_data2, width, height, 3, 3, 1, 0.6);
    util.each.xDirection(data, width, 0, 0, width, height, function(i) {
        if (_data2[i] === 255) {
            data[i] = data[i + 1] = data[i + 2] = 0;
        }
    });
    postMessage(imageData);
    
    Canny(_data1, width, height, 50, 30);
    //
    // // 将描边画到图上
    util.each.xDirection(data, width, 0, 0, width, height, function(i) {
        if (_data1[i] === 255) {
            data[i] = data[i + 1] = data[i + 2] = 0;
        }
    });
    postMessage(imageData);
}

onmessage = (event) => {
    Cartoon(event.data, 10, 15);
};