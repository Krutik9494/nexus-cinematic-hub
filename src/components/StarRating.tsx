import { useState } from "react";
import { Star } from "lucide-react";

export function StarRating({ value, onChange, size = 20 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          onMouseEnter={() => onChange && setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-125"
          aria-label={`${n} stars`}
        >
          <Star
            style={{ width: size, height: size }}
            className={n <= display ? "fill-cyan text-cyan" : "text-muted-foreground"}
          />
        </button>
      ))}
    </div>
  );
}
