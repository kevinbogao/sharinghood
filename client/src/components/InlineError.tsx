export default function InlineError({ text }: { text: string }) {
  return (
    <span className="inline-error">
      {text}
      <style jsx>
        {`
          @import "./src/assets/scss/index.scss";

          .inline-error {
            color: $red-200;
            max-width: 300px;
            display: block;
          }
        `}
      </style>
    </span>
  );
}
