var util = module.exports = {};

util.keys = function(obj) {
  var k = [], x;
  for (x in obj) k.push(x);
  return k;
};

util.vals = function(obj) {
  var v = [], x;
  for (x in obj) v.push(obj[x]);
  return v;
};

util.range = function(start, stop, step) {
  if (arguments.length < 3) {
    step = 1;
    if (arguments.length < 2) {
      stop = start;
      start = 0;
    }
  }
  if ((stop - start) / step == Infinity) throw new Error('infinite range');
  var range = [], i = -1, j;
  if (step < 0) while ((j = start + step * ++i) > stop) range.push(j);
  else while ((j = start + step * ++i) < stop) range.push(j);
  return range;
};

util.find = function(list, pattern) {
  var l = list.filter(function(x) {
    return x[pattern.name] === pattern.value;
  });
  return l.length && l[0] || null;
};

util.uniq = function(data, field) {
  var map = {}, count = 0, i, k;
  for (i = 0; i < data.length; ++i) {
    k = data[i][field];
    if (!map[k]) {
      map[k] = 1;
      count += 1;
    }
  }
  return count;
};

var isNumber = function(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

var numbers = function(values) {
  var nums = [];
  for (var i = 0; i < values.length; i++) {
    if (isNumber(values[i])) {
      nums.push(+values[i]);
    }
  }
  return nums;
}

var median = function(values) {
  values.sort(function(a, b) {return a - b;});
  var half = Math.floor(values.length/2);
  if (values.length % 2) {
    return values[half];
  } else {
    return (values[half-1] + values[half]) / 2.0;
  }
}

var mean = function(values) {
  return values.reduce(function(v, r) {return v + r;}, 0) / values.length;
}

var variance = function(values) {
  var avg = mean(values);
  var diffs = [];
  for (var i = 0; i < values.length; i++) {
    diffs.push(Math.pow((values[i] - avg), 2));
  }
  return mean(diffs);
}

var stdev = function(values) {
  return Math.sqrt(variance(values));
}

util.skew = function(values) {
  values = numbers(values);
  var avg = mean(values),
    med = median(values),
    std = stdev(values);
  return 1.0 * (avg - med) / std;
}

util.minmax = function(data, field, excludeNulls) {
  var excludeNulls = excludeNulls === undefined ? false : excludeNulls;
  var stats = {min: +Infinity, max: -Infinity};
  for (i = 0; i < data.length; ++i) {
    var v = data[i][field];
    if (excludeNulls && v === null)
      continue;
    if (v > stats.max) stats.max = v;
    if (v < stats.min) stats.min = v;
  }
  return stats;
};

util.duplicate = function(obj) {
  return JSON.parse(JSON.stringify(obj));
};

util.any = function(arr, f) {
  var i = 0, k;
  for (k in arr) {
    if (f(arr[k], k, i++)) return true;
  }
  return false;
};

util.all = function(arr, f) {
  var i = 0, k;
  for (k in arr) {
    if (!f(arr[k], k, i++)) return false;
  }
  return true;
};

util.merge = function(dest, src) {
  return util.keys(src).reduce(function(c, k) {
    c[k] = src[k];
    return c;
  }, dest);
};

util.getbins = function(stats, maxbins) {
  return vg.bins({
    min: stats.min,
    max: stats.max,
    maxbins: maxbins
  });
};

/**
 * x[p[0]]...[p[n]] = val
 * @param noaugment determine whether new object should be added f
 * or non-existing properties along the path
 */
util.setter = function(x, p, val, noaugment) {
  for (var i=0; i<p.length-1; ++i) {
    if (!noaugment && !(p[i] in x)){
      x = x[p[i]] = {};
    } else {
      x = x[p[i]];
    }
  }
  x[p[i]] = val;
};


/**
 * returns x[p[0]]...[p[n]]
 * @param augment determine whether new object should be added f
 * or non-existing properties along the path
 */
util.getter = function(x, p, noaugment) {
  for (var i=0; i<p.length; ++i) {
    if (!noaugment && !(p[i] in x)){
      x = x[p[i]] = {};
    } else {
      x = x[p[i]];
    }
  }
  return x;
};

util.truncate = function(s, length, pos, word, ellipsis) {
  var len = s.length;
  if (len <= length) return s;
  ellipsis = ellipsis || "...";
  var l = Math.max(0, length - ellipsis.length);

  switch (pos) {
    case "left":
      return ellipsis + (word ? vg_truncateOnWord(s,l,1) : s.slice(len-l));
    case "middle":
    case "center":
      var l1 = Math.ceil(l/2), l2 = Math.floor(l/2);
      return (word ? vg_truncateOnWord(s,l1) : s.slice(0,l1)) + ellipsis +
        (word ? vg_truncateOnWord(s,l2,1) : s.slice(len-l2));
    default:
      return (word ? vg_truncateOnWord(s,l) : s.slice(0,l)) + ellipsis;
  }
};

util.error = function(msg) {
  console.error('[VL Error]', msg);
};

