import React from "react";

function PageNotFound() {
  return (
    <div className="page-not-found-control">
      <h1>404</h1>
      <h3>Oops! We can't find the page that you're looking for.</h3>
      <style jsx>
        {`
          @import "./src/assets/scss/index.scss";

          .page-not-found-control {
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

            h1 {
              font-size: 70px;
              margin: 0 auto 30px auto;
              color: $beige;
            }

            h3 {
              margin: 0 auto auto auto;
              font-size: 20px;
            }
          }
        `}
      </style>
    </div>
  );
}

export default PageNotFound;
