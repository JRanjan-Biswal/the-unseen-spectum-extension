/**
 * Color Blindness Simulation for Chrome Extension
 * Based on work by bluwy: https://github.com/bluwy/colorblind/tree/master
 */

// Matrix data for different types of color blindness
const protanopia = [
    0.0, 1.05118294, -0.05116099,
    0.0, 1.0, 0.0,
    0.0, 0.0, 1.0,
];

const deuteranopia = [
    1.0, 0.0, 0.0,
    0.9513092, 0.0, 0.04866992,
    0.0, 0.0, 1.0,
];

const tritanopia = [
    1.0, 0.0, 0.0,
    0.0, 1.0, 0.0,
    -0.86744736, 1.86727089, 0.0,
];

const achromatopsia = [
    0.212656, 0.715158, 0.072186,
];

// Utility functions for color conversion
const rgbToLmsMatrix = [
    0.31399022, 0.63951294, 0.04649755,
    0.15537241, 0.75789446, 0.08670142,
    0.01775239, 0.10944209, 0.87256922,
];

const lmsToRgbMatrix = [
    5.47221206, -4.6419601, 0.16963708,
    -1.1252419, 2.29317094, -0.1678952,
    0.02980165, -0.19318073, 1.16364789,
];

function multiplyMatrix3x3And3x1(a, b) {
    return [
        a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
        a[3] * b[0] + a[4] * b[1] + a[5] * b[2],
        a[6] * b[0] + a[7] * b[1] + a[8] * b[2],
    ];
}

function multiplyMatrix3x1And3x1(a, b) {
    return [a[0] * b[0] + a[1] * b[1] + a[2] * b[2]];
}

function convertRgbToLms(rgb) {
    const rgbMatrix = convertRgbToMatrix(rgb);
    const lmsMatrix = multiplyMatrix3x3And3x1(rgbToLmsMatrix, rgbMatrix);
    const lms = convertMatrixToLms(lmsMatrix);
    return lms;
}

function convertLmsToRgb(lms) {
    const lmsMatrix = convertLmsToMatrix(lms);
    const rgbMatrix = multiplyMatrix3x3And3x1(lmsToRgbMatrix, lmsMatrix);
    const rgb = convertMatrixToRgb(rgbMatrix);
    return rgb;
}

function convertRgbToMatrix(rgb) {
    return [rgb.r / 255, rgb.g / 255, rgb.b / 255];
}

function convertLmsToMatrix(lms) {
    return [lms.l, lms.m, lms.s];
}

function convertMatrixToRgb(m) {
    return { r: m[0] * 255, g: m[1] * 255, b: m[2] * 255 };
}

function convertMatrixToLms(m) {
    return { l: m[0], m: m[1], s: m[2] };
}

function sanitizeRgb(rgb) {
    return {
        r: sanitizeRgbProperty(rgb.r),
        g: sanitizeRgbProperty(rgb.g),
        b: sanitizeRgbProperty(rgb.b),
    };
}

function sanitizeRgbProperty(v) {
    return Math.round(Math.min(Math.max(v, 0), 255));
}

// Helper function to parse RGB color strings
function parseRgbColor(colorString) {
    if (!colorString || colorString === 'rgba(0, 0, 0, 0)' || colorString === 'transparent') {
        return { r: 0, g: 0, b: 0 };
    }

    const match = colorString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
        return {
            r: parseInt(match[1]),
            g: parseInt(match[2]),
            b: parseInt(match[3])
        };
    }

    // Handle rgba format
    const rgbaMatch = colorString.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
    if (rgbaMatch) {
        return {
            r: parseInt(rgbaMatch[1]),
            g: parseInt(rgbaMatch[2]),
            b: parseInt(rgbaMatch[3])
        };
    }

    return { r: 0, g: 0, b: 0 };
}

// Helper function to parse linear gradient strings
function parseLinearGradient(gradientString) {
    if (!gradientString || !gradientString.includes('linear-gradient')) {
        return null;
    }

    // Extract the gradient content
    const gradientMatch = gradientString.match(/linear-gradient\(([^)]+)\)/);
    if (!gradientMatch) {
        return null;
    }

    const gradientContent = gradientMatch[1];

    // Parse direction and color stops
    const parts = gradientContent.split(',');
    const direction = parts[0].trim();
    const colorStops = parts.slice(1).map(stop => stop.trim());

    return {
        direction: direction,
        colorStops: colorStops
    };
}

// Helper function to parse color stop strings
function parseColorStop(colorStopString) {
    // Handle percentage positions
    const percentageMatch = colorStopString.match(/^(.+?)\s+(\d+%)$/);
    if (percentageMatch) {
        return {
            color: percentageMatch[1].trim(),
            position: percentageMatch[2]
        };
    }

    // Handle pixel positions
    const pixelMatch = colorStopString.match(/^(.+?)\s+(\d+px)$/);
    if (pixelMatch) {
        return {
            color: pixelMatch[1].trim(),
            position: pixelMatch[2]
        };
    }

    // No position specified
    return {
        color: colorStopString,
        position: null
    };
}

// Helper function to simulate gradient colors
function simulateGradientColors(gradient, deficiency) {
    if (!gradient) {
        return null;
    }

    const simulatedColorStops = gradient.colorStops.map(colorStopString => {
        const colorStop = parseColorStop(colorStopString);
        const rgb = parseRgbColor(colorStop.color);

        // Only simulate if it's a valid RGB color
        if (rgb.r !== 0 || rgb.g !== 0 || rgb.b !== 0) {
            const simulatedRgb = simulatedColor(rgb, deficiency);
            const simulatedColorString = `rgb(${simulatedRgb.r}, ${simulatedRgb.g}, ${simulatedRgb.b})`;

            return colorStop.position ?
                `${simulatedColorString} ${colorStop.position}` :
                simulatedColorString;
        }

        return colorStopString;
    });

    return {
        direction: gradient.direction,
        colorStops: simulatedColorStops
    };
}

// Helper function to reconstruct gradient string
function reconstructGradient(simulatedGradient) {
    if (!simulatedGradient) {
        return null;
    }

    const colorStopsString = simulatedGradient.colorStops.join(', ');
    return `linear-gradient(${simulatedGradient.direction}, ${colorStopsString})`;
}

function simulatedColor(rgb, deficiency) {
    switch (deficiency) {
        case 'protanopia':
            return Dichromatic(rgb, protanopia);
        case 'deuteranopia':
            return Dichromatic(rgb, deuteranopia);
        case 'tritanopia':
            return Dichromatic(rgb, tritanopia);
        case 'achromatopsia':
            return Monochromatic(rgb, achromatopsia);
        default:
            throw new Error('Invalid color deficiency provided');
    }
}

function Dichromatic(rgb, simMatrix) {
    const lms = convertRgbToLms(sanitizeRgb(rgb));
    const lmsMatrix = convertLmsToMatrix(lms);
    const simLmsMatrix = multiplyMatrix3x3And3x1(simMatrix, lmsMatrix);
    const simLms = convertMatrixToLms(simLmsMatrix);
    const simRgb = convertLmsToRgb(simLms);
    return sanitizeRgb(simRgb);
}

function Monochromatic(rgb, simMatrix) {
    const rgbMatrix = convertRgbToMatrix(sanitizeRgb(rgb));
    const simRgbValue = multiplyMatrix3x1And3x1(rgbMatrix, simMatrix)[0];
    const simRgbMetrix = Array(3).fill(simRgbValue);
    const simRgb = convertMatrixToRgb(simRgbMetrix);
    return sanitizeRgb(simRgb);
}

// Store original colors for cleanup
const originalColors = new Map();

// Main color blindness simulation function
function colorBlindnessSimulation(el, deficiency) {
    const computedStyle = getComputedStyle(el);

    // Get various color properties
    const textColor = computedStyle.color;
    const backgroundColor = computedStyle.backgroundColor;
    const borderColor = computedStyle.borderColor;
    const backgroundImage = computedStyle.backgroundImage;
    const boxShadow = computedStyle.boxShadow;

    // Store original colors if not already stored
    if (!originalColors.has(el)) {
        originalColors.set(el, {
            color: el.style.color || '',
            backgroundColor: el.style.backgroundColor || '',
            borderColor: el.style.borderColor || '',
            backgroundImage: el.style.backgroundImage || '',
            boxShadow: el.style.boxShadow || ''
        });
    }

    // Parse and simulate colors
    const textRgb = parseRgbColor(textColor);
    const backgroundRgb = parseRgbColor(backgroundColor);
    const borderRgb = parseRgbColor(borderColor);
    const boxShadowRgb = parseRgbColor(boxShadow);

    if (el === document.body) {
        console.log('textRgb', textRgb, el.style.color);
        console.log('backgroundRgb', backgroundRgb, el.style.backgroundColor);
        console.log('borderRgb', borderRgb, el.style.borderColor);
        console.log('boxShadowRgb', boxShadowRgb, el.style.boxShadow);
    }

    // Apply color blindness simulation to text color
    if (textRgb.r !== 0 || textRgb.g !== 0 || textRgb.b !== 0) {
        const simulatedTextColor = simulatedColor(textRgb, deficiency);
        el.style.color = `rgb(${simulatedTextColor.r}, ${simulatedTextColor.g}, ${simulatedTextColor.b})`;
    }

    // Apply color blindness simulation to background color
    if (backgroundRgb.r !== 0 || backgroundRgb.g !== 0 || backgroundRgb.b !== 0) {
        const simulatedBackgroundColor = simulatedColor(backgroundRgb, deficiency);
        el.style.backgroundColor = `rgb(${simulatedBackgroundColor.r}, ${simulatedBackgroundColor.g}, ${simulatedBackgroundColor.b})`;
    }

    // Apply color blindness simulation to border color
    if (borderRgb.r !== 0 || borderRgb.g !== 0 || borderRgb.b !== 0) {
        const simulatedBorderColor = simulatedColor(borderRgb, deficiency);
        el.style.borderColor = `rgb(${simulatedBorderColor.r}, ${simulatedBorderColor.g}, ${simulatedBorderColor.b})`;
    }

    // Apply color blindness simulation to box-shadow
    console.log('boxShadowRgb', boxShadowRgb, el.style.boxShadow);

    // Handle linear gradients in background-image
    if (backgroundImage && backgroundImage.includes('linear-gradient')) {
        const gradient = parseLinearGradient(backgroundImage);
        if (gradient) {
            const simulatedGradient = simulateGradientColors(gradient, deficiency);
            if (simulatedGradient) {
                const reconstructedGradient = reconstructGradient(simulatedGradient);
                if (reconstructedGradient) {
                    el.style.backgroundImage = reconstructedGradient;
                }
            }
        }
    }
}

// Function to restore original colors
function restoreOriginalColors() {
    console.log('Restoring original colors for', originalColors.size, 'elements');

    originalColors.forEach((originalStyle, element) => {
        if (element && element.style) {
            element.style.color = originalStyle.color;
            element.style.backgroundColor = originalStyle.backgroundColor;
            element.style.borderColor = originalStyle.borderColor;
            element.style.backgroundImage = originalStyle.backgroundImage;
        }
    });

    // Clear the stored colors
    originalColors.clear();
    console.log('Original colors restored and cache cleared');
}

// Make the functions available globally for Chrome extension
window.colorBlindnessSimulation = colorBlindnessSimulation;
window.restoreOriginalColors = restoreOriginalColors;
