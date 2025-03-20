// 校验手机号
const validatorPhone = (rule, value, callback) => {
  if (value.length != 11) {
    callback(new Error("请输入11位手机号码！"));
  } else if (value[0] != 1) {
    callback(new Error("请输入正确的手机号码！"));
  } else {
    callback();
  }
};
// 校验身份证号
const validatorIdNumber = (rule, value, callback) => {
  if (value.length != 18) {
    callback(new Error("请输入18位身份证号码！"));
  } else {
    callback();
  }
};

export const formRules = {
  inputRule: [{ required: true, message: "请输入", trigger: "blur" }],
  selectRule: [
    {
      required: true,
      message: "请选择",
      trigger: "change",
    },
  ],
  arrayRule: [
    {
      type: "array",
      required: true,
      message: "请至少选择一个",
      trigger: "blur",
    },
  ],
  phoneRule: [
    { required: true, message: "请输入", trigger: "blur" },
    { required: true, validator: validatorPhone, trigger: "blur" },
  ],
  idNumberRule: [
    { required: true, message: "请输入", trigger: "blur" },
    { required: true, validator: validatorIdNumber, trigger: "blur" },
  ],
};
