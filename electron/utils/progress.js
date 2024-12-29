const EventEmitter = require("events");

class Progress extends EventEmitter {
  constructor() {
    super();
    if (!Progress.instance) {
      Progress.instance = this;
    }
    return Progress.instance;
  }

  /**
   * 진행 상황을 발행하는 메서드
   * @param {Object} data - 진행 상황 데이터 { progress: 숫자, message: 문자열 }
   */
  emitProgress(data) {
    this.emit("progress", data);
  }

  /**
   * 에러 상황을 발행하는 메서드
   * @param {Object} data - 에러 데이터 { progress: 0, message: 문자열, error: 객체 }
   */
  emitError(data) {
    this.emit("error", data);
  }
}

const instance = new Progress();
Object.freeze(instance);

module.exports = instance;
