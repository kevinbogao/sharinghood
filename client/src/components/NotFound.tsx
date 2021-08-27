interface NotFoundProps {
  itemType: string;
}

export default function NotFound({ itemType }: NotFoundProps) {
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
