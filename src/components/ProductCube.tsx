import Image from "next/image";
import { asset } from "@/lib/asset";

const FACE_TRANSFORMS = [
  "rotateY(0deg)",
  "rotateY(90deg)",
  "rotateY(180deg)",
  "rotateY(270deg)",
  "rotateX(90deg)",
  "rotateX(-90deg)",
];

export default function ProductCube({ images }: { images: string[] }) {
  const faces = FACE_TRANSFORMS.map((t, i) => ({
    transform: `${t} translateZ(var(--cube-half))`,
    src: images[i % images.length],
  }));

  return (
    <div className="cube-scene" aria-hidden="true">
      <div className="cube">
        {faces.map((f, i) => (
          <div key={i} className="cube-face" style={{ transform: f.transform }}>
            <Image src={asset(f.src)} alt="" fill sizes="230px" className="object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}
