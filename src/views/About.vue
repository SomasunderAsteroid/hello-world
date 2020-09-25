<template>
  <div class="hello">About page {{ msgs }}</div>
  <button @click="testMethod">test</button>
</template>

<script>
export default {
  name: "About",
  props: {
    // msgs: String,
  },
  data() {
    return {
      msgs: ['test']
    };
  },
  methods: {
    testMethod: function () {
      this.msgs.push(new Date().toISOString());
      console.log(this);
    },
  },
};
</script>