let $seed = 0;

function $srand(seed) {
  $seed = seed || 0;
}

function $rand() {
  $seed = ($seed * 9301 + 49297) % 233280;
  return $seed / 233280.0;
}

function $randint(min, max) {
  max = max || 1;
  min = min || 0;
  return Math.floor($rand() * (max - min + 1)) + min;
}

function shuffle(array) {
  let len = array.length;
  for (let i = len - 1; i > 0; i--) {
    let j = Math.floor($rand() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

const opset = ['+', '-', '*', '/', '²', '√', 'sin', 'cos', 'tan'];
const COE = [1, 2, 3, 5, 7, 11];

function getPriority(item) {
  if (typeof item !== 'string')
    return 0;
  else if (item === '+' || item === '-')
    return 3;
  else if (item === '*' || item === '/')
    return 2;
  else
    return 1;
}

function getSuffix(level) {
  if (typeof level !== 'number' || isNaN(level))
    return null;

  var length = $randint(level == 0 ? 1 : 0, 4);
  var op2Arr = Array.apply(null, { length: length }).map(() => opset[$randint(0, 3)]);
  var numArr = Array.apply(null, { length: length + 1 }).map(() => $randint(1, 100));

  var remain = 1;
  var position = [];
  var i, j;
  for (i = 0; i < length; i++) {
    position.push($randint(0, remain));
    remain += 1 - position[i];
  }
  if (remain > 1)
    position[position.length - 1] += remain - 1;

  var op1Arr = [];
  if (level != 0) {
    if (level == 1)
      op1Arr.push(opset[$randint(4, 5)]);
    else if (level == 2)
      op1Arr.push(opset[$randint(6, 8)]);
    var len = $randint(0, level);
    for (i = 0; i < len; i++) {
      op1Arr.push(opset[$randint(4, level == 1 ? 5 : 8)]);
    }
    shuffle(op1Arr);
  }

  var expression = numArr;
  var offset = 2;
  var index = 0;
  for (i = 0; i < length; i++) {
    for (j = 0; j < position[i]; j++) {
      expression.splice(i + j + offset, 0, op2Arr[index]);
      index += 1;
    }
    offset += position[i];
  }
  op1Arr.forEach((op) => {
    expression.splice($randint(1, expression.length), 0, op);
  });
  return expression;
}

function suffix2infix(expression) {
  var stack = [];
  expression.forEach((e) => {
    var item1, item2, prio1, prio2, val1, val2;
    var priority = getPriority(e);
    switch (priority) {
      case 0:
        stack.push([e, 0, e]);
        break;
      case 3:
        [item2, prio2, val2] = stack.pop();
        [item1, prio1, val1] = stack.pop();

        if (e === '+')
          val1 += val2;
        else if (e === '-') {
          if (prio2 >= 3)
            item2 = `(${item2})`;
          val1 -= val2;
        }

        stack.push([`${item1}${e}${item2}`, 3, val1]);
        break;
      case 2:
        [item2, prio2, val2] = stack.pop();
        [item1, prio1, val1] = stack.pop();

        if (e === '*') {
          if (prio2 == 3)
            item2 = `(${item2})`;
          if (prio1 == 3)
            item1 = `(${item1})`;
          val1 *= val2;
        } else if (e === '/') {
          if (prio2 >= 2)
            item2 = `(${item2})`;
          if (prio1 == 3)
            item1 = `(${item1})`;
          val1 /= val2;
        }
        if (!isFinite(val1))
          throw new Error('wrong number')

        stack.push([`${item1}${e}${item2}`, 2, val1]);
        break;
      case 1:
        [item1, prio1, val1] = stack.pop();

        if (e === '²')
          val1 *= val1;
        else if (e === '√')
          val1 = Math.sqrt(val1);
        else if (e === 'sin')
          val1 = Math.sin(val1);
        else if (e === 'cos')
          val1 = Math.cos(val1);
        else if (e === 'tan')
          val1 = Math.tan(val1);

        if (!isFinite(val1))
          throw new Error('wrong number')

        if (prio1 != 0)
          item1 = `(${item1})`;

        if (e === '²')
          stack.push([`${item1}${e}`, 1, val1]);
        else
          stack.push([`${e}${item1}`, 1, val1]);
        break;
    }
  });
  return [stack[0][0], stack[0][2]];
}

function getInfix(level) {
  return suffix2infix(getSuffix(level));
}

function getPaper(paperMeta) {
  var paperData = []
  $srand(paperMeta.seed);
  let set = new Set();
  for (var i = 0; i < paperMeta.number; i++) {
    var tmp = null;
    while (!tmp) {
      try {
        tmp = getInfix(paperMeta.difficulty);
        if (set.has(tmp[0])) tmp = null;
        else set.add(tmp[0]);
      } catch (error) {
        tmp = null;
      }
    }
    var offset = $randint(-5, 5);
    var coe = 0;
    if (Math.floor(tmp[1]) == tmp[1]) coe = COE[$randint(0, 5)];
    else coe = $rand();
    var ans = Array.apply(null, { length: 10 }).map(
      (v, i) => tmp[1] + (i + offset) * coe
    );
    shuffle(ans);
    ans.splice(4);
    if (!ans.includes(tmp[1]))
      ans.splice(3, 1, tmp[1]);
    shuffle(ans);
    paperData.push({
      id: i,
      data: tmp[0],
      answer: tmp[1],
      options: ans,
      selected: null,
    });
  }
  return paperData;
}

export default {
  getPaper
}