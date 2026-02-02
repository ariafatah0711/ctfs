"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

export default function Live2DPixi() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Wait for scripts to load
    const checkAndLoad = () => {
      if (!(window as any).PIXI || !(window as any).PIXI.live2d) {
        setTimeout(checkAndLoad, 100);
        return;
      }

      if (!canvasRef.current) return;

      const PIXI = (window as any).PIXI;
      const live2d = PIXI.live2d;

      const canvasWidth = 400;
      const canvasHeight = 400;

      const app = new PIXI.Application({
        view: canvasRef.current,
        width: canvasWidth,
        height: canvasHeight,
        backgroundColor: 0x000000,
        autoStart: true,
        transparent: true
      });

      const cubism2Model =
        "https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/shizuku/shizuku.model.json";

      (async () => {
        try {
          const model = await live2d.Live2DModel.from(cubism2Model);
          app.stage.addChild(model);

          // Scale relative to canvas, bukan window
          const scaleX = (canvasWidth * 0.8) / model.width;
          const scaleY = (canvasHeight * 0.8) / model.height;
          const scale = Math.min(scaleX, scaleY);
          model.scale.set(scale);

          let lastHitTime = 0;
          const hitCooldown = 300; // 300ms cooldown

          model.on("hit", (a: string[]) => {
            const now = Date.now();
            if (now - lastHitTime < hitCooldown) return;

            lastHitTime = now;

            if (a.includes("body")) {
              model.motion("tap_body");
            } else if (a.includes("head")) {
              model.expression();
            }
          });

          draggable(model);

          console.log("Live2D model loaded successfully");
        } catch (error) {
          console.error("Failed to load Live2D model:", error);
        }
      })();

      function draggable(model: any) {
        model.buttonMode = true;
        let hasMoved = false;
        let downX = 0;
        let downY = 0;

        model.on("pointerdown", (e: any) => {
          hasMoved = false;
          downX = e.data.global.x;
          downY = e.data.global.y;
          model.dragging = true;
          model.dx = e.data.global.x - model.x;
          model.dy = e.data.global.y - model.y;
        });

        model.on("pointermove", (e: any) => {
          const distance = Math.hypot(e.data.global.x - downX, e.data.global.y - downY);
          if (distance > 5) {
            hasMoved = true;
          }

          if (model.dragging && hasMoved) {
            model.x = e.data.global.x - model.dx;
            model.y = e.data.global.y - model.dy;
          }
        });

        model.on("pointerup", () => {
          model.dragging = false;
        });

        model.on("pointerupoutside", () => {
          model.dragging = false;
        });
      }

      // Biar canvas bisa di-destroy proper saat unmount
      return () => {
        try {
          app.destroy(true, { children: true });
        } catch (e) {
          console.error("Error destroying PIXI app:", e);
        }
      };
    };

    checkAndLoad();
  }, []);

  return (
    <>
        {/* Cubism 2 runtime */}
        <Script src="https://cdn.jsdelivr.net/gh/dylanNew/live2d/webgl/Live2D/lib/live2d.min.js" />

        {/* Cubism 3/4 runtime */}
        <Script src="https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js" />

        {/* PIXI */}
        <Script src="https://cdn.jsdelivr.net/npm/pixi.js@6.5.2/dist/browser/pixi.min.js" />

        {/* PIXI Live2D */}
        <Script src="https://cdn.jsdelivr.net/npm/pixi-live2d-display/dist/index.min.js" />
        <Script src="https://cdn.jsdelivr.net/npm/pixi-live2d-display/dist/extra.min.js" />

        <canvas ref={canvasRef} className="fixed bottom-0 left-0 cursor-pointer" style={{ zIndex: 10 }} />
        <div ref={controlRef} />
    </>
  );
}
