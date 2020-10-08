<template lang="pug">
#login-wrapper
  el-container
    el-header
      span 登录
    el-main
      el-form(
        :model="loginForm",
        ref="loginForm",
        :rules="loginRules",
        label-position="left",
        label-width="80px"
      )
        el-form-item(label="用户名", prop="username")
          el-popover(
            placement="right",
            width="200",
            trigger="focus",
            content="用户名可由中文、英文字母、数字及下划线构成，不能以数字开头，长度在4-32个字符"
          )
            el-input(
              v-model="loginForm.username",
              placeholder="请输入用户名/手机号",
              slot="reference"
            )
        el-form-item(label="密码", prop="password")
          el-popover(
            placement="right",
            width="200",
            trigger="focus",
            content="请输入非中文字符及空格，必须包含大、小写字母及数字，长度在6-10个字符"
          )
            el-input(
              :type="status.showPass ? '' : 'password'",
              v-model="loginForm.password",
              placeholder="请输入密码",
              slot="reference"
            )
              i.el-icon-view(
                slot="suffix",
                @click="status.showPass = !status.showPass",
                :style="{ color: status.showPass ? '#409EFF' : '' }"
              )
        el-form-item(style="margin-bottom: 10px")
          el-row(style="width: 100%", type="flex", justify="space-between")
            el-col(:span="16")
              el-button(@click="submit", type="primary", style="width: 100%")
                span 登录
            el-col(:span="6")
              el-button(
                @click="$router.push({ path: '/register' })",
                type="info",
                style="width: 100%"
              )
                span 注册
        el-row(style="text-align: right; width: 100%; padding-right: .8rem")
          el-link(@click="$router.push('/pwd')") 忘记密码
</template>

<script>
import sha256 from "js-sha256";

export default {
  name: "Login",
  data() {
    return {
      // 登录数据
      loginForm: {
        username: "",
        password: "",
      },
      // 校验规则
      loginRules: {
        username: [
          { required: true, message: "用户名/手机号不能为空", trigger: "blur" },
          {
            required: true,
            pattern: /^((?=^\D)[\w\u4e00-\u9fa5]{4,32})|(1[3-9]\d{9})$/,
            message: "请输入符合规范的用户名/手机号",
            type: "string",
            trigger: "blur",
          },
        ],
        password: [
          { required: true, message: "密码不能为空", trigger: "blur" },
          {
            required: true,
            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[\x21-\x7e]{6,10}$/,
            message: "请输入符合规范的密码",
            trigger: "blur",
          },
        ],
      },
      // DOM 的状态
      status: {
        showPass: false,
      },
    };
  },
  methods: {
    /* 进行登录验证，通过则跳转 */
    validate: function (data) {
      if (data && sha256(this.loginForm.password) === data.password) {
        var now = new Date().getTime();
        localStorage.setItem(
          "apg-token",
          JSON.stringify({
            username: this.loginForm.username,
            time: now,
          })
        );
        this.$message({
          type: "success",
          message: "登陆成功！",
        });
        this.$router.push({ path: "/apg" });
      } else {
        this.$message({
          type: "error",
          message: "用户名或密码错误！",
        });
      }
    },
    /* 提交登录信息 */
    submit: function () {
      var flag;
      this.$refs["loginForm"].validate((success) => {
        flag = success;
      });
      if (flag) {
        this.$db.select("user", this.loginForm.username).then((nameRes) => {
          if (nameRes) this.validate(nameRes);
          else
            this.$db
              .select("user", this.loginForm.username, "phone")
              .then((phoneRes) => {
                this.validate(phoneRes);
              });
        });
      }
    },
  },
};
</script>

<style lang="stylus" scoped>
#login-wrapper {
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