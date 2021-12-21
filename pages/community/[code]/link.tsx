import { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import JsPDF from "jspdf";
import { SVG } from "../../../components/Container";
import karlaBold from "../../../public/karla-bold";

export default function CommunityLink() {
  const router = useRouter();
  const inviteLink = `${process.env.NEXT_PUBLIC_DOMAIN}/community/${router.query.code}`;
  const [copySucceed, setCopySucceed] = useState(false);

  function copyToClipboard() {
    navigator.clipboard.writeText(inviteLink);
    setCopySucceed(true);
  }

  function generatePDF() {
    // Create new jsPDF instance
    const doc = new JsPDF({
      orientation: "p",
      unit: "pt",
      format: "a4",
    });

    // Add Karla-Regular font
    doc.addFileToVFS("Karla-Bold.ttf", karlaBold);
    doc.addFont("Karla-Bold.ttf", "Karla", "Bold");
    doc.setFont("Karla", "Bold");

    // Title
    doc.setTextColor(233, 81, 29);
    doc.setFontSize(25);
    doc.text("Lieber Nachbar,", 298, 70, { align: "center" });
    doc.setTextColor(64, 64, 64);
    doc.text("Dear Neighbour,", 298, 100, { align: "center" });

    // Paragraph 1
    doc.setTextColor(233, 81, 29);
    doc.setFontSize(17);
    doc.text("Welche Gegenstände haben wir in unserem Haus,", 298, 160, {
      align: "center",
    });
    doc.text("die wir miteinander teilen wollen?", 298, 180, {
      align: "center",
    });
    doc.setTextColor(64, 64, 64);
    doc.text("What kind of items do we have in our building,", 298, 220, {
      align: "center",
    });
    doc.text("which we would share with one another?", 298, 240, {
      align: "center",
    });

    // Paragraph 2
    doc.setTextColor(233, 81, 29);
    doc.text("Um das rauszufinden, würde Ich Sie gerne zu meiner", 298, 300, {
      align: "center",
    });
    doc.text("Sharinghood Community einladen.", 298, 320, { align: "center" });
    doc.setTextColor(64, 64, 64);
    doc.text("To find this out, I would like to invite you", 298, 360, {
      align: "center",
    });
    doc.text("to my Sharinghood community.", 298, 380, { align: "center" });

    // Paragraph 3
    doc.setTextColor(233, 81, 29);
    doc.text("Wie nehme ich teil?", 298, 440, { align: "center" });
    doc.setTextColor(64, 64, 64);
    doc.text("How do I join?", 298, 470, { align: "center" });

    // Paragraph 3
    doc.setTextColor(233, 81, 29);
    doc.text("Folgen Sie diesem Link.", 298, 530, { align: "center" });
    doc.setTextColor(64, 64, 64);
    doc.text("Follow this link.", 298, 560, { align: "center" });

    // Invite link
    doc.setFontSize(15);
    doc.setTextColor(0, 0, 0);
    doc.text(`${inviteLink}`, 298, 650, { align: "center" });

    // Paragraph 4
    doc.setFontSize(17);
    doc.setTextColor(233, 81, 29);
    doc.text("Ich würde mich freuen wenn Sie uns begleiten!", 298, 740, {
      align: "center",
    });
    doc.setTextColor(64, 64, 64);
    doc.text("I am looking forward to seeing you in the community!", 298, 770, {
      align: "center",
    });

    // Footer
    doc.setFontSize(8);
    doc.text("What is Sharinghood? www.sharinghood.de", 298, 812, {
      align: "center",
    });
    doc.text(
      "It is an online platform that allows neighbours to share items within their building. Only community members could see the uploaded items.",
      298,
      825,
      {
        align: "center",
      }
    );

    // Save the pdf
    doc.save("invitation.pdf");
  }

  return (
    <div className="community-link-control">
      <div className="info-content">
        <p>Here is your link to the community.</p>
        <div className="community-link">
          <p className="invite-link">{inviteLink}</p>
          <SVG className="copy-icon" icon="copy" onClick={copyToClipboard} />
        </div>
        {copySucceed && <p className="copy-tooltip">Copied!</p>}
        <p>
          Share this link with your neighbours or let them know through a little
          poster.
        </p>
        <button className="generate-pdf" onClick={generatePDF} type="button">
          Click here to generate a PDF to share with your neighbours
        </button>
        <div className="poster">
          <Image
            alt="A door with a poster"
            src="/invite-poster.png"
            layout="fill"
            objectFit="cover"
          />
        </div>
      </div>
      <style jsx>
        {`
          @import "../../index.scss";

          .community-link-control {
            margin: auto;
            display: flex;
            align-items: center;
            justify-content: center;

            .poster {
              height: 300px;
              width: 220px;
              position: relative;
              margin: 20px auto;
            }

            h3 {
              padding: 25px;
              font-size: 20px;
              background: $grey-200;
              text-align: center;
              width: 420px;

              @include sm {
                padding: 30px 10px;
                width: calc(100vw - 20px);
              }
            }

            .info-content {
              width: 350px;
              margin: auto;
              max-width: 80vw;

              @include sm {
                max-width: 80vw;
              }

              p {
                margin: 20px 0;

                &.copy-tooltip {
                  color: $orange;
                }

                &.invite-link {
                  flex: 1;
                  margin: 0;
                  font-size: 16px;
                  font-weight: 700;
                  text-decoration: underline;
                  overflow-wrap: break-word;
                }
              }

              button.generate-pdf {
                padding: 0;
                border: none;
                font-size: 17px;
                color: $beige-100;
                text-align: left;
                background: $background;
                text-decoration: underline;

                &:hover {
                  cursor: pointer;
                }
              }

              .community-link {
                display: flex;
                flex-direction: row;
                align-items: flex-start;
              }
            }
          }
        `}
      </style>
      <style jsx global>
        {`
          @import "../../index.scss";

          .copy-icon {
            color: $orange;
            margin-top: 3px;
            // margin: auto 12px;
            font-size: 22px;
            cursor: pointer;
            width: 14px;
          }
        `}
      </style>
    </div>
  );
}
