<template lang="pug">
#apgnav-wrapper
  el-container
    el-header
      span 选题
    el-main
      el-form(
        :model="navForm",
        ref="navForm",
        :rules="navRules",
        label-position="left",
        label-width="80px"
      )
        el-form-item(label="难度选择", prop="difficulty")
          el-select(
            v-model.number="navForm.difficulty",
            placeholder="请选择题目难度",
            style="width: 100%"
          )
            el-option(
              v-for="item in difficultyOptions",
              :key="item.value",
              :label="item.label",
              :value="item.value"
            )
        el-form-item(label="数量", prop="number")
          el-select(
            v-model.number="navForm.number",
            placeholder="请选择题目数量",
            style="width: 100%"
          )
            el-option(
              v-for="item in numberOptions",
              :key="item",
              :label="item",
              :value="item"
            )
        el-form-item(style="margin-bottom: 10px")
          el-row(style="width: 100%", type="flex", justify="space-between")
            el-col(:span="16")
              el-button(@click="submit", type="primary", style="width: 100%")
                span 进入测试
            el-col(:span="6")
              el-button(@click="exit", type="info", style="width: 100%; padding-left: 0; padding-right: 0")
                span 退出登录
        el-row(style="text-align: right; width: 100%; padding-right: .8rem")
          el-link(@click="$router.push('/pwd')") 修改密码
</template>

<script>
const MAX_INT = 2147483648;

export default {
  name: "APGnav",
  data() {
    return {
      navForm: {
        difficulty: 0,
        number: 10,
      },
      difficultyOptions: [
        {
          value: 0,
          label: "小学",
        },
        {
          value: 1,
          label: "初中",
        },
        {
          value: 2,
          label: "高中",
        },
      ],
      numberOptions: Array.apply(null, { length: 21 }).map((v, i) => i + 10),
      navRules: {
        difficulty: {
          required: true,
          type: "number",
          min: 0,
          max: 2,
          message: "请选择题目难度",
          trigger: ["blur", "change"],
        },
        number: {
          required: true,
          type: "number",
          min: 10,
          max: 30,
          message: "请选择题目数量",
          trigger: ["blur", "change"],
        },
      },
    };
  },
  methods: {
    submit: function () {
      var flag;
      this.$refs["navForm"].validate((res) => {
        flag = res;
      });
      if (flag) {
        let storage = {
          difficulty: this.navForm.difficulty,
          number: this.navForm.number,
          seed: (Math.random() * MAX_INT) % MAX_INT,
        };
        this.$router.push({
          path: "/apg/paper",
          query: storage,
        });
      }
    },
    exit: function () {
      localStorage.removeItem("apg-token");
      this.$router.push("/login");
    },
  },
};
</script>

<style lang="stylus" scoped>
#apgnav-wrapper {
  width: 25%;
  margin: auto;
  min-width: 450px;
}

header {
  span {
    font-size: 1.6rem;
  }
}

.el-icon-view {
  cursor: pointer;
}
</style>