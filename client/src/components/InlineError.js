import React from 'react';
import PropTypes from 'prop-types';

function InlineError({ text }) {
  return (
    <span className="inline-error">
      {text}
      <style jsx>
        {`
          @import './src/assets/scss/index.scss';

          .inline-error {
            color: $red-200;
          }
        `}
      </style>
    </span>
  );
}

InlineError.propTypes = {
  text: PropTypes.string.isRequired,
};

export default InlineError;
