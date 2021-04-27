import PropTypes from "prop-types";

export default function InlineError({ text }) {
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

InlineError.propTypes = {
  text: PropTypes.string.isRequired,
};
