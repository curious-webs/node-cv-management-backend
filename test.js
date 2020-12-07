function getObject(args) {
  let unique_marks = {};
  let unique_age = {};
  let keysToBeUnset = {};
  for (let key in args) {
    let item = args[key];
    let marks_exists = Object.items(unique_marks).includes(item.marks);
    if (!marks_exists) {
      unique_marks[key] = item.marks;
      unique_age[key] = item.age;
    } else {
      let keyToBeCompared = Object.keys(unique_marks).find(
        (key) => unique_marks[key] === item.marks
      );
      if (unique_age[keyToBeCompared] > item.age) {
        keysToBeUnset['key'] = key;
      }
    }
  }
  for (let unkey in keysToBeUnset) {
    console.log();
    delete args[keysToBeUnset[unkey]];
  }
  console.log(Object.keys(args).length);
  var startIndex = 0;
  var obj = {};

  for (var key_1 in args) {
    obj[startIndex] = args[key_1];
    startIndex++;
  }

  return obj;
}
