<template lang="pug">
#paper-wrapper
  el-container
    el-header
      span 试卷难度 {{ ['小学', '初中', '高中'][paperMeta.difficulty] }}，题目数量 {{ paperMeta.number }}，试卷种子 {{ paperMeta.seed }}
    el-container
      el-aside(style="width: 20%")
        #nav-box
          el-row(
            v-for="(row, ri) in paperData",
            :key="ri",
            type="flex",
            justify="space-around"
          )
            el-col(
              v-for="(item, ci) in row",
              :key="ci",
              style="margin-top: 2rem"
            )
              .to-problem(
                :class="item.selected != null ? 'problem-done' : 'problem-will'",
                @click="current = item.id"
              )
                span {{ item.id + 1 }}
      el-main(style="width: 80%")
        #problem-wrapper
          el-row.problem-title
            span {{ curData.id + 1 }}. {{ curData.data }}
          el-row.problem-options
            el-radio-group(v-model="curData.selected")
              el-radio(
                v-for="(item, index) in curData.options",
                :key="index",
                :label="index"
              )
                span {{ item }}
    el-footer
      el-row(type="flex", justify="end")
        el-button(v-if="current != 0", @click="current--")
          span 上一题
        el-button(v-if="current != paperMeta.number - 1", @click="current++")
          span 下一题
        el-button(v-else, type="primary", @click="submit")
          span 提交
</template>

<script>
import APG from "@/static/js/generator";

export default {
  name: "APGpaper",
  data() {
    return {
      paperMeta: {},
      paperData: [],
      doneSet: new Set(),
      current: 0,
      percentage: 0,
    };
  },
  methods: {
    submit: function () {
      var count = 0,
        ans = "";
      this.paperData.forEach((row) => {
        row.forEach((item) => {
          if (item.selected != null) {
            count++;
            ans += item.selected;
          } else {
            ans += "x";
          }
        });
      });
      var warning =
        count == this.paperMeta.number
          ? "提交后将无法修改答案，是否确认提交？"
          : "有题目尚未完成，提交后将无法修改答案，是否确认提交？";
      this.$confirm(warning, "警告", {
        confirmButtonText: "确认提交",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.$message({
            type: "success",
            message: "提交成功！3秒后将自动跳转至详情界面。",
          });
          var query = {
            difficulty: this.paperMeta.difficulty,
            number: this.paperMeta.number,
            seed: this.paperMeta.seed,
            answer: ans,
          };
          setTimeout(() => {
            this.$router.push({
              path: "/apg/report",
              query: query,
            });
          }, 3000);
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消提交！",
          });
        });
    },
  },
  computed: {
    curData: function () {
      return this.paperData[Math.floor(this.current / 5)][this.current % 5];
    },
  },
  created() {
    this.paperMeta = {
      difficulty: Number(this.$route.query.difficulty),
      number: Number(this.$route.query.number),
      seed: Number(this.$route.query.seed),
    };
    var tmp = APG.getPaper(this.paperMeta);
    tmp.forEach((e, index) => {
      if (index % 5 == 0) {
        this.paperData.push([]);
      }
      this.paperData[Math.floor(index / 5)].push(e);
    });
  },
};
</script>

<style lang="stylus" scoped>
#paper-wrapper {
  width: 55%;
  margin: auto;
  min-width: 800px;
}

.el-header {
  padding-top: 1rem;
  background-color: #B3C0D1;

  span {
    font-size: 1.6rem;
  }
}

.el-footer {
  background-color: #B3C0D1;
  padding: 0.6rem;

  .el-button {
    width: 88px;
  }
}

.el-aside {
  background-color: #D3DCE6;
}

.el-main {
  background-color: #E9EEF3;
}

#nav-box {
  padding: 6%;
}

.to-problem {
  display: inline-block;
  width: 1.6rem;
  height: 1.6rem;
  text-align: center;
  cursor: pointer;
  border-radius: 0.3rem;

  span {
    line-height: 1.6rem;
  }
}

.problem-will {
  background-color: #C0C4CC;
}

.problem-done {
  background-color: #409EFF;
}

#problem-wrapper {
  padding-left: 1rem;
  text-align: left;
}

.problem-title {
  text-align: left;
}

.problem-options {
  padding-top: 1.6rem;

  .el-radio-group {
    display: flex;
    flex-direction: column;

    .el-radio {
      height: 2rem;
      line-height: 2rem;

      span {
        font-size: 1.1rem;
      }
    }
  }
}
</style>