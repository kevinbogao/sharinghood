// @ts-nocheck

import logo from "../assets/images/logo.png";

export default function ServerError() {
  return (
    <div className="page-not-found-control">
      <div className="invalid-link">
        <img src={logo} alt="" />
        <h1>5XX</h1>
        <h3>
          Oops! We're experiencing an error and we're working to fix it. Please
          come back later.
        </h3>
      </div>
      <style jsx>
        {`
          @import "./src/assets/scss/index.scss";

          .page-not-found-control {
            font-family: $font-stack;
            margin: auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: $xl-max-width;
            text-align: center;

            @include lg {
              flex-direction: column;
              justify-content: center;
            }

            @include sm {
              margin-top: 0;
              justify-content: flex-start;
              align-items: stretch;
            }

            img {
              width: 75px;
              margin-bottom: 60px;
            }

            h1 {
              font-size: 70px;
              margin: 0 auto 30px auto;
              color: $beige;
            }

            h3 {
              margin: 0 auto auto auto;
              font-size: 20px;
            }

            .invalid-link {
              position: absolute;
              top: 50%;
              left: 50%;
              -ms-transform: translate(-50%, -50%);
              transform: translate(-50%, -50%);
            }
          }
        `}
      </style>
    </div>
  );
}
