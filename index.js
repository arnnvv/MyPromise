const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class MyPromise {
  constructor(executor) {
    this.state = PENDING;
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    const resolve = (value) => {
      if (this.state === PENDING) {
        this.state = FULFILLED;
        this.value = value;
        this.onFulfilledCallbacks.forEach(callback => callback(this.value));
      }
    };

    const reject = (reason) => {
      if (this.state === PENDING) {
        this.state = REJECTED;
        this.reason = reason;
        this.onRejectedCallbacks.forEach(callback => callback(this.reason));
      }
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then(onFulfilled, onRejected) {
    const onFulfilledCallback = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    const onRejectedCallback = typeof onRejected === 'function' ? onRejected : reason => { throw reason; };

    const newPromise = new MyPromise((resolve, reject) => {
      const handleFulfilled = (value) => {
        try {
          const result = onFulfilledCallback(value);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      const handleRejected = (reason) => {
        try {
          const result = onRejectedCallback(reason);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      if (this.state === FULFILLED) {
        setTimeout(() => handleFulfilled(this.value), 0);
      } else if (this.state === REJECTED) {
        setTimeout(() => handleRejected(this.reason), 0);
      } else if (this.state === PENDING) {
        this.onFulfilledCallbacks.push(value => handleFulfilled(value));
        this.onRejectedCallbacks.push(reason => handleRejected(reason));
      }
    });

    return newPromise;
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  static resolve(value) {
    return new MyPromise((resolve) => resolve(value));
  }

  static reject(reason) {
    return new MyPromise((_, reject) => reject(reason));
  }

  static all(promises) {
    return new MyPromise((resolve, reject) => {
      const results = new Array(promises.length);
      let resolvedCount = 0;

      const handleResolve = (index, value) => {
        results[index] = value;
        resolvedCount++;

        if (resolvedCount === promises.length) {
          resolve(results);
        }
      };

      promises.forEach((promise, index) => {
        if (promise instanceof MyPromise) {
          promise.then(value => handleResolve(index, value), reject);
        } else {
          handleResolve(index, promise);
        }
      });
    });
  }

  static race(promises) {
    return new MyPromise((resolve, reject) => {
      promises.forEach(promise => {
        if (promise instanceof MyPromise) {
          promise.then(resolve, reject);
        } else {
          resolve(promise);
        }
      });
    });
  }
}

function testMyPromise() {
  return new MyPromise((resolve, reject) => {
    setTimeout(() => {
      const randomValue = Math.random();
      if (randomValue > 0.5) {
        resolve(`Promise resolved ${randomValue}`);
      } else {
        reject(`Promise rejected ${randomValue}`);
      }
    }, 1000);
  });
}

async function test(){
  try{
const myPromise = await testMyPromise();
    console.log(myPromise);
}
  catch(err){
    console.error(err);
  }
}

test();
