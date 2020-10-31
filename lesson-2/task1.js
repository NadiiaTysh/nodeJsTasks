class TimersManager {
  constructor() {
      this.timers = [];
  }

  add(obj, ...rest) {
    if (typeof obj.name !== 'string') {
      throw new Error('name is not a string');
    };
    if (obj.name.length === 0) {
      throw new Error('name is empty');
    };
    if (!obj.delay) {
      throw new Error('delay is not stated');
    };
    if (typeof obj.delay !== 'number') {
      throw new Error('delay is not a number');
    };
    if (obj.delay < 0) {
      throw new Error('delayhas negative value');
    };
    if (obj.delay > 5000) {
      throw new Error('delay is too long');
    };
    if (typeof obj.interval !== 'boolean' && !obj.interval) {
      throw new Error('interval is not stated');
    };
    if (typeof obj.interval !== 'boolean') {
      throw new Error('interval is not boolean');
    };
    if (!obj.job) {
      throw new Error('job is not stated');
    };
    if (typeof obj.job !== 'function') {
      throw new Error('job is not a function');
    };

    const descriptions = {
      desc: obj,
      args: rest,
    };
    this.timers.push(descriptions);
    return this;
  };
  remove(name) {
    const timersNew = this.timers.filter(timer => {
      const { desc: {name: timerName}, timerId } = timer;
      if (timerName === name) {
        clearTimeout(timerId);
      };
      return timerName !== name;
    });
    this.timers = timersNew;
  };
  start() {
    this.timers.map(timer => {
      const { desc: {interval, job, delay}, args } = timer;
      const timerId = interval
        ? setInterval(job, delay, args)
        : setTimeout(job, delay, args);
      timer.timerId = timerId;
    });
  };
  stop() {
    this.timers.map(timer => {
      clearTimeout(timer.timerId);
    });
  };
  pause(name) {
    this.timers.map(timer => {
      const { desc: {name: timerName}, timerId } = timer;
      if (timerName === name) {
        clearTimeout(timerId);
      };
    });
  };
  resume(name) {
    this.timers.map(timer => {
      const { desc: {name: timerName, interval, job, delay}, args } = timer;
      if (timerName === name) {
        const timerId = interval
        ? setInterval(job, delay, args)
        : setTimeout(job, delay, args);
      timer.timerId = timerId;
      };
    });
  };
};

const manager = new TimersManager();
const t1 = {
  name: "t1",
  delay: 1000,
  interval: false,
  job: () => {
    console.log("t1");
  },
};

const t2 = {
  name: "t2",
  delay: 1000,
  interval: false,
  job: (a, b) => a + b,
};

manager.add(t1);
manager.add(t2, 1, 2);
manager.start();
console.log(1);
manager.pause("t1");
