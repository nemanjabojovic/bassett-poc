import { Vector3 } from "three";

export const LIGHT_PRESETS = {
  SSW: [
    {
      name: "spot_light",
      intensity: 0.6,
      type: "DirectionalLight",
      position: new Vector3(0, 22, 14),
    },
    {
      name: "directional_light_shadow",
      intensity: 0.8,
      type: "DirectionalLight",
      position: new Vector3(5, 3, 13),
      shadow: {
        bias: -0.0001,
        radius: 20,
        mapSize: {
          width: 2048,
          height: 2048,
        },
      },
    },
    {
      name: "back_light",
      intensity: 0.6,
      type: "DirectionalLight",
      position: new Vector3(0, 0, -30),
      castShadow: true,
      shadow: {
        bias: -0.0001,
        radius: 20,
        mapSize: {
          width: 2048,
          height: 2048,
        },
      },
    },
    {
      name: "camera_light",
      intensity: 1,
      parent: "camera",
      type: "DirectionalLight", //
      position: new Vector3(4, 2, 2),
    },
    {
      name: "ambient_light",
      intensity: 0.0035,
      type: "AmbientLight",
    },
  ],
  table: [
    {
      name: "spot_light",
      intensity: 1.7828,
      type: "DirectionalLight",
      position: new Vector3(0.16, 22, 14),
    },
    {
      name: "directional_light_shadow",
      intensity: 0.5264,
      type: "DirectionalLight",
      position: new Vector3(-5, 3, 13),
      shadow: {
        bias: -0.0001,
        radius: 20,
        mapSize: {
          width: 2048,
          height: 2048,
        },
      },
    },
    {
      name: "camera_light",
      intensity: 2.411,
      parent: "camera",
      type: "DirectionalLight",
      position: new Vector3(-2, 2, 2),
    },
    {
      name: "ambient_light",
      intensity: 0.0035,
      type: "AmbientLight",
    },
  ],
  default: [
    {
      name: "spot_light",
      intensity: 0.6,
      type: "DirectionalLight",
      position: new Vector3(0, 22, 14),
    },
    {
      name: "directional_light_shadow",
      intensity: 0.8,
      type: "DirectionalLight",
      position: new Vector3(-5, 3, 13),
      shadow: {
        bias: -0.0001,
        radius: 20,
        mapSize: {
          width: 2048,
          height: 2048,
        },
      },
    },
    {
      name: "camera_light",
      intensity: 1,
      parent: "camera",
      type: "DirectionalLight", //
      position: new Vector3(-2, 2, 2),
    },
    {
      name: "ambient_light",
      intensity: 0.0035,
      type: "AmbientLight",
    },
  ],
};
