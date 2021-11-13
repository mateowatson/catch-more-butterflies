export const cmb_random = function(min = 0, max = 0) {
    var delta = max - min;
    return Math.round(min + Math.random() * delta);
};