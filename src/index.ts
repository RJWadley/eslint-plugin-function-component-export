import { banFC } from "./rules/banFC";
import { combineDefault } from "./rules/combineDefault";

module.exports = {
  rules: {
    "ban-FC": {
      create: banFC,
      meta: {
        fixable: "code",
      },
    },
    "combine-default-export": {
      create: combineDefault,
      meta: {
        fixable: "code",
      },
    },
  },
};
