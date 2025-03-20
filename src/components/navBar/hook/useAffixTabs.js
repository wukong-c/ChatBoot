import useNavStore from "@/store/nav.store";
import { useRouter } from "vue-router";
import { ref, toRaw } from "vue";
export default function useAffixTabs() {
  const navStore = useNavStore();
  const router = useRouter();

  const affixList = ref([]);

  let isAddAffix = false;

  if (!isAddAffix) {
    addAffixTabs();
    isAddAffix = true;
  }

  function addAffixTabs() {
    const affixTabs = filterAffixTabs(router.getRoutes());
    affixList.value = affixTabs;
    for (const tab of affixTabs) {
      navStore.addTab({
        meta: tab.meta,
        name: tab.name,
        path: tab.path,
      });
    }
  }
  function filterAffixTabs(routes) {
    const tabs = [];
    routes &&
      routes.forEach(route => {
        if (route.meta && route.meta.affix) {
          tabs.push(toRaw(route));
        }
      });
    return tabs;
  }
}
