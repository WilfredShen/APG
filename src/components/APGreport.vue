<template lang="pug">
#report-wrapper
  el-container
    el-header.main-header
      span 试卷回顾：试卷难度 {{ ['小学', '初中', '高中'][paperMeta.difficulty] }}，题目数量 {{ paperMeta.number }}，试卷种子 {{ paperMeta.seed }}，得分 {{ Math.floor((100 * score) / paperMeta.number) }}
    el-main(style="padding: 0")
      el-row(v-for="(item, pid) in paperData", :key="pid")
        .problem-item(:class="pid % 2 ? 'color-1' : 'color-2'")
          el-row.problem-title
            span {{ item.id + 1 }}. {{ item.data }}
          el-row
            el-radio-group.problem-options(v-model="item.selected")
              el-radio(
                v-for="(item, oid) in item.options",
                :key="oid",
                :label="oid",
                :disabled="true",
                :class="'option-color-' + getColor(pid, oid)",
                border
              )
                span(style="color: #FFFFFF") {{ item }}
    el-footer(style="padding: 20px 0; height: fit-content")
      el-button(
        type="primary",
        @click="$router.push('/apg')",
        style="width: 100%"
      )
        span 返回主界面
</template>

<script>
import APG from "@/static/js/generator";

export default {
  name: "APGreport",
  data() {
    return {
      // 试卷元数据（难度、数量、种子）
      paperMeta: {},
      // 试卷数据，一个对象为一道试题
      paperData: [],
      // 答对的题目数量
      score: 0,
      // 提交的答案
      answer: "",
    };
  },
  methods: {
    /* 用于设置颜色 */
    getColor: function (pid, oid) {
      if (this.paperData[pid].selected == oid)
        if (this.paperData[pid].answer == this.paperData[pid].options[oid])
          return "correct";
        else return "wrong";
      else if (this.paperData[pid].answer == this.paperData[pid].options[oid])
        return "answer";
      else return "other";
    },
  },
  created() {
    /* 渲染 DOM 之前加载数据 */
    this.paperMeta = {
      difficulty: Number(this.$route.query.difficulty),
      number: Number(this.$route.query.number),
      seed: Number(this.$route.query.seed),
    };
    this.paperData = APG.getPaper(this.paperMeta);
    var index = 0;
    this.answer = this.$route.query.answer;
    var ans = this.answer.split("");
    this.paperData.forEach((item) => {
      ans[index] = ans[index] === "x" ? null : Number(ans[index]);
      if (ans[index] != null && item.options[ans[index]] == item.answer)
        this.score++;
      item.selected = ans[index];
      index++;
    });
  },
};
</script>

<style lang="stylus" scoped>
#report-wrapper {
  width: 55%;
  margin: auto;
  min-width: 800px;
}

.main-header {
  padding-top: 1rem;
  background-color: #B3C0D1;

  span {
    font-size: 1.2rem;
  }
}

.el-radio-group {
  display: flex;
  flex-direction: column;
}

.el-radio {
  margin: 0 !important;
}

.problem-item {
  text-align: left;
  padding: 1rem 20% 0 20%;
}

.color-1 {
  background-color: #bbbbbb;
}

.color-2 {
  background-color: #e8e8e8;
}

.problem-title {
  height: 2rem;
  line-height: 2rem;
  font-size: 1.3rem;
}

.problem-options {
  padding: 1rem;
}

.option-color-correct {
  background-color: #67C23A;
}

.option-color-wrong {
  background-color: #F56C6C;
}

.option-color-answer {
  background-color: #409EFF;
}

.option-color-other {
  background-color: #909399;
}
</style>