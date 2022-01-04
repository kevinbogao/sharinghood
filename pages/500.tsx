export default function Custom500() {
  return (
    <div className="page-not-found-control">
      <div className="invalid-link">
        <h1>5XX</h1>
        <h3>
          Oops! We&apos;re experiencing an error and we&apos;re working to fix
          it. Please come back later.
        </h3>
      </div>
      <style jsx>
        {`
          @import "../pages/index.scss";

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
