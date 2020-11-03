class TimersManager {
  constructor() {
      this.timers = [];
      this.logs = [];
  }

  static _validate(obj) {
    if (typeof obj.name !== 'string') {
      throw new Error('name must be a string');
    };
    if (!obj.name.length) {
      throw new Error('name cannot be empty');
    };
    if (!obj.delay) {
      throw new Error('delay must be stated');
    };
    if (typeof obj.delay !== 'number') {
      throw new Error('delay must be a number');
    };
    if (obj.delay < 0) {
      throw new Error('delay cannot be negative value');
    };
    if (obj.delay > 5000) {
      throw new Error('delay must be less than 5000 ms');
    };
    if (typeof obj.interval !== 'boolean' && !obj.interval) {
      throw new Error('interval must be stated');
    };
    if (typeof obj.interval !== 'boolean') {
      throw new Error('interval must be boolean');
    };
    if (!obj.job) {
      throw new Error('job must be stated');
    };
    if (typeof obj.job !== 'function') {
      throw new Error('job must be a function');
    };
  };

  add(obj, ...rest) {
    TimersManager._validate(obj);
    this.timers.map(timer => {
      if (timer.desc.name === obj.name) {
        throw new Error(`timer with name ${obj.name} already exists`);
      };
    });
    this.timers.map(timer => {
      if (timer.timerId) {
        throw new Error(`timer cannot be added after others are started`);
      };
    });

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
      const { desc: {name, interval, job, delay}, args } = timer;
      let errorLog = null;
      
      const _tryCallback = () => {
        try {
          const out = job(...args);

          return out;
        } catch (error) {
          errorLog = {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }

          return;
        };
      };
      const timerId = interval
        ? setInterval(_tryCallback, delay, ...args)
        : setTimeout(_tryCallback, delay, ...args);
      timer.timerId = timerId;

      const log = {
        name,
        in: args,
        out: _tryCallback(...args),
      };
      errorLog ? log.error = errorLog : null;
      log.created = new Date().toISOString()

      this.logs.push(log);
    });
    const maxDelayTimer = this.timers.reduce((prevTimer, currentTimer) => {

      return (prevTimer.desc.delay > currentTimer.desc.delay) ? prevTimer : currentTimer;
    });
    const timeout = maxDelayTimer.desc.delay + 10000;
    setTimeout(this.stop, timeout);

  };

  stop() {
    if(this.timers) {
      this.timers.map(timer => {
        clearTimeout(timer.timerId);
      });
    }
  };

  pause(name) {
    this.timers.find(timer => {
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
        ? setInterval(job, delay, ...args)
        : setTimeout(job, delay, ...args);
      timer.timerId = timerId;
      };
    });
  };

  print() {
    console.log(this.logs);
    
    return this.logs;
  };
};

const manager = new TimersManager();

const t1 = {
  name: 't1',
  delay: 3000,
  interval: false,
  job: (a, b) => a + b
};

const t2 = {
  name: 't2',
  delay: 2000,
  interval: false,
  job: () => {throw new Error('We have a problem!')},
};

const t3 = {
  name: 't3',
  delay: 5000,
  interval: false,
  job: n => n
};

manager.add(t1, 1, 2);
manager.add(t2);
manager.add(t3, 1);
manager.start();
// Через 15 секунд все таймеры должны быть очищены