<template lang="pug">
#pwd-wrapper
  el-container
    el-header
      span 修改密码
    el-main
      el-form(
        :model="pwdForm",
        ref="pwdForm",
        :rules="pwdRules",
        label-position="left",
        label-width="80px"
      )
        el-form-item(label="用户名", prop="username")
          el-row(type="flex", justify="space-between")
            el-col(:span="14")
              el-popover(
                placement="bottom",
                width="200",
                trigger="focus",
                content="请输入用户名/手机号"
              )
                el-input(
                  v-model="pwdForm.username",
                  placeholder="请输入用户名/手机号",
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
              v-model.number="pwdForm.code",
              placeholder="请输入接收到的6位数字验证码",
              slot="reference"
            )
        el-form-item(label="新密码", prop="password")
          el-popover(
            placement="right",
            width="200",
            trigger="focus",
            content="请输入非中文字符及空格，必须包含大、小写字母及数字，长度在6-10个字符"
          )
            el-input(
              :type="status.showPass1",
              v-model="pwdForm.password",
              placeholder="请输入新密码",
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
              v-model="pwdForm.confpass",
              placeholder="请确认新密码",
              slot="reference"
            )
              i.el-icon-view(
                slot="suffix",
                @click="showPass(2)",
                :style="{ color: status.showPass2 == '' ? '#409EFF' : '' }"
              )
        el-form-item
          el-row(style="width: 100%", type="flex", justify="space-between")
            el-col(:span="16")
              el-button(@click="submit", type="primary", style="width: 100%")
                span 确认修改
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
  name: "pwd",
  data() {
    return {
      // 修改信息
      pwdForm: {
        username: "",
        password: "",
        confpass: "",
        code: "",
      },
      // 校验规则
      pwdRules: {
        username: [
          { required: true, message: "用户名不能为空", trigger: "blur" },
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
        confpass: [
          { required: true, message: "密码不能为空", trigger: "blur" },
          {
            required: true,
            validator: (rule, value, callback) => {
              if (value != this.pwdForm.password) callback("请输入相同的密码");
              else callback();
            },
            trigger: "blur",
          },
        ],
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
    /* 切换密码显示状态 */
    showPass: function (slot) {
      switch (slot) {
        case 1:
          this.status.showPass1 = this.status.showPass1 == "" ? "password" : "";
          break;
        case 2:
          this.status.showPass2 = this.status.showPass2 == "" ? "password" : "";
      }
    },
    // 验证能否发送验证码，验证通过则生成并发送
    validateCode: function (data) {
      console.log(data);
      if (
        data &&
        (this.pwdForm.username === data.username ||
          this.pwdForm.username === data.phone)
      ) {
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
        return;
      } else
        this.$message({
          type: "error",
          message: "该用户尚未注册！",
        });
    },
    // 验证能否修改密码，验证通过则修改
    validate: function (data, pwd) {
      console.log(data);
      if (
        data &&
        (this.pwdForm.username === data.username ||
          this.pwdForm.username === data.phone)
      ) {
        this.$db.update("user", {
          username: data.username,
          password: sha256(pwd),
          phone: data.phone.toString(),
        });
        this.$message({
          type: "success",
          message: "修改成功！3秒后自动跳转至登录界面。",
        });
        setTimeout(() => {
          this.$router.push("/login");
        }, 3000);
        return;
      } else
        this.$message({
          type: "error",
          message: "用户名/手机号未注册！",
        });
    },
    // 发送验证码
    sendCode: function () {
      console.log("pwdForm", this.pwdForm);
      if (this.pwdForm.username) {
        this.$db.select("user", this.pwdForm.username).then((nameRes) => {
          console.log("nameRes", nameRes);
          if (nameRes) this.validateCode(nameRes);
          else
            this.$db
              .select("user", this.pwdForm.username, "phone")
              .then((phoneRes) => {
                console.log("phoneRes", phoneRes);
                this.validateCode(phoneRes);
              });
        });
      }
    },
    // 提交修改信息
    submit: function () {
      var flag;
      this.$refs["pwdForm"].validate((res) => {
        flag = res;
      });
      if (flag) {
        if (this.code === this.pwdForm.code) {
          this.$db.select("user", this.pwdForm.username).then((nameRes) => {
            if (nameRes) this.validate(nameRes, this.pwdForm.password);
            else
              this.$db
                .select("user", this.pwdForm.username, "phone")
                .then((phoneRes) => {
                  this.validate(phoneRes, this.pwdForm.password);
                });
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
#pwd-wrapper {
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
