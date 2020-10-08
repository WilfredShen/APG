<template lang="pug">
#register-wrapper
  el-container
    el-header
      span 注册
    el-main
      el-form(
        :model="registerForm",
        ref="registerForm",
        :rules="registerRules",
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
              v-model="registerForm.username",
              placeholder="请输入用户名",
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
              :type="status.showPass1",
              v-model="registerForm.password",
              placeholder="请输入密码",
              slot="reference"
            )
              i.el-icon-view(
                slot="suffix",
                @click="showPass(1)",
                :style="{ color: status.showPass1 == '' ? '#409EFF' : '' }"
              )
        el-form-item(label="确认密码", prop="confpass")
          el-popover(
            placement="right",
            width="200",
            trigger="focus",
            content="请再次输入密码"
          )
            el-input(
              :type="status.showPass2",
              v-model="registerForm.confpass",
              placeholder="请确认密码",
              slot="reference"
            )
              i.el-icon-view(
                slot="suffix",
                @click="showPass(2)",
                :style="{ color: status.showPass2 == '' ? '#409EFF' : '' }"
              )
        el-form-item(label="手机", prop="phone")
          el-row(type="flex", justify="space-between")
            el-col(:span="14")
              el-popover(placement="bottom", width="200", trigger="focus")
                .popover-content(v-html="'仅支持中国大陆手机号，例：<br/>136xxxxxxxx'")
                el-input(
                  v-model="registerForm.phone",
                  placeholder="输入手机号以接收验证码",
                  slot="reference"
                )
            el-col(:span="9")
              el-button(
                @click="sendCode",
                style="width: 100%; padding-left: 0; padding-right: 0"
              )
                span(v-if="status.resend != 0") {{ status.resend }} 秒后
                span(v-if="!status.codeSent") 发送验证码
                span(v-else) 重新获取
        el-form-item(label="验证码")
          el-popover(
            placement="right",
            width="200",
            trigger="focus",
            content="验证码为6位长度的数字，请勿输入其他字符"
          )
            el-input(
              v-model.number="registerForm.code",
              placeholder="请输入接收到的6位数字验证码",
              slot="reference"
            )
        el-form-item
          el-row(style="width: 100%", type="flex", justify="space-between")
            el-col(:span="16")
              el-button(@click="submit", type="primary", style="width: 100%")
                span 注册
            el-col(:span="6")
              el-button(
                @click="$router.push({ path: '/login' })",
                type="info",
                style="width: 100%"
              )
                span 登录
</template>

<script>
import sha256 from "js-sha256";

export default {
  name: "Register",
  data() {
    return {
      // 注册信息
      registerForm: {
        username: "",
        password: "",
        confpass: "",
        phone: "",
        code: "",
      },
      // 校验规则
      registerRules: {
        username: [
          { required: true, message: "用户名不能为空", trigger: "blur" },
          {
            required: true,
            pattern: /^(?=^\D)[\w\u4e00-\u9fa5]{4,32}$/,
            message: "请输入符合规范的用户名",
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
        confpass: [
          { required: true, message: "密码不能为空", trigger: "blur" },
          {
            required: true,
            validator: (rule, value, callback) => {
              if (value != this.registerForm.password)
                callback("请输入相同的密码");
              else callback();
            },
            trigger: "blur",
          },
        ],
        phone: {
          required: true,
          pattern: /^1[3-9]\d{9}$/,
          message: "请检查手机号码",
          type: "string",
          trigger: "blur",
        },
      },
      // DOM 状态
      status: {
        codeSent: false,
        resend: 0,
        showPass1: "password",
        showPass2: "password",
      },
      // 随机生成的验证码
      code: null,
    };
  },
  methods: {
    // 切换密码显示状态
    showPass: function (slot) {
      switch (slot) {
        case 1:
          this.status.showPass1 = this.status.showPass1 == "" ? "password" : "";
          break;
        case 2:
          this.status.showPass2 = this.status.showPass2 == "" ? "password" : "";
      }
    },
    // 发送验证码
    sendCode: function () {
      var flag;
      this.$refs["registerForm"].validate((res) => {
        flag = res;
      });
      if (flag) {
        this.$db
          .select("user", this.registerForm.phone, "phone")
          .then((res) => {
            if (!res) {
              if (this.status.resend == 0) {
                this.status.codeSent = true;
                this.status.resend = 10;
                this.timer = setInterval(() => {
                  this.status.resend--;
                  if (this.status.resend == 0) clearInterval(this.timer);
                }, 1000);
                this.code = Math.floor(Math.random() * 900000) + 100000;
                this.$confirm(
                  `验证码为 ${this.code}！（使用阿里云SMS API 需要跨域访问，未部署上线时无法实现）`,
                  "提示",
                  {
                    confirmButtonText: "确认",
                    type: "success",
                  }
                );
              }
            } else
              this.$message({
                type: "error",
                message: `该手机号已注册！请直接登录。`,
              });
          })
          .catch(() => {});
      }
    },
    // 提交注册信息
    submit: function () {
      var flag;
      this.$refs["registerForm"].validate((res) => {
        flag = res;
      });
      if (flag) {
        if (this.code === this.registerForm.code) {
          this.$db
            .select("user", this.registerForm.username)
            .then((nameRes) => {
              if (nameRes) {
                this.$message({
                  type: "error",
                  message: `该用户已注册！请直接登录。`,
                });
              } else {
                this.$db
                  .select("user", this.registerForm.phone, "phone")
                  .then((phoneRes) => {
                    if (phoneRes) {
                      this.$message({
                        type: "error",
                        message: `该手机号已注册！请直接登录。`,
                      });
                    } else {
                      this.$db
                        .insert("user", {
                          username: this.registerForm.username,
                          password: sha256(this.registerForm.password),
                          phone: this.registerForm.phone.toString(),
                        })
                        .then(() => {
                          this.$message({
                            type: "success",
                            message: "注册成功！3秒之后将自动跳转至登陆界面。",
                          });
                          setTimeout(() => {
                            this.$router.push({ path: "/login" });
                          }, 3000);
                        })
                        .catch(() => {
                          this.$message({
                            type: "error",
                            message: "注册失败！",
                          });
                        });
                    }
                  });
              }
            });
        } else {
          this.$message({
            type: "error",
            message: "验证码错误，请检查输入！",
          });
        }
      }
    },
  },
};
</script>

<style lang='stylus' scoped>
#register-wrapper {
  width: 25%;
  margin: auto;
  min-width: 450px;
}

header {
  span {
    font-size: 1.6rem;
  }
}

.el-input {
  width: 100%;
}

.el-icon-view {
  cursor: pointer;
}
</style>
