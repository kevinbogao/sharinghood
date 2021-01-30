import React from "react";
import PropTypes from "prop-types";

function NotFound({ itemType }) {
  return (
    <div className="not-found-control">
      <p className="main-p">{itemType} not found</p>
      <style jsx>
        {`
          @import "./src/assets/scss/index.scss";

          .not-found-control {
            margin: auto;
          }
        `}
      </style>
    </div>
  );
}

NotFound.propTypes = {
  itemType: PropTypes.string.isRequired,
};

export default NotFound;
