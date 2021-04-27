import PropTypes from "prop-types";

export default function Spinner({ isCover }) {
  return (
    <div className={`loading-control ${isCover && "foreground"}`}>
      <div className="lds-ring">
        <div />
        <div />
        <div />
        <div />
      </div>
      <style jsx>
        {`
          @import "./src/assets/scss/index.scss";

          .loading-control {
            position: absolute;
            top: 50%;
            left: 50%;
            -ms-transform: translate(-50%, -50%);
            transform: translate(-50%, -50%);
            z-index: 9000;

            &.foreground {
              padding: 5000px;
              background: rgba(0, 0, 0, 0.25);
            }

            .lds-ring {
              display: inline-block;
              position: relative;
              width: 80px;
              height: 80px;
            }

            .lds-ring div {
              box-sizing: border-box;
              display: block;
              position: absolute;
              width: 64px;
              height: 64px;
              margin: 8px;
              border: 8px solid $orange;
              border-radius: 50%;
              animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
              border-color: $orange transparent transparent transparent;
            }

            .lds-ring div:nth-child(1) {
              animation-delay: -0.45s;
            }

            .lds-ring div:nth-child(2) {
              animation-delay: -0.3s;
            }

            .lds-ring div:nth-child(3) {
              animation-delay: -0.15s;
            }

            @keyframes lds-ring {
              0% {
                transform: rotate(0deg);
              }

              100% {
                transform: rotate(360deg);
              }
            }
          }
        `}
      </style>
    </div>
  );
}

Spinner.propTypes = {
  isCover: PropTypes.bool,
};

Spinner.defaultProps = {
  isCover: false,
};
