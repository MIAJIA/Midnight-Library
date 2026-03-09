'use client';

interface Props {
  text: string;
}

export default function Narrative({ text }: Props) {
  const lines = text.split('\n');

  return (
    <div className="narrative">
      {lines.map((line, i) =>
        line === '' ? (
          <br key={i} />
        ) : (
          <span key={i} className="narrative-line">
            {line}
            {i < lines.length - 1 && <br />}
          </span>
        ),
      )}
      <span className="cursor" aria-hidden />
    </div>
  );
}
