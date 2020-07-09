import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import JsPDF from 'jspdf';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import karlaBold from '../../assets/fonts/karla-bold';
import invitePoster from '../../assets/images/invite-poster.png';

function CommunityLink({
  location: {
    state: { communityCode, isRegistered },
  },
}) {
  const [invite, setInvite] = useState('');
  const [copySucceed, setCopySucceed] = useState(false);

  useEffect(() => {
    const inviteLink = `https://sharinghood.herokuapp.com/community/${communityCode}`;
    setInvite(inviteLink);
  }, [communityCode]);

  function copyToClipboard() {
    navigator.clipboard.writeText(invite);
    setCopySucceed(true);
  }

  function generatePDF() {
    // Create new jsPDF instance
    const doc = new JsPDF({
      orientation: 'p',
      unit: 'pt',
      format: 'a4',
    });

    // Add Karla-Regular font
    doc.addFileToVFS('Karla-Bold.ttf', karlaBold);
    doc.addFont('Karla-Bold.ttf', 'Karla', 'Bold');
    doc.setFont('Karla', 'Bold');

    // Title
    doc.setTextColor(233, 81, 29);
    doc.setFontSize(25);
    doc.text('Lieber Nachbar,', 298, 70, { align: 'center' });
    doc.setTextColor(64, 64, 64);
    doc.text('Dear Neighbour,', 298, 100, { align: 'center' });

    // Paragraph 1
    doc.setTextColor(233, 81, 29);
    doc.setFontSize(17);
    doc.text('Welche Gegenstände haben wir in unserem Haus,', 298, 160, {
      align: 'center',
    });
    doc.text('die wir miteinander teilen wollen?', 298, 180, {
      align: 'center',
    });
    doc.setTextColor(64, 64, 64);
    doc.text('What kind of items do we have in our building,', 298, 220, {
      align: 'center',
    });
    doc.text('which we would share with one another?', 298, 240, {
      align: 'center',
    });

    // Paragraph 2
    doc.setTextColor(233, 81, 29);
    doc.text('Um das rauszufinden, würde Ich Sie gerne zu meiner', 298, 300, {
      align: 'center',
    });
    doc.text('Sharinghood Community einladen.', 298, 320, { align: 'center' });
    doc.setTextColor(64, 64, 64);
    doc.text('To find this out, I would like to invite you', 298, 360, {
      align: 'center',
    });
    doc.text('to my Sharinghood community.', 298, 380, { align: 'center' });

    // Paragraph 3
    doc.setTextColor(233, 81, 29);
    doc.text('Wie nehme ich teil?', 298, 440, { align: 'center' });
    doc.setTextColor(64, 64, 64);
    doc.text('How do I join?', 298, 470, { align: 'center' });

    // Paragraph 3
    doc.setTextColor(233, 81, 29);
    doc.text('Folgen Sie diesem Link.', 298, 530, { align: 'center' });
    doc.setTextColor(64, 64, 64);
    doc.text('Follow this link.', 298, 560, { align: 'center' });

    // Invite link
    doc.setFontSize(15);
    doc.setTextColor(0, 0, 0);
    doc.text(`${invite}`, 298, 650, { align: 'center' });

    // Paragraph 4
    doc.setFontSize(17);
    doc.setTextColor(233, 81, 29);
    doc.text('Ich würde mich freuen wenn Sie uns begleiten!', 298, 740, {
      align: 'center',
    });
    doc.setTextColor(64, 64, 64);
    doc.text('I am looking forward to seeing you in the community!', 298, 770, {
      align: 'center',
    });

    // Footer
    doc.setFontSize(8);
    doc.text('What is Sharinghood? www.sharinghood.de', 298, 812, {
      align: 'center',
    });
    doc.text(
      'It is an online platform that allows neighbours to share items within their building. Only community members could see the uploaded items.',
      298,
      825,
      {
        align: 'center',
      },
    );

    // Save the pdf
    doc.save('invitation.pdf');
  }

  return (
    <div className="community-link-control">
      <div className="link-info">
        {!isRegistered && <h3>Your community has been created!</h3>}
        <div className="info-content">
          <p>Here is your link to the community.</p>
          <div className="community-link">
            <p className="invite-link">{invite}</p>
            <FontAwesomeIcon
              className="font-icon orange"
              icon={faCopy}
              onClick={copyToClipboard}
            />
          </div>
          {copySucceed && <p className="copy-tooltip">Copied!</p>}
          <p>
            Share this link with your neighbours or let them know through a
            little poster.
          </p>
          <button className="generate-pdf" onClick={generatePDF} type="button">
            Click here to generate a PDF to share with your neighbours
          </button>
          <img src={invitePoster} alt="Leave a poster on your door" />
        </div>
      </div>
      {!isRegistered && (
        <div className="link-register">
          <h5>Start sharing now.</h5>
          <Link
            to={{
              pathname: '/communities',
              state: {
                fromLogin: true,
              },
            }}
          >
            <button className="main-btn new" type="submit">
              Continue
            </button>
          </Link>
        </div>
      )}
      <style jsx>
        {`
          @import './src/assets/scss/index.scss';

          .community-link-control {
            margin: auto;
            display: flex;
            align-items: center;
            justify-content: space-between;

            @include lg {
              flex-direction: column;
              justify-content: center;
            }

            @include sm {
              margin-top: 0;
              justify-content: flex-start;
              align-items: stretch;
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

            .link-info {
              flex: 1;

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
                    color: $beige;
                  }

                  &.invite-link {
                    margin: 0 5px 0 0;
                    width: 315px;
                    font-size: 16px;
                    font-weight: 700;
                    text-decoration: underline;
                    overflow-wrap: break-word;

                    @include sm {
                      max-width: calc(80vw - 20px);
                    }
                  }
                }

                button.generate-pdf {
                  padding: 0;
                  border: none;
                  font-size: 16px;
                  color: $beige;
                  text-align: left;
                  background: $background;
                  text-decoration: underline;

                  &:hover {
                    cursor: pointer;
                  }
                }

                img {
                  display: block;
                  height: 300px;
                  margin: 20px auto;
                }

                .community-link {
                  display: flex;
                }
              }
            }

            .link-register {
              flex: 1;
              text-align: center;
              padding: 50px;
              float: right;
              background: $grey-200;
              margin: 40px;
              min-width: 250px;

              @include xl {
                margin: 20px;
              }

              @include lg {
                margin: 20px 0;
              }

              @include sm {
                margin: 0;
                padding: 30px;
              }

              h5 {
                margin: 20px 0 0 0;
                font-size: 18px;
              }
            }
          }
        `}
      </style>
    </div>
  );
}

CommunityLink.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      isRegistered: PropTypes.bool.isRequired,
      communityCode: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default CommunityLink;
