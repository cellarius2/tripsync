import TomatoIcon from "../activity/TomatoIcon";

type TomatoEffectProps = {
  active: boolean;
  message?: string;
  count?: number;
};

export default function TomatoEffect({
  active,
  message = "Você levou um tomate!",
  count = 1,
}: TomatoEffectProps) {
  if (!active) return null;

  const tomatoCount = Math.min(Math.max(count, 1), 10);

  return (
    <div className="tomato-effect" aria-live="polite">
      <div className="tomato-effect-burst" aria-hidden="true">
        {Array.from({ length: tomatoCount }).map((_, index) => (
          <span
            key={index}
            className={`tomato-effect-tomato tomato-effect-tomato-${index + 1}`}
          >
            <TomatoIcon size={getTomatoSize(index)} />
          </span>
        ))}
      </div>

      <div className="tomato-effect-message">
        <TomatoIcon size={32} />
        {message}
      </div>
    </div>
  );
}

function getTomatoSize(index: number) {
  const sizes = [82, 72, 88, 66, 78, 92, 70, 84, 74, 96];
  return sizes[index] ?? 76;
}