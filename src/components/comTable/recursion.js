export const fn = function (value) {
  if (Object.prototype.toString.call(value) === "[object Object]") {
    for (let i in value) {
      if (
        Object.prototype.toString.call(value[i]) === "[object Object]" ||
        Object.prototype.toString.call(value[i]) === "[object Array]"
      ) {
        fn(value[i]);
      }
      if (!value[i] || value[i] === "-") {
        value[i] = "—";
      }
    }
  } else if (Object.prototype.toString.call(value) === "[object Array]") {
    for (let j = 0; j < value.length; j++) {
      if (
        Object.prototype.toString.call(value[j]) === "[object Object]" ||
        Object.prototype.toString.call(value[j]) === "[object Array]"
      ) {
        fn(value[j]);
      }
      if (!value[j] || value[j] === "-") {
        value[j] = "—";
      }
    }
  }
};
