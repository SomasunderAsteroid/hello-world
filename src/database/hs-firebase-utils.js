/**
  * Convert firebase result values to the format that is used in polymerfire
  * adopted from firebase-query
  */
// const polymerfireFormat = snapshot => {
//   if (snapshot.hasChildren()) {
//     let data = [];
//     snapshot.forEach(childSnapshot => {
//       const value = snapshotToValue(childSnapshot);
//       data.push(value);
//     });
//     return data;
//   }
// };

const valueWithKey = (key, value) => {
  const leaf = typeof value !== 'object';
  return leaf ? { $key: key, $val: value } : Object.assign({}, value, { $key: key });
};

const snapshotToValue = snapshot =>
  valueWithKey(snapshot.key, snapshot.val());

const indexFromKey = (key, data) =>
  key && data ? data.findIndex(({ $key }) => $key === key) : -1;


/**
  * Subscribe on value changes from a FireBase database reference.
  * Intended to replace firebase-document components
  * @param {firebase.database.Reference} dbRef
  * @param {string} dataProperty name of the property
  * @param {object} context will be used as this for the callbacks if provided
  * @return {function} a function that will unsubscribe if called
  */
const firebaseObjectSubscribe = (dbRef, dataProperty, context) => {
  const onValue = dbRef.on('value', _onValue(dataProperty), _onError, context);
  return () => {
    dbRef.off('value', onValue);
  };
};

/**
  * Store a change from a property wildcard observer 'prop.*' to a 
  * Firebase ref.
  * @param {firebase.database.Reference} objectRef
  * @param {object} changeRecord
  */
const storeWildcardChangeToFirebase = (objectRef, changeRecord) => {
  const { path, value } = changeRecord;
  const dbPath = path.split('.').slice(1).join('/');
  if (dbPath != '') { // Only update on field changes, not when the whole object is initialized
    return objectRef.child(dbPath).set(value);
  } else {
    return Promise.resolve();
  }
};

/**
  * Subscribe on value changes from a FireBase database reference.
  * Intended to replace firebase-query components
  * @param {firebase.database.Reference} dbRef
  * @param {string} dataProperty name of the property
  * @param {object} context will be used as this for the callbacks if provided
  * @return {function} a function that will unsubscribe if called
  */
const firebaseArraySubscribe = (dbRef, dataProperty, context) => {
  const onAdded = _onChildAdded(dataProperty);
  const onRemoved = _onChildRemoved(dataProperty);
  const onChanged = _onChildChanged(dataProperty);
  const onMoved = _onChildMoved(dataProperty);
  dbRef.on('value', _onArrayValue(dbRef, dataProperty, context, onAdded, onRemoved, onChanged, onMoved), _onError, context);
  return () => {
    dbRef.off('child_added', onAdded, context);
    dbRef.off('child_removed', onRemoved, context);
    dbRef.off('child_changed', onChanged, context);
    dbRef.off('child_moved', onMoved, context);
    // dbRef.off();
  };
};

const _onArrayValue = (dbRef, dataProperty, context, onAdded, onRemoved, onChanged, onMoved) => {
  console.log(`%c${dbRef.path.pieces_.join('/')} - ${context.tagName}`, 'background: green; color: white;font-size:larger');
  const onValue = function (snapshot) {
    let data = [];
    if (snapshot.hasChildren()) {
      snapshot.forEach(childSnapshot => {
        const value = snapshotToValue(childSnapshot);
        data.push(value);
      });
      if (dbRef.path.pieces_.length > 1 && dbRef.path.pieces_[0] == 'horseUnitInfo') {
        data.push({ $key: dbRef.path.pieces_[1] });
      }

    }
    this.set(dataProperty, data);
    dbRef.off('value', onValue, context);

    dbRef.on('child_added', onAdded, _onError, context);
    dbRef.on('child_removed', onRemoved, _onError, context);
    dbRef.on('child_changed', onChanged, _onError, context);
    dbRef.on('child_moved', onMoved, _onError, context);
  };
  return onValue;
};

function _onError(err) {
  console.error(err);
  if (this.dispatchEvent) { // If the call context is a shadow dom
    const event = new CustomEvent('error', {
      detail: err,
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }
}

const _onValue = dataProperty =>
  function (snapshot) { // uses function instead of => to allow binding of this
    const value = snapshot.val();
    this._setProperty(dataProperty, value == null ? {} : value);
  };

const _onChildAdded = dataProperty =>
  function (childSnapshot, prevChildKey) { // uses function instead of => to allow binding of this
    let data = this.get(dataProperty);
    const key = childSnapshot.key;
    // check if the key-value pair already exists
    if (indexFromKey(key, data) >= 0) return;
    const previousChildIndex = indexFromKey(prevChildKey, data);
    const value = snapshotToValue(childSnapshot);
    this.splice(dataProperty, previousChildIndex + 1, 0, value);
  };

const _onChildRemoved = dataProperty =>
  function (oldChildSnapshot) {
    const key = oldChildSnapshot.key;
    const data = this.get(dataProperty);
    const childIndex = indexFromKey(key, data);
    if (childIndex >= 0) {
      this.splice(dataProperty, childIndex, 1);
    }
  };

const _onChildChanged = dataProperty =>
  function (childSnapshot) {
    const key = childSnapshot.key;
    const data = this.get(dataProperty);
    const childIndex = indexFromKey(key, data);
    const value = snapshotToValue(childSnapshot);
    // FIXME: ? The firebase query component loops over all child properties in
    // an object and sets them individually. This might be more efficient in some cases
    this.set([dataProperty, childIndex], value);
  };

const _onChildMoved = dataProperty =>
  function _onChildMoved(childSnapshot, prevChildKey) {
    const key = childSnapshot.key;
    const data = this.get(dataProperty);
    const targetIndex = prevChildKey ? indexFromKey(prevChildKey, data) + 1 : 0;
    const index = indexFromKey(key, data);
    const value = snapshotToValue(childSnapshot);
    this.splice(dataProperty, index, 1);
    this.splice(dataProperty, targetIndex, 0, value);
  };

// const validateComponents = {
//   "HS-UNIT-SIGNAL": { allowedPage: ["horseMap", "farmMap", "horseChat", "farmChat", "horseStatistics", "farmStatistics", "farmHorseunitsToHorses"] },
//   "HS-BATTERY-LEVEL": { allowedPage: ["horseMap", "farmMap", "horseChat", "farmChat", "horseStatistics", "farmStatistics", "farmHorseunitsToHorses"] }
// }

window.HS = window.HS || {};
Object.assign(window.HS, {
  firebaseObjectSubscribe,
  storeWildcardChangeToFirebase,
  firebaseArraySubscribe,
});
