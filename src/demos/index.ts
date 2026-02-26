import { type ComponentType, lazy } from "react";

export type DemoMeta = {
  component: ReturnType<typeof lazy<ComponentType>>;
  label: string;
  defaultHeight: number;
};

const demoRegistry: Record<string, DemoMeta> = {
  "logic-simulator": {
    component: lazy(() => import("./logic-simulator")),
    label: "Logik-Simulator",
    defaultHeight: 600,
  },
};

export default demoRegistry;
