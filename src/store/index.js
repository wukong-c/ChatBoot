import baseStore from "./base.store";
import navStore from "./nav.store";
//各模块统一出口
export default function store() {
  return {
    baseStore: baseStore(),
    navStore: navStore(),
  };
}
