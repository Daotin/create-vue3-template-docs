// ģ��Vueʵ��
class Vue {
  constructor(options) {
    this.$data = options.data;
    this.$el = document.querySelector(options.el);
    this.observe(this.$data);
    this.compile(this.$el);
  }

  // �۲�����
  observe(data) {
    if (!data || typeof data !== 'object') return;
    Object.keys(data).forEach((key) => {
      this.defineReactive(data, key, data[key]);
    });
  }

  // ������Ӧʽ����
  defineReactive(obj, key, val) {
    const dep = new Dep();
    Object.defineProperty(obj, key, {
      get() {
        if (Dep.target) {
          dep.addSub(Dep.target);
        }
        return val;
      },
      set(newVal) {
        if (newVal === val) return;
        val = newVal;
        dep.notify();
      },
    });
  }

  // ����ģ��
  compile(el) {
    const nodes = el.childNodes;
    Array.from(nodes).forEach((node) => {
      if (node.nodeType === 3) {
        // �ı��ڵ�
        const reg = /\{\{(.*?)\}\}/;
        const match = node.textContent.match(reg);
        if (match) {
          const key = match[1].trim();
          new Watcher(this.$data, key, (val) => {
            node.textContent = val;
          });
        }
      }
    });
  }
}

// �����ռ���
class Dep {
  constructor() {
    this.subs = [];
  }

  addSub(sub) {
    this.subs.push(sub);
  }

  notify() {
    this.subs.forEach((sub) => sub.update());
  }
}

// �۲���
class Watcher {
  constructor(data, key, cb) {
    this.data = data;
    this.key = key;
    this.cb = cb;
    Dep.target = this;
    this.value = data[key]; // ����getter,�ռ�����
    Dep.target = null;
  }

  update() {
    const newVal = this.data[this.key];
    if (newVal !== this.value) {
      this.value = newVal;
      this.cb(newVal);
    }
  }
}

// ʹ��ʾ��
const app = new Vue({
  el: '#app',
  data: {
    message: 'Hello, Vue!',
  },
});

// ��������,��������
setTimeout(() => {
  app.$data.message = 'Data changed!';
}, 1000);
