const COLORS_BY_NAME = {
    aliceblue: "#f0f8ff",
    antiquewhite: "#faebd7",
    aqua: "#00ffff",
    aquamarine: "#7fffd4",
    azure: "#f0ffff",
    beige: "#f5f5dc",
    bisque: "#ffe4c4",
    black: "#000000",
    blanchedalmond: "#ffebcd",
    blue: "#0000ff",
    blueviolet: "#8a2be2",
    brown: "#a52a2a",
    burlywood: "#deb887",
    cadetblue: "#5f9ea0",
    chartreuse: "#7fff00",
    chocolate: "#d2691e",
    coral: "#ff7f50",
    cornflowerblue: "#6495ed",
    cornsilk: "#fff8dc",
    crimson: "#dc143c",
    cyan: "#00ffff",
    darkblue: "#00008b",
    darkcyan: "#008b8b",
    darkgoldenrod: "#b8860b",
    darkgray: "#a9a9a9",
    darkgreen: "#006400",
    darkkhaki: "#bdb76b",
    darkmagenta: "#8b008b",
    darkolivegreen: "#556b2f",
    darkorange: "#ff8c00",
    darkorchid: "#9932cc",
    darkred: "#8b0000",
    darksalmon: "#e9967a",
    darkseagreen: "#8fbc8f",
    darkslateblue: "#483d8b",
    darkslategray: "#2f4f4f",
    darkturquoise: "#00ced1",
    darkviolet: "#9400d3",
    deeppink: "#ff1493",
    deepskyblue: "#00bfff",
    dimgray: "#696969",
    dodgerblue: "#1e90ff",
    firebrick: "#b22222",
    floralwhite: "#fffaf0",
    forestgreen: "#228b22",
    fuchsia: "#ff00ff",
    gainsboro: "#dcdcdc",
    ghostwhite: "#f8f8ff",
    gold: "#ffd700",
    goldenrod: "#daa520",
    gray: "#808080",
    green: "#008000",
    greenyellow: "#adff2f",
    honeydew: "#f0fff0",
    hotpink: "#ff69b4",
    indianred: "#cd5c5c",
    indigo: "#4b0082",
    ivory: "#fffff0",
    khaki: "#f0e68c",
    lavender: "#e6e6fa",
    lavenderblush: "#fff0f5",
    lawngreen: "#7cfc00",
    lemonchiffon: "#fffacd",
    lightblue: "#add8e6",
    lightcoral: "#f08080",
    lightcyan: "#e0ffff",
    lightgoldenrodyellow: "#fafad2",
    lightgray: "#d3d3d3",
    lightgreen: "#90ee90",
    lightpink: "#ffb6c1",
    lightsalmon: "#ffa07a",
    lightseagreen: "#20b2aa",
    lightskyblue: "#87cefa",
    lightslategray: "#778899",
    lightsteelblue: "#b0c4de",
    lightyellow: "#ffffe0",
    lime: "#00ff00",
    limegreen: "#32cd32",
    linen: "#faf0e6",
    magenta: "#ff00ff",
    maroon: "#800000",
    mediumaquamarine: "#66cdaa",
    mediumblue: "#0000cd",
    mediumorchid: "#ba55d3",
    mediumpurple: "#9370db",
    mediumseagreen: "#3cb371",
    mediumslateblue: "#7b68ee",
    mediumspringgreen: "#00fa9a",
    mediumturquoise: "#48d1cc",
    mediumvioletred: "#c71585",
    midnightblue: "#191970",
    mintcream: "#f5fffa",
    mistyrose: "#ffe4e1",
    moccasin: "#ffe4b5",
    navajowhite: "#ffdead",
    navy: "#000080",
    oldlace: "#fdf5e6",
    olive: "#808000",
    olivedrab: "#6b8e23",
    orange: "#ffa500",
    orangered: "#ff4500",
    orchid: "#da70d6",
    palegoldenrod: "#eee8aa",
    palegreen: "#98fb98",
    paleturquoise: "#afeeee",
    palevioletred: "#db7093",
    papayawhip: "#ffefd5",
    peachpuff: "#ffdab9",
    peru: "#cd853f",
    pink: "#ffc0cb",
    plum: "#dda0dd",
    powderblue: "#b0e0e6",
    purple: "#800080",
    red: "#ff0000",
    rosybrown: "#bc8f8f",
    royalblue: "#4169e1",
    saddlebrown: "#8b4513",
    salmon: "#fa8072",
    sandybrown: "#f4a460",
    seagreen: "#2e8b57",
    seashell: "#fff5ee",
    sienna: "#a0522d",
    silver: "#c0c0c0",
    skyblue: "#87ceeb",
    slateblue: "#6a5acd",
    slategray: "#708090",
    snow: "#fffafa",
    springgreen: "#00ff7f",
    steelblue: "#4682b4",
    tan: "#d2b48c",
    teal: "#008080",
    thistle: "#d8bfd8",
    tomato: "#ff6347",
    turquoise: "#40e0d0",
    violet: "#ee82ee",
    wheat: "#f5deb3",
    white: "#ffffff",
    whitesmoke: "#f5f5f5",
    yellow: "#ffff00",
    yellowgreen: "#9acd32"
};

/*
 * This class contains methods for operating with colors. Its objects are kept in hsva format with normalized
 * attributes (each attribute has value between 0 and 1 inclusive), and can be converted from/to rgba.
 */
class Color {
    constructor(color) {
        if (color) {
            this.setColor(color);
        }
    }

    setColor(color) {
        this.color = this.constructor.parseColor(color);
    }

    getColor() {
        let rgba = this.getRgba();
        return `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${rgba[3]})`;
    }

    /*
     * @param color A color string of the types: native name, hex3, hex6, rgb, rgba, hsl, hsla
     *              or a Color object, or a hsla color array
     */
    static parseColor(color) {
        if (color instanceof Color) {
            return color.color;
        } else if (color instanceof Array) {
            // Add the alpha parameter at the end
            if (color.length === 3) {
                color.push(1);
            }
            return color;
        }

        color = color.trim().toLowerCase();

        // Check if color is given by name
        if (COLORS_BY_NAME.hasOwnProperty(color)) {
            color = COLORS_BY_NAME[color];
        }

        let values = [];

        // Check for hex3 (e.g. "#f00")
        let hex3 = color.match(/^#([0-9a-f]{3})$/i);
        if (hex3) {
            values = [
                parseInt(hex3[1].charAt(0), 16) * 0x11,
                parseInt(hex3[1].charAt(1), 16) * 0x11,
                parseInt(hex3[1].charAt(2), 16) * 0x11,
                1
            ];
        }

        // Check for hex6 (e.g. "#ff0000")
        let hex6 = color.match(/^#([0-9a-f]{6})$/i);
        if (hex6) {
            values = [
                parseInt(hex6[1].substr(0, 2), 16),
                parseInt(hex6[1].substr(2, 2), 16),
                parseInt(hex6[1].substr(4, 2), 16),
                1
            ];
        }

        // Check for rgba (e.g. "rgba(255, 0, 0, 0.5)")
        let rgba = color.match(/^rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+.*\d*)\s*\)$/i);
        if (rgba) {
            values = [
                parseInt(rgba[1]),
                parseInt(rgba[2]),
                parseInt(rgba[3]),
                parseFloat(rgba[4])
            ];
        }

        // Check for rgb (e.g. "rgb(255, 0, 0)")
        let rgb = color.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
        if (rgb) {
            values = [
                parseInt(rgb[1]),
                parseInt(rgb[2]),
                parseInt(rgb[3]),
                1
            ];
        }
/*
        // Check for hsl (e.g. "hsl(360, 100%, 50%)"
        let hsl = color.match(/^hsl\s*\(\s*(\d+)\s*,\s*(\d+)\s*%\s*,\s*(\d+)\s*%\s*\)$/i);
        if (hsl) {
            values = this.constructor.hslaToRgba(...hsl.slice(1));
        }

        // Check for hsla (e.g. "hsla(360, 100%, 50%, 0.5)"
        let hsla = color.match(/^hsla\s*\(\s*(\d+)\s*,\s*(\d+)\s*%\s*,\s*(\d+)\s*%\s*,\s*(\d+.*\d*)\s*\)$/i);
        if (hsla) {
            values = this.constructor.hslaToRgba(...hsla.slice(1));
        }
*/
        return values;
    }
/*
    static hsvaToRgba(h, s, v, a = 1) {
        let r, g, b, i, f, p, q, t;
        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), a];
    }

    static rgbaToHsva(r, g, b, a = 1) {
        let max = Math.max(r, g, b);
        let min = Math.min(r, g, b);
        let diff = max - min;
        let s = (max === 0 ? 0 : diff / max);
        let v = max / 255;
        let h;

        switch (max) {
            case min: h = 0; break;
            case r: h = (g - b) + diff * (g < b ? 6: 0); h /= 6 * diff; break;
            case g: h = (b - r) + diff * 2; h /= 6 * diff; break;
            case b: h = (r - g) + diff * 4; h /= 6 * diff; break;
        }

        return [h, s, v, a];
    }

    static hslaToRgba(h, s, l, a = 1) {
        h /= 360; s /= 100; l /= 100;

        let r, g, b;

        if(s == 0){
            r = g = b = l; // achromatic
        }else{
            let hueToRgb = (p, q, t) => {
                if(t < 0) {
                    t += 1;
                } else if(t > 1) {
                    t -= 1;
                }

                if (t < 1/6) {
                    return p + (q - p) * 6 * t;
                } else if (t < 1/2) {
                    return q;
                } else if (t < 2/3) {
                    return p + (q - p) * (2/3 - t) * 6;
                } else {
                    return p;
                }
            };

            let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            let p = 2 * l - q;
            r = hueToRgb(p, q, h + 1/3);
            g = hueToRgb(p, q, h);
            b = hueToRgb(p, q, h - 1/3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), a];
    }

    static rgbaToHsla(r, g, b, a = 1) {
        r /= 255, g /= 255, b /= 255;

        let max = Math.max(r, g, b);
        let min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max == min) {
            h = s = 0; // achromatic
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0); break;
                case g:
                    h = (b - r) / d + 2; break;
                case b:
                    h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return [h, s, l, a];
    }
*/

    // TODO: this should be implemented as a factory that generates an interpolator object, that just takes in a t
    static interpolate(firstColor, secondColor, t = 0.5) {
        let firstColorArray = Color.parseColor(firstColor);
        let secondColorArray = Color.parseColor(secondColor);

        return Color.convertToRgba([
            parseInt(firstColorArray[0] * (1 - t) + secondColorArray[0] * t),
            parseInt(firstColorArray[1] * (1 - t) + secondColorArray[1] * t),
            parseInt(firstColorArray[2] * (1 - t) + secondColorArray[2] * t),
            parseInt(firstColorArray[3] * (1 - t) + secondColorArray[3] * t)
        ]);
    }

    static convertToRgba(rgba) {
        return `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${rgba[3]})`;
    }

    static isLight(color) {
        let values = Color.parseColor(color);
        return values[0] * 0.3 + values[1] * 0.59 + values[2] * 0.11 > 188;
    }

/*
    setRgba(value, index = -1) {
        if (index !== -1) {
            let rgba = this.getRgba();
            rgba[index] = value;
            this.color = rgba;
        } else {
            this.color = Color.rgbaToHsva(...value);
        }
    }

    getRgba() {
        return Color.hsvaToRgba(this.color);
    }

    addRgba(amount, index = -1) {
        let rgba = Color.hsvaToRgba(this.color);
        let setInRange = (rgba) => {
            for (let i = 0; i < 3; i += 1) {
                if (rgba[i] > 255) {
                    rgba[i] = 255;
                } else if (rgba[i] < 0) {
                    rgba[i] = 0;
                }
            }
            if (rgba[3] > 1) {
                rgba[3] = 1;
            } else if (rgba[3] < 0){
                rgba[3] = 0;
            }
        };
        if (index !== -1) {
            rgba[index] += amount;
        } else {
            if (amount.length === 3) {
                amount.push(0);
            }
            for (let i  = 0; i < 4; i += 1) {
                rgba[i] += amount[i];
            }
        }
        setInRange(rgba);
        this.setRgba(rgba);
    }

    setHsva(value, index = -1) {
        if (index !== -1) {
            this.color[index] = value;
        } else {
            this.color = value;
        }
    }

    getHsva() {
        return this.color;
    }

    addHsva(amount, index = -1) {
        let hsva = this.color;
        let setInrange = (hsva) => {
            if (hsva[0] > 1) {
                hsva[0] -= 1;
            } else if (hsva[0] < 0) {
                hsva[0] += 1;
            }
            for (let i = 1; i < 4; i += 1) {
                if (hsva[i] > 1) {
                    hsva[i] = 1;
                } else if (hsva[i] < 0) {
                    hsva[i] = 0;
                }
            }
        };
        if (index !== -1) {
            hsva[index] += amount
        }
        if (hsva.length === 3) {
            hsva.push(1);
        }
        if (amount.length === 3) {
            amount.push(0);
        }
        hsva[0] += amount[0];
        if (hsva[0] > 1) {
            hsva[0] -= 1;
        } else if (hsva[0] < 0) {
            hsva[0] += 1;
        }
        for (let i = 1; i < 4; i += 1) {
            hsva[i] += amount[i];
            if (hsva[i] < 0) {
                hsva[i] = 0;
            } else if (hsva[i] > 1) {
                hsva[i] = 1;
            }
        }
        this.color = hsva;
    }
*/
}

function lighten(color, amount) {
    if (amount >= 0) {
        return Color.interpolate(color, "#fff", amount);
    } else {
        return darken(color, -amount);
    }
};

function darken(color, amount) {
    if (amount >= 0) {
        let rgba = Color.parseColor(Color.interpolate(color, "#000", amount));
        for (let i = 0; i < 3; i += 1) {
            let root = Math.pow(255 - rgba[i], 0.7);
            rgba[i] = parseInt(rgba[i] - root * amount);
            if (rgba[i] < 0) {
                rgba[i] = 0;
            }
        }
        return Color.convertToRgba(rgba);
    } else {
        return lighten(color, -amount);
    }
};

function buildColors(color) {
    let colors = [];
    let darkenPercents;
    if (Color.isLight(color)) {
        darkenPercents = [0.05, 0, 0.05, 0.1, 0.15, 0.3, 0.8];
    } else {
        darkenPercents = [-0.3, 0, 0.1, 0.2, 0.23, 0.1, -1];
    }
    for (let i = 0; i < darkenPercents.length; i += 1) {
        colors.push(darken(color, darkenPercents[i]));
    }
    return colors;
}

export {Color, lighten, darken, buildColors};
